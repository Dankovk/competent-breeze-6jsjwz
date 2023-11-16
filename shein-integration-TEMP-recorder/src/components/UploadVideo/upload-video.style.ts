import styled from "styled-components";
import { type UploadStatusConfigKey } from "./upload-status-config";

export const MainWrapper = styled.div<{ status: UploadStatusConfigKey }>`
    position: relative;
    height: 100%;
    background: #FAFAFA;
    background-image: url(loader-bg.png);
    background-size: cover;
    background-repeat: no-repeat;
    height: 100%;
    font-family: 'SF UI Text', Helvetica, sans-serif;
    ${({ status }) => {
        if (status === "detectError") {
            return "background: transparent";
        } else if (status === "success") {
            return "display: none";
        }
        return "";
    }};
`;
export const Title = styled.div<{ isWhite?: boolean }>`
    color: ${({ theme, isWhite }) => isWhite ? theme.colors.white : theme.colors.titleColor};
    text-align: center;

    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px;
`;

export const Description = styled.div<{ isWhite?: boolean }>`
    color: ${({ theme, isWhite }) => isWhite ? theme.colors.white : theme.colors.descriptionColor};
    text-align: center;
    white-space: pre-line;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
`;

export const IconWrapper = styled.div``;

export const ContentWrapper = styled.div<{ status: UploadStatusConfigKey }>`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 12px;
    ${({ status }) => {
        if (status === "detectError") {
            return `
             border-radius: 8px;
             background: rgba(0, 0, 0, 0.80);
            `;
        }
        return "";
    }};
    width: 80%;
    max-width: 480px;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
`;

export const AnimationWrapper = styled.div`
    position: relative;
    width: 100%;
    border-radius: 16px;
    height: 20px;
    background: ${({ theme }) => theme.colors.white};
    max-width: 280px;
`;

export const AnimationLoader = styled.div`
    position: absolute;
    height: 20px;
    border-radius: 4px;
    // background-color: color(mint, 3);
    transition-property: width;
    transition-timing-function: ease-in-out;
    border-radius: 8px;
    background: linear-gradient(225deg, #5BFF7F 0%, #00CDC1 50.66%, #007CFF 100%);
`;

export const LogoWrapper = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translate(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 768px) {
    top: 0px;
    svg {
        width: 200px;
    }
 };
`;
