const TerserPlugin = require("terser-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const CssPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
// const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const pkg = require("./package.json");

// For more information about plugin concepts, see: https://github.com/jantimon/html-webpack-plugin#events
class HtmlTagAttributesPlugin {
  static name = "HtmlTagAttributesPlugin";

  constructor(options) {
    const defaultOptions = {
      script: {},
    };

    this.options = { ...defaultOptions, ...options };
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      HtmlTagAttributesPlugin.name,
      (compilation) => this._hookIntoHtmlAlterAssetTags(compilation),
    );
  }

  _hookIntoHtmlAlterAssetTags(compilation) {
    HtmlPlugin.getHooks(compilation).alterAssetTags.tapAsync(
      HtmlTagAttributesPlugin.name,
      (data, cb) => cb(null, this._extendScriptTags(data)),
    );
  }

  _extendScriptTags(data) {
    data.assetTags.scripts = data.assetTags.scripts.map(
      ({ attributes, ...other }) => ({
        ...other,
        attributes: {
          ...attributes,
          ...this.options.script,
        },
      }),
    );

    return data;
  }
}

const config = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        include: path.resolve(__dirname, "src"),
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-typescript"],
          },
        },
      },
      {
        test: /\.css/,
        use: [
          { loader: CssPlugin.loader },
          {
            loader: "css-loader",
            options: { url: false },
          },
        ],
      },
      {
        test: /\.(png|gif|mp4|jpg|otf|ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "static/media/[name].[hash].[ext]",
            },
          },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: /\.[jt]sx$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript"],
            },
          },
          {
            loader: "react-svg-loader",
            options: {
              jsx: true, // true outputs JSX tags
              svgo: { plugins: [{ removeViewBox: false }] },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    extensions: [".ts", ".tsx", ".js", "jsx", "mjs"],
    alias: {
      "../Inputs/scene.inputManager": path.resolve(
        __dirname,
        "./src/utils/scene.inputManager",
      ),
      "../Inputs/scene.inputManager.js": path.resolve(
        __dirname,
        "./src/utils/scene.inputManager.js",
      ),
      "./Inputs/scene.inputManager": path.resolve(
        __dirname,
        "./src/utils/scene.inputManager",
      ),
      "./Inputs/scene.inputManager.js": path.resolve(
        __dirname,
        "./src/utils/scene.inputManager.js",
      ),

      "@ffmpeg/ffmpeg": [
        path.resolve(
          __dirname,
          "node_modules/@ffmpeg/ffmpeg/dist/umd/ffmpeg.js",
        ),
      ],
      "@ffmpeg/util": [
        path.resolve(__dirname, "node_modules/@ffmpeg/util/dist/umd/index.js"),
      ],
      "@": path.resolve(__dirname, "src"),
    },
    fallback: {
      crypto: false,
      path: false,
      fs: false,
    },
  },
  output: {
    filename: "index.js",
    chunkFilename: "[name].js",
    path: path.resolve(__dirname, "build"),
  },
  plugins: [
    new HtmlPlugin({
      template: "src/index.html",
      title: pkg.title || "Engeenee Pose Demo",
      meta: { description: pkg.description || "Engeenee Pose demo" },
    }),
    new HtmlTagAttributesPlugin({
      script: {
        onerror: `(function() { 
                window.parent.postMessage({ type: 'vto-error', code: 6, message: 'Probably cache issue' }, '*');  
              })()`,
      },
    }),
    new CssPlugin(),
    new webpack.DefinePlugin({
      "process.env.SENTRY_DSN": JSON.stringify(process.env.SENTRY_DSN) || "''",
      "process.env.LOGDNA_KEY": JSON.stringify(process.env.LOGDNA_KEY) || "''",
      "process.env.ENV": JSON.stringify(process.env.ENV) || "''",
      "process.env.SDK_TOKEN": JSON.stringify(process.env.SDK_TOKEN) || "''",
      "process.env.SDK_TOKEN_ADS":
        JSON.stringify(process.env.SDK_TOKEN_ADS) || "''",
      "process.env.MODELS_BASE_PATH":
        JSON.stringify(process.env.MODELS_BASE_PATH) || "''",
      "process.env.VERSION": JSON.stringify(process.env.VERSION) || "''",
    }),
  ],
};

module.exports = (_, argv) => {
  const isDevelopment = argv.mode === "development";

  config.mode = argv.mode;
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(argv.mode),
    }),
  );

  if (isDevelopment) {
    config.devtool = "source-map";
    config.devServer = { port: 3000, allowedHosts: "all" };
    config.output.devtoolModuleFilenameTemplate =
      "file:///[absolute-resource-path]";
  } else {
    config.output = {
      ...config.output,
      filename: "index.[contenthash].js",
      chunkFilename: "[name].[contenthash].js",
    };
    config.optimization = {
      splitChunks: {
        chunks: "all",
        name: (module, chunks, cacheGroupKey) => {
          const allChunksNames = chunks.map((item) => item.name).join("~");
          return `${cacheGroupKey}-${allChunksNames}`;
        },
      },
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: { compress: true, mangle: {} },
        }),
      ],
    };
    config.plugins.push(
      new CopyPlugin({
        patterns: ["public"],
      }),
    );
  }

  return config;
};
