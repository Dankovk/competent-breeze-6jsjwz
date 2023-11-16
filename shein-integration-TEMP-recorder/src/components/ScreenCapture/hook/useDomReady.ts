import { useEffect, useState } from "react";

export const useDomReady = () => {
    const [domReady, setDomReady] = useState(false);

    useEffect(() => {
        const handleDomReady = () => {
            setDomReady(true);
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", handleDomReady);
        } else {
            // DOM is already ready
            setDomReady(true);
        }

        return () => {
            document.removeEventListener("DOMContentLoaded", handleDomReady);
        };
    }, []);

    return domReady;
};
