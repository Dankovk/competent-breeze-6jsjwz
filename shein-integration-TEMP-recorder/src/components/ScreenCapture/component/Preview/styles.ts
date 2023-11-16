import styled from "styled-components";

export const PreviewRoot = styled.div``;

export const PreviewContent = styled.div<{ isActive?: boolean }>`
    transition: opacity .4s;
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    overflow: hidden;
    z-index: -9999;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    img, video {
      display: block;
      width: 100%;
      height: 100%;

    }
    ${({ isActive }) => {
        if (isActive) {
            return `
              opacity: 1;
              z-index: 4;
              pointer-events: all;
              -webkit-user-select: auto !important; /* Safari */
              -webkit-touch-callout: default !important; /* iOS Safari */
              -khtml-user-select: auto !important; /* Konqueror HTML */
              -ms-user-select: auto !important; /* Internet Explorer/Edge */
              -moz-user-select: auto !important; /* Old versions of Firefox */
              user-select: auto !important;
            `;
        }
        return "";
    }};
`;

export const Flash = styled.div<{ isActive?: boolean }>`
  display: block;
  visibility: hidden;
  position: absolute;
  opacity: 0.7;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  pointer-events: none;
  z-index: 5;
  transition: opacity 0.3s linear;

  ${({ isActive }) => {
        if (isActive) {
            return `
              visibility: visible;
              opacity: 0;
              transition: opacity 0.3s linear;
            `;
        }
        return "";
    }};
`;

export const VideoPreview = styled.video<{ $loading?: boolean }>`
  object-fit: contain;
  transition: all .5s linear;
  background-color: ${({ $loading }) => $loading ? "transparent" : "black"};
`;
