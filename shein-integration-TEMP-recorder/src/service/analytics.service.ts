// @ts-ignore
import { TelemetryDeck } from "@telemetrydeck/sdk";
import { store } from "@/store/store";

const getUserUUID = () => {
    const userId = localStorage.getItem("userId") ?? self.crypto.randomUUID();
    localStorage.setItem("userId", userId);
    return userId;
};

const td = new TelemetryDeck({ app: "D2C3176C-2D9F-49DA-B812-0FC432CCB342", user: getUserUUID() });

const searchParams = new URLSearchParams(document.location.search);
const isTeads = searchParams.has("teads");
class _AnalyticsService {
    constructor () {
        if (store.isAds && isTeads) {
            td.signal();
        }
    }

    triggerEvent = (name: string, value: Record<string, any> = {}) => {
        if (store.isAds) {
            // @ts-ignore
            gtag("event", name, value);
            if (isTeads) {
                delete value?.non_interaction;
                td.signal({ type: name, ...value });
            }
        }
    };

    runHeartbeatEvents = () => {
        if (!store.isAds) {
            return;
        }
        let lastTriggeredTimeoutValue = 0;
        const timeoutValues = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 105, 120, 150, 180, 210, 240, 270, 300, 360, 420, 480, 540, 600, 960, 1800];
        let timeouts: any[] = [];

        const startHeartbeat = () => {
            timeouts = timeoutValues.map(intervalValue => {
                return setTimeout(() => {
                    this.triggerEvent(`time_spend_${intervalValue}`, { non_interaction: true });
                    lastTriggeredTimeoutValue = intervalValue;
                }, intervalValue * 1000);
            });
        };

        const stopHeartbeat = () => {
            timeouts.forEach(timeout => {
                clearInterval(timeout);
            });
            timeouts = [];
        };

        const resumeHeartbeat = () => {
            const filteredList = timeoutValues.filter(el => el > lastTriggeredTimeoutValue);
            timeouts = filteredList.map(intervalValue => {
                return setTimeout(() => {
                    this.triggerEvent(`time_spend_${intervalValue}`, { non_interaction: true });
                    lastTriggeredTimeoutValue = intervalValue;
                }, (intervalValue - lastTriggeredTimeoutValue) * 1000);
            });
        };

        // Start heartbeat when the canvas is in view
        startHeartbeat();

        // Stop heartbeat when the user navigates away
        window.addEventListener("visibilitychange", function () {
            if (document.visibilityState === "hidden") {
                stopHeartbeat();
            } else {
                resumeHeartbeat();
            }
        });
    };
}

export const AnalyticsService = new _AnalyticsService();
