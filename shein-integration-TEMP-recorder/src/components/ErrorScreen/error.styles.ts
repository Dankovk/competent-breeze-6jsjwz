import styled from "styled-components";

export const MainWrapper = styled.div`
    position: relative;
    height: 100%;
    background: #FAFAFA;
    background-image: url(loader-bg.png);
    background-size: cover;
    background-repeat: no-repeat;
    font-family: 'SF UI Text', Helvetica, sans-serif;
`;

export const Title = styled.div`
    color:${({ theme }) => theme.colors.titleColor};
    text-align: center;

    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px;
`;

export const Description = styled.div`
    color: ${({ theme }) => theme.colors.descriptionColor};
    text-align: center;
    white-space: pre-line;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 16px;
`;

export const ContentWrapper = styled.div`
    padding: 0 16px;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
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
