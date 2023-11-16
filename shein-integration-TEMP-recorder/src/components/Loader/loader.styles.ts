import styled from "styled-components";

export const LoaderBlurWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 100;
    background: rgba(225, 225, 225, 0.2);
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    font-family: 'SF UI Text', Helvetica, sans-serif;

`;

export const LoaderAnimation = styled.div`
    @keyframes spin{
    0%{
      transform:scale(1);
    }
    50%{
      transform: scale(0.6);
    }

    100%{
      transform: scale(1);
    } 
  }
  
  height: 50px;

  svg {
    animation: 1.5s infinite spin;
    transform-origin: center;
  }
`;
