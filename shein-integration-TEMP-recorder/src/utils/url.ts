// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
const base = process.env.MODELS_BASE_PATH || "";

export const prependBaseToUrl = (path: string) => base + path;

export const getEnvironmentUrl = (name: string) => prependBaseToUrl(`environments/${name}`);
