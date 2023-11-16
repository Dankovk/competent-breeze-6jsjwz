import styled from 'styled-components';

export const LoadingScreenRoot = styled.div`
  background: rgba(153, 153, 153, 0.15);
  backdrop-filter: blur(15px);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content:center;
  align-items: center;
  z-index: 5;
`;
