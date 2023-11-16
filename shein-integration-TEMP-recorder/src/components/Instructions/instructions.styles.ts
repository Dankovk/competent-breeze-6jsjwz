import styled from "styled-components";

export const InstructionContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  text-align: center;
  pointer-events: none;
  font-family: 'SF UI Text', Helvetica, sans-serif;
`;

export const InstructionDescription = styled.div`
    color: var(--white-100, #FFF);
    text-align: center;
    white-space: pre-line;
    /* Drop Shadow/Text */
    text-shadow: 0px 0px 16px #615B6F;
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 24px; /* 150% */
    pointer-events: none;
`;
