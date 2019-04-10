import React, { Component } from "react";
import TetherComponent from "react-tether";

export interface DropDownProps {
  className?: string;
  closeOnClick?: boolean;
  attachmentPosition: string;
  targetPosition: string;
  constraints?: {
    attachment?: string;
    outOfBoundsClass?: string;
    pin?: boolean | string[];
    pinnedClass?: string;
    to?: string | HTMLElement | number[];
  }[];
  notHidden?: boolean;
  offset?: string;
  targetOffset?: string;
}

interface State {
  isOpen: boolean;
}

class DropDown extends Component<DropDownProps, State> {
  static defaultProps = {
    closeOnClick: true,
    attachmentPosition: "top right",
    targetPosition: "bottom right"
  };

  toggleEl: HTMLElement | null;
  attachmentEl: HTMLElement | null;
  state = { isOpen: false };

  componentDidMount() {
    document.addEventListener("click", this.onBodyClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.onBodyClick, false);
  }

  close() {
    this.setState({ isOpen: false });
  }

  onBodyClick = (e: MouseEvent) => {
    const { closeOnClick } = this.props;
    const toggle = this.toggleEl;
    const attachment = this.attachmentEl;

    if (toggle && toggle.contains(e.target as HTMLElement)) {
      this.setState(state => ({ ...state, isOpen: !state.isOpen }));
    } else if (attachment && attachment.contains(e.target as HTMLElement)) {
      if (closeOnClick) {
        this.setState({ isOpen: false });
      }
    } else {
      this.setState({ isOpen: false });
    }
  };

  render() {
    const { isOpen } = this.state;
    const {
      className,
      constraints,
      offset,
      attachmentPosition,
      notHidden,
      targetPosition,
      targetOffset
    } = this.props;
    const [element, attachment] = this.props.children as Function[];

    return (
      <TetherComponent
        className={className}
        constraints={constraints}
        attachment={attachmentPosition}
        targetAttachment={targetPosition}
        style={{ zIndex: 21 }}
        offset={offset || "0 0"}
        targetOffset={targetOffset || "0 0"}
        renderTarget={(ref: React.MutableRefObject<HTMLElement | null>) => (
          <div
            ref={el => {
              ref.current = el;
              this.toggleEl = el;
            }}
          >
            {element(isOpen)}
          </div>
        )}
        renderElement={(ref: React.MutableRefObject<HTMLElement | null>) => (
          <div
            style={{ display: isOpen || notHidden ? "block" : "none" }}
            ref={el => {
              ref.current = el;
              this.attachmentEl = el;
            }}
          >
            {attachment}
          </div>
        )}
      />
    );
  }
}

export default DropDown;
