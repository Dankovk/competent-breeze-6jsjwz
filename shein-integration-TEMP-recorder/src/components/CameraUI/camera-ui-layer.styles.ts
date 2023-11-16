import styled from "styled-components";

export const GradientButton = styled.button<{ width?: string, maxWidth?: string }>`
  background: linear-gradient(225deg, #16D8F5 0%, #007CFF 47.43%, #8E53FF 92.96%);
  border-radius: 12px;
  border: none;
  padding: 14px;
  cursor: pointer;

  font-family: 'SF UI Text';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.white};

  width: ${({ width }) => width ?? "fit-content"};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ maxWidth }) => maxWidth ? `max-width: ${maxWidth};` : ""};
  &:hover {
      background: linear-gradient(225deg, #41F5EE 8.93%, #8E53FF 100%);
  }
`;

export const BlurButton = styled.button<{ width?: string, height?: string }>`
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  width: ${({ width }) => width ?? "fit-content"};
  height: ${({ height }) => height ?? "fit-content"};

  background: rgba(85, 85, 85, 0.2);
  mix-blend-mode: normal;
  backdrop-filter: blur(16px);
  cursor: pointer;
`;

export const SecondRowButton = styled(BlurButton)`
  position: fixed;
  top: 16px;
  left: 16px;
`;

export const SwitchCameraButton = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 40px;
  height: 40px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.80);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.08);
  border: none;
  cursor: pointer;
  z-index: 1;
`;
