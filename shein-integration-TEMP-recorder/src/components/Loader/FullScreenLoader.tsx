import observer from "@/store/observer.component";
import React from "react";
import { LoaderAnimation, LoaderBlurWrapper } from "./loader.styles";
import { CircleLoader } from "./CircleLoader";

export const FullScreenLoader = observer(({ fullScreenLoaderShow }: { fullScreenLoaderShow: boolean }) => {
    if (!fullScreenLoaderShow) {
        return null;
    }
    return <LoaderBlurWrapper>
        <LoaderAnimation>
            <CircleLoader />
        </LoaderAnimation>
    </LoaderBlurWrapper>;
}, ["fullScreenLoaderShow"]);
