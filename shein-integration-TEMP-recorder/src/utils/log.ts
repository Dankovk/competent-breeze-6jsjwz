import { MESSAGES } from "@/constants";

export const getLoadingTime = (start: number, end: number) => (end - start) / 1000;

const log = (isEnabled: boolean) => (message: string, sendingToParentData: unknown = null) => {
    isEnabled && console.log(message);
    sendingToParentData && window.parent.postMessage({ type: MESSAGES.EVENT, ...sendingToParentData }, "*");
};

export default log;
