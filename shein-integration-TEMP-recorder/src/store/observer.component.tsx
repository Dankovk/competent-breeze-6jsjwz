import React, { memo, useEffect, useState } from "react";

import { store } from "./store";

export const observer = (
    // @ts-ignore
    Component: any,
    depedencyNames: string[]
) => memo(function ObserverdComponent (props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, forceUpdate] = useState(0);

    // @ts-expect-error
    const depedencies = depedencyNames.reduce((acc, curr) => { acc[curr] = store[curr]; return acc; }, {});

    const renderOutput = <Component { ...props } {...depedencies}/>;

    useEffect(() => {
        depedencyNames.forEach((prop) => {
            store.observe(prop, () => { forceUpdate((count) => count + 1); });
        });
        // @TODO: finish and test unobserve
        // Optionally, you can add cleanup logic here
        // return () => {
        //     console.log('Accessed Properties in useEffect Cleanup:', accessedProperties); // Debug
        //     Remove observers for each accessed property
        //     accessedProperties.forEach((prop) => {
        //         // state.unobserve(prop);
        //     });
        // };
    }, []);

    return renderOutput;
});

export default observer;
