export const CANCELABLE_DECORATOR_ERROR_MESSAGE = "Load promise canceled";

export const cancelable = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    let cancelPromise: CallbackFunctionVariadic = () => {};
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        return await new Promise<any>((resolve, reject) => {
            cancelPromise();
            cancelPromise = () => {
                reject(new Error(CANCELABLE_DECORATOR_ERROR_MESSAGE));
            };
            originalMethod.apply(this, args).then(resolve);
        }).catch((e) => {
            throw new Error(e?.toString());
        });
    };
    return descriptor;
};

export const sendLogWithCancelableFilter = (e) => {
    const message = e?.toString();
    if (!message?.includes(CANCELABLE_DECORATOR_ERROR_MESSAGE)) {
        console.error("Load model error: ", e?.toString());
        return false;
    }
    return null;
};
