import * as React from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import Icon from "./Icon";

export interface ISpinnerProps {
  className?: string;
  small?: boolean;
}

const Spinner: React.SFC<ISpinnerProps> = ({ className, small }) => (
  <Container className={className} small={small}>
    <Icon name="spinner" />
  </Container>
);

export default Spinner;

/* styled components */

const rotation = keyframes`
  from {
    -webkit-transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
  }
`;

const Container = styled.div<{ small?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 25;

  svg {
    animation: ${rotation} 2s ease infinite;
    width: ${props => (props.small ? 150 : 200)}px;
    height: ${props => (props.small ? 150 : 200)}px;
  }
`;
