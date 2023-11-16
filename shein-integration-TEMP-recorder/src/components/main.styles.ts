import styled from "styled-components";

export const Button = styled.div<{ viewType: "primary" | "secondary" }>`
  position: relative;
  ${({ viewType }) => {
        if (viewType === "secondary") {
            return `
                background: #FFF;
                border: 2px solid #222;
                color: #222;
                padding: 10px 8px;
            `;
        }
        return `
            background: #222;
            color: #FFF;
            padding: 12px 8px;
            border: none;
        `;
    }}
  text-transform: uppercase;
  display: flex;
  width: 320px;
  font-size: 16px;
  line-height: 20px;
  font-weight: 700;
  justify-content: center;
  align-items: center;
  background-blend-mode: overlay, normal;
  cursor: pointer;
  box-shadow: 0px 2px 4px -1px rgba(133, 130, 147, 0.50);
  
  svg {
    margin-right: 8px;
  }

  &:hover {
    ${({ viewType }) => (viewType === "primary" ? "background: #4E4E4E;" : "color: #4E4E4E; border: 2px solid #4E4E4E; ")}
  }
;
  @media (max-width: 768px) {
    width: calc(100% - 24px);
    padding: 20px 12px;
    ${({ viewType }) => {
        if (viewType === "secondary") {
            return `
                width: calc(100% - 22px);
                padding: 18px 10px;
            `;
        }
        return `
            width: calc(100% - 24px);
            padding: 20px 12px;
        `;
    }}
  };
`;

export const ButtonsWrapper = styled.div`
    position: absolute;
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    padding: 40px;
    justify-content: center;
    align-items: flex-end;
    gap: 16px;
    align-self: stretch;
    @media (max-width: 768px) {
        width: calc(100% - 80px);
        flex-direction: column;
    };
`;
