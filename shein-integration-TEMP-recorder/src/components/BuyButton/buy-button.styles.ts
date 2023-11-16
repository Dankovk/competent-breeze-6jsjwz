import styled from "styled-components";

export const BuyButtonStyled = styled.span`
    position: absolute;
    bottom: 26px;
    left: 50%;
    transform: translate(-50%);
    width: 296px;
    height: 60px;
    gap: 4px;
    background: #222222;
    color: white;
    text-decoration: none;
    border: none;
    text-transform: uppercase;
    display: flex;
    font-size: 24px;
    line-height: 24px;
    font-weight: 700;
    justify-content: center;
    align-items: center;
    background-blend-mode: overlay, normal;
    cursor: pointer;
    
    svg {
        width: 32px;
        height: 32px;
    }

  &:hover {
    background: #4E4E4E;
  }

  @media (max-width: 350px) {
    transform: translate(-50%) scale(0.7);

    
  }
`;
