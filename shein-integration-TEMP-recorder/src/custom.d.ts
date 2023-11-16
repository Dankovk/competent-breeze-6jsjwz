declare module "*.svg" {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}
declare type CallbackFunctionVariadic = (...args: any[]) => any;
