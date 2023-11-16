import React from "react";
import { ContentWrapper, Description, LogoWrapper, MainWrapper, Title } from "./error.styles";
import { SheinLogo } from "@/assets/shein-logo";
import { ErrorIcon } from "@/assets/error.icon";

export const ErrorScreen = () => {
    return <MainWrapper >
        <LogoWrapper>
            <SheinLogo />
        </LogoWrapper>
        <ContentWrapper>
            <ErrorIcon color="#FF5E7B"/>
            <Title>Ooops, something went wrong</Title>
            <Description>Please try again a little bit later. We are working to solve the issue.</Description>
        </ContentWrapper>
    </MainWrapper>; ;
};
