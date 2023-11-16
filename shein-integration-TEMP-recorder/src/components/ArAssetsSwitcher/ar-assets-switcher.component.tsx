import "swiper/css/bundle";
import React, { useEffect, useRef, useState } from "react";
import { type Swiper, SwiperSlide } from "swiper/react";
import {
    ButtonBlurBackground,
    Item, SwiperStyled, Wrapper
} from "./ar-assets-switcher.styles";
// @TODO: Remove direct import of store
import { store, type SwitchOption } from "@/store/store";
import { CircleLoader } from "../Loader/CircleLoader";
import { getModelNameBySKU } from "@/utils/skuHelper";
import { EVENTS } from "@/constants";

export const ArAssetsSwitcher = () => {
    const { log } = store;
    const [swiperInstance, setSwiperInstance] = useState<typeof Swiper | null>(null);
    const [activeItem, setActiveItem] = useState<SwitchOption>(store.switchOptions[0]);
    const [isLoadingModelId, setIsLoadingModelId] = useState("");

    const wasSwitched = useRef(false);
    const openCurrentScene = async (item: SwitchOption, index?: number) => {
        if (item.id === store.currentModelId && !wasSwitched.current) {
            setActiveItem(item);
            return;
        }
        wasSwitched.current = true;
        setActiveItem(item);
        setIsLoadingModelId(item.id);
        // @ts-expect-error
        const isSuccess = await store.renderer?.loadModel(store.currentModelId, index);
        if (isSuccess) { setIsLoadingModelId(""); }
    };

    useEffect(() => {
        if (swiperInstance != null) {
            // @ts-ignore
            const index = store.switchOptions.findIndex(o => o.id === store.currentModelId);
            if ((swiperInstance != null) && index !== undefined) {
                // @ts-ignore
                swiperInstance.slideTo(index, undefined, false);
            }
        }
    }, [swiperInstance]);

    const content = store.switchOptions
        .map((currentAsset: SwitchOption, index) => (
            <SwiperSlide key={index}>
                <ButtonBlurBackground/>
                <Item
                    active={ activeItem.id === currentAsset?.id }
                    onClick={() => {
                        if ((swiperInstance != null) && index !== undefined) {
                            // @ts-expect-error swiper-wrong-time
                            swiperInstance?.slideTo(index);
                        }
                        // openCurrentScene(currentAsset, index);
                    }}
                >
                    {
                        <>
                            <CircleLoader style={{ display: isLoadingModelId === currentAsset.id ? "block" : "none" }} />

                            <img style={{ display: isLoadingModelId === currentAsset.id ? "none" : "block" }} src={`previews/${getModelNameBySKU(store.currentModelId, index)}.png`} alt="Asset thumbnail"/>
                        </>
                    }
                </Item>
            </SwiperSlide>
        ));

    return (
        <Wrapper id="ar-assets-switcher">
            <SwiperStyled
                // @ts-ignore
                initialSlide={store.switchOptions.findIndex(o => o.id === store.currentModelId)}
                centeredSlides
                slidesPerView={ 7 }
                direction="horizontal"
                simulateTouch
                // @ts-expect-error wrong-type
                onSwiper={setSwiperInstance}
                onSlideChange={(swiper) => {
                    const choosedItem = store.switchOptions[swiper.activeIndex];

                    log(EVENTS.STYLE_SWITCH, { eventName: EVENTS.STYLE_SWITCH, eventData: { choosedItem: choosedItem.id } });
                    openCurrentScene(choosedItem, swiper.activeIndex);
                }}
            >
                {content}
            </SwiperStyled>
        </Wrapper>
    );
};
