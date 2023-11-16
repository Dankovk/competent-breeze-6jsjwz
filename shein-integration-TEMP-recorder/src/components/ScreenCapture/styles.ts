import styled from "styled-components";

export const ScreenCaptureRoot = styled.div<{ scale?: number }>`
  width: 100%;
  height: 100%;

  .screen-capture-ui {
    display: flex;
    flex-direction: row;
    position: absolute;
    bottom: 15px;
    width: auto;
    align-items: center;
    left: 50%;
    z-index: 4;
    transform: translateX(-50%);
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    pointer-events: all;
  }

  .screen-capture {
    opacity: 1;
    width: 100%;
    height: 100%;
    z-index: 4;

    &__swap-camera--block {
      position: absolute;
      bottom: 20px;
      left: -85px;
      margin: 0 auto;
      color: #fff;
      width: 50px;
      text-align: center;
    }

    @keyframes snap-pulse {
      0% {
        transform: scale(1, 1);
      }

      40% {
        transform: scale(1.1, 1.1);
      }

      100% {
        transform: scale(1, 1);
      }
    }

    @-webkit-keyframes snap-pulse {
      0% {
        transform: scale(1, 1);
      }

      40% {
        transform: scale(1.1, 1.1);
      }

      100% {
        transform: scale(1, 1);
      }
    }

    @-webkit-keyframes snap-shadow-pulse {
      0% {
        -webkit-box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.25);
      }
      70% {
        -webkit-box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
      }
      100% {
        -webkit-box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }
    @keyframes snap-shadow-pulse {
      0% {
        -moz-box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.25);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
      }
      70% {
        -moz-box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
        box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
      }
      100% {
        -moz-box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
      }
    }

    &__download-info {
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      color: #fff;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
      transform: translate(-50%, -50%);
      font-size: 20px;
      white-space: nowrap;
      text-align: center;
      line-height: 26px;
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Old versions of Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none;


      &__download-link {
        //display: none;
      }
    }

    .play-img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8vw;
      height: auto;
    }
  }
`;

export const RecordingIndicatorWrapper = styled.div`
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  width: 55px;
  height: 55px;
  transform: translate(-50%, -50%);

  svg {
    transform: rotate(-90deg);
  }

  circle {
    fill: none;
    stroke: white;
    stroke-width: 2px;
    stroke-dasharray: 150;
    stroke-dashoffset: 150;
    stroke-linecap: round;
    animation: anim 20s linear infinite;
  }

  animation: appear .2s;
  @keyframes appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes anim {
    50% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -150;
    }
  }
`;

const sizeSpacer = "6px";
const bigSpacer = "70px";

export const CameraActionsContainer = styled.div<{ left: boolean, right: boolean }>`
  width: 118px;
  padding: 3px;
  border-radius: 40px;
  background: rgba(85, 85, 85, 0.2);;
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: space-around;

  &:before {
    //content: "";
    position: absolute;
    top: ${sizeSpacer};
    left: ${sizeSpacer};
    right: ${bigSpacer};
    //right: 5px;
    //left: 70px;
    bottom: ${sizeSpacer};
    border-radius: 40px;
    border: 2px solid transparent;
    background: linear-gradient(180deg, #FFE8F4 0%, #FDADFF 50%, #FDADFF 50%, #FDADFF 50.01%, #8DDBFF 100%) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;

    @keyframes rightSizeAnim {
      0% {
        right: ${bigSpacer};
      }
      50% {
        right: ${sizeSpacer};
        left: ${sizeSpacer};
      }
      100% {
        left: ${bigSpacer};
        right: ${sizeSpacer};
      }
    }

    @keyframes leftSizeAnim {
      0% {
        left: ${bigSpacer};
        right: ${sizeSpacer}
      }
      50% {
        left: ${sizeSpacer};
        right: ${sizeSpacer};
      }
      100% {
        right: ${bigSpacer};
        left: ${sizeSpacer};
      }
    }
    ${({ right }) => (right !== undefined && right ? "animation: rightSizeAnim 1s forwards" : "")}
    ${({ left, sizeSpacer }) => (left !== undefined && left ? `left: 70px; right: ${sizeSpacer};` : "")}
    ${({ left }) => (left !== undefined && left ? "animation: leftSizeAnim 1s forwards" : "")}
  }
`;

export const CameraIconWrapper = styled.div<{ active?: boolean }>`
  position: relative;
  width: 57px;
  height: 57px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .4s;

  path {
    fill: #fff
  }
`;

export const TimerText = styled.div<{ visible?: boolean }>`
  position: absolute;
  top: 50%;
  right: -50px;
  transform: translateY(-50%);
  font-family: 'SF UI Text', sans-serif;
  font-weight: bold;
  font-size: 16px;
  color: white;
  transition: all .5s linear;
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  text-align: left;
`;

export const PreviewModalRoot = styled.div`
  max-width: 270px;
  background: rgba(85, 85, 85, 0.2);
  backdrop-filter: blur(15px);
  border-radius: 30px;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  font-family: 'Montserrat', sans-serif;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  color: white;
  padding: 30px 20px 20px 20px;
  text-align: center;
  line-height: 25px;
`;

export const ToggleAnimWrapper = styled.div.attrs({ name: "animation-toggle" })`
  position: absolute;
  left: 0;
  top: -1px;

  svg {
    height: 65px !important;
  }

  path {
    stroke: #fff
  }
`;

export const CameraAnimContainer = styled.div<{ active?: boolean }>`
  z-index: -1;
  position: absolute;
  left: 0;
  top: -1px;
  transition: opacity .4s;

  svg {
    height: 65px !important;
  }

  path {
    stroke: #FFF
  }
`;

export const VideoRecordingIndicatorContainer = styled.div<{ visible: boolean }>`
  position: absolute;
  left: 0;
  top: -1px;
  z-index: -1;

  transition: opacity .5s linear;

  svg {
    height: 65px !important;
  }

  path {
    stroke: #FFF;
    stroke-width: 3px;
  }

  opacity: ${({ visible }) => (visible ? "1" : "0")};
`;

export const CountdownContainer = styled.div.attrs({ className: "countdown-container" })`
  display: flex;
  flex-direction: column-reverse;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 100%;
  height: auto;

  svg {
    filter: drop-shadow(0px 0px 15px #675667BF);
  }
`;

export const CountdownText = styled.div.attrs({ className: "countdown-text" })<{ isVisible?: boolean }>`
    pointer-events: none;
    font-size: 16px;
    line-height: 24px;
    font-weight: 700;
    text-shadow: rgb(97, 91, 111) 0px 0px 16px;
    color: #FFFFFF;
    text-align: center;
    opacity: ${(p) => p?.isVisible ? "1" : "0"};
    transition: opacity .3s ease-in-out;
  `;

export const CameraPulseContainer = styled.div<{ active?: boolean }>`
  z-index: -1;
  position: absolute;
  left: 0;
  top: -1px;
  transition: opacity .4s;

  svg {
    height: 65px !important;
  }

  opacity: ${({ active }) => (active ? "1" : "0")};
`;

export const LoaderWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  backdrop-filter: blur(30px);
`;
