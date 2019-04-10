import * as React from "react";
import TetherComponent from "react-tether";
import styled from "@emotion/styled";
import { css } from "@emotion/core";

interface ContainerProps {
  position: string;
}
const Container = styled.div<ContainerProps>`
  background-color: #373b44;
  border-radius: 2px;
  pointer-events: none;
  color: white;
  font-size: 12px;
  padding: 10px;
  text-align: center;
  margin-top: 16px;
  line-height: normal;
  max-width: 220px;

  i,
  em {
    color: #4dc3ff;
  }

  &::before {
    content: "";
    background-color: #373b44;
    width: 8px;
    height: 8px;
    display: block;
    position: absolute;
    transform: translate(-50%, 0) rotate(45deg);
    top: 12px;
    left: 50%;

    ${(props: ContainerProps) =>
      props.position === "right" &&
      css`
        transform: translate(0, -50%) rotate(45deg);
        top: 50%;
        left: 12px;
      `};

    ${(props: ContainerProps) =>
      props.position === "left" &&
      css`
        transform: translate(0, -50%) rotate(45deg);
        top: 50%;
        right: 12px;
        left: auto;
      `};

    ${(props: ContainerProps) =>
      props.position === "top" &&
      css`
        transform: translate(-50%, 0) rotate(45deg);
        bottom: 12px;
        top: auto;
      `};
  }

  ${(props: ContainerProps) =>
    props.position === "right" &&
    css`
      margin-top: 0px;
      margin-left: 16px;
    `};

  ${(props: ContainerProps) =>
    props.position === "left" &&
    css`
      margin-top: 0px;
      margin-right: 16px;
    `};

  ${(props: ContainerProps) =>
    props.position === "top" &&
    css`
      margin-top: 0px;
      margin-bottom: 16px;
    `};
`;

const attachmentPostion = {
  top: "bottom center",
  bottom: "top center",
  left: "middle right",
  right: "middle left"
};

const targetPosition = {
  top: "top center",
  bottom: "bottom center",
  left: "middle left",
  right: "middle right"
};

export interface TooltipChildrenProps {
  ref?: React.RefObject<HTMLDivElement>;
  onMouseOver?: (ev: React.MouseEvent) => void;
  onMouseOut?: (ev: React.MouseEvent) => void;
}

export interface TooltipProps {
  className?: string;
  content: React.ReactChild;
  position?: string;
  children: (props: TooltipChildrenProps) => React.ReactChild;
  isVisible?: boolean;
}

interface State {
  isVisible: boolean;
}

class Tooltip extends React.Component<TooltipProps, State> {
  state = {
    isVisible: this.props.isVisible !== undefined ? this.props.isVisible : false
  };

  componentDidUpdate(prevProps: TooltipProps) {
    if (
      this.props.isVisible !== undefined &&
      prevProps.isVisible !== this.props.isVisible
    ) {
      this.setState({ isVisible: this.props.isVisible });
    }
  }

  onMouseOver = () => {
    if (this.props.isVisible === undefined) {
      this.setState({ isVisible: true });
    }
  };

  onMouseOut = () => {
    if (this.props.isVisible === undefined) {
      this.setState({ isVisible: false });
    }
  };

  render() {
    const { isVisible } = this.state;
    const { className, children, content, position = "bottom" } = this.props;
    const { onMouseOver, onMouseOut } = this;

    if (!content) {
      return children({});
    }

    return (
      <TetherComponent
        className={className}
        attachment={attachmentPostion[position]}
        targetAttachment={targetPosition[position]}
        style={{ zIndex: 20 }}
        renderTarget={ref =>
          children({
            ref: ref as React.RefObject<HTMLDivElement>,
            onMouseOver,
            onMouseOut
          })
        }
        renderElement={ref =>
          isVisible && (
            <Container
              ref={ref as React.RefObject<HTMLDivElement>}
              position={position}
            >
              {content}
            </Container>
          )
        }
      />
    );
  }
}

export default Tooltip;
