import styled from "styled-components";
import { Swiper } from "swiper/react";

export const Wrapper = styled.div`
    position: absolute;
    width: 100%;
    max-width: 560px;
    overflow: hidden;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    
    * {
      box-sizing: unset;
    }
    .swiper-wrapper {
      display: flex;
    }
`;

const CircleTemplate = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  min-width: 60px;
`;

export const ButtonBlurBackground = styled(CircleTemplate)`
  position: absolute;
  //background: rgb(222, 228, 246);
`;

export const Item = styled(CircleTemplate)<{ active?: boolean, isAddNew?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    backdrop-filter: blur(16px);
    ${({ active }) => active && "border: 2px solid white"};
    background-color: ${({ theme, isAddNew }) => (isAddNew ? "black" : "rgba(85, 85, 85, 0.2)")};
    ${({ active }) => active && "opacity: 1"};

    cursor: pointer;

    img {
        height: 56px;
        width: 56px;
        object-fit: cover;
        border-radius: 50%;
    }
`;

export const SwiperStyled = styled(Swiper)`
    &.swiper-container {
        width: 100%;
        padding: 5px 0;
    }
  &.swiper-initialized {
    width: 100%;
  }
  .swiper-slide {
    width: 80px !important;
  }
    .swiper-slide {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .swiper-button-next {
        right: -5px;
    }

    .swiper-button-prev {
        left: -5px;
    }

    .swiper-button-next:after,
    .swiper-button-prev:after {
        font-size: 15px;
        font-weight: bolder;
        color: black;
    }
`;
