import React from "react";
import observer from "@/store/observer.component";
import { BuyButtonStyled } from "./buy-button.styles";
import { BuyButtonIcon } from "./buy-button.icon";
import { AnalyticsService } from "@/service/analytics.service";

export const BuyButton = observer(({ buyUrl }: { buyUrl: string }) => {
    return <BuyButtonStyled onClick={() => {
        window.open(buyUrl, "_blank");
        AnalyticsService.triggerEvent("buy_click", {
            event_value: buyUrl
        });
    }}>
        <BuyButtonIcon/>
        Buy
    </BuyButtonStyled>;
}, ["buyUrl"]);
