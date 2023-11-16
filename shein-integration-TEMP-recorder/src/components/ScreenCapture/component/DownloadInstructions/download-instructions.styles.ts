import styled from "styled-components";

export const ModalRoot = styled.div`
    font-family: 'SF UI Text', Helvetica, sans-serif;

  max-width: 320px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.80);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  width: 320px;
  padding: 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;

  color: var(--white-100, #FFF);
  text-align: center;

  /* Drop Shadow/Text */
  text-shadow: 0px 0px 16px #615B6F;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
  white-space: pre-line;


`;
