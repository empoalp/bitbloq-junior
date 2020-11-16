import React, { FC } from "react";
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { colors, Icon } from "@bitbloq/ui";

export interface IMenuButtonProps {
  className?: string;
  isOpen: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const MenuButton: FC<IMenuButtonProps> = props => {
  return (
    <Button {...props}>
      <Icon name="ellipsis" />
    </Button>
  );
};

export default MenuButton;

/** styled components */

const Button = styled.div<IMenuButtonProps>`
  align-items: center;
  background-color: white;
  border: 1px solid ${colors.gray6};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  height: 34px;
  justify-content: center;
  width: 34px;

  &:hover {
    background-color: ${colors.gray7};
  }

  ${props =>
    props.isOpen &&
    css`
      background-color: ${colors.gray7};
    `}

  svg {
    transform: rotate(90deg);
  }
`;
