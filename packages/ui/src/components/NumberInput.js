import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import Icon from "./Icon";
import Input from "./Input";

const Container = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  border: 1px solid #cfcfcf;
  border-radius: 4px;

  ${props =>
    props.focused &&
    css`
      border: 1px solid #5d6069;
    `}
`;

const Button = styled.div`
  width: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DecrementButton = styled(Button)`
  border-radius: 4px 0px 0px 4px;
  border-right: 1px solid #cfcfcf;
  color: #8c919b;

  svg {
    transform: rotate(-90deg);
  }
`;

const IncrementButton = styled(Button)`
  border-radius: 0px 4px 4px 0px;
  border-left: 1px solid #cfcfcf;
  color: #8c919b;

  svg {
    transform: rotate(90deg);
  }
`;

const StyledInput = styled(Input)`
  border: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    border: none;
  }
`;

const ValueText = styled.span`
  position: absolute;
  display: flex;
  align-items: center;
  font-size: 13px;
  top: 0px;
  left: 32px;
  height: 33px;
  pointer-events: none;
`;

export default class NumberInput extends React.Component {
  static defaultProps = {
    minValue: -Infinity,
    maxValue: Infinity,
    fineStep: 1,
    step: 1
  };

  constructor(props) {
    super(props);

    this.input = React.createRef();

    this.state = {
      focused: false,
      text: Number(props.value) ? Number(props.value).toString() : ""
    };
  }

  componentDidMount() {
    this.input.current.addEventListener("wheel", this.onWheel, {
      passive: false
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.props;
    const { focused, text } = this.state;
    const input = this.input.current;
    if (input && focused && !prevState.focused) {
      input.select();
    }

    const numberValue = Number(text) || 0;
    if (Number(value) !== numberValue) {
      this.setState({
        text: Number(value) ? Number(value).toString() : ""
      });
    }
  }

  onChange = e => {
    const { onChange } = this.props;
    const value = e.target.value;

    this.setState({
      text: value
    });

    if (onChange) {
      onChange(Number(value), value);
    }
  };

  onFocus = e => {
    const { onFocus } = this.props;

    this.setState({ focused: true });

    if (onFocus) {
      onFocus(e);
    }
  };

  onBlur = e => {
    const { onBlur, value, onChange, minValue, maxValue } = this.props;
    this.setState({
      focused: false,
      text: Number(value) ? Number(value).toString() : ""
    });

    if (onBlur) {
      onBlur(e);
    } else {
      if (Number(value) < minValue && onChange) {
        onChange(minValue);
      }
      if (Number(value) > maxValue && onChange) {
        onChange(maxValue);
      }
    }
  };

  onWheel = e => {
    const delta = e.wheelDelta;
    e.preventDefault();
    if (delta > 0) {
      setTimeout(() => this.increment(Math.round(delta / 240)));
    } else {
      setTimeout(() => this.decrement(Math.round(-delta / 240)));
    }
  };

  onKeyPress = e => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.increment();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.decrement();
    }
  };

  onIncrementClick = e => {
    e.preventDefault();
    this.increment();
    this.input.current.focus();
  };

  onDecrementClick = e => {
    e.preventDefault();
    this.decrement();
    this.input.current.focus();
  };

  decrement = (count = 1) => {
    const { value, onChange, fineStep, step, minValue } = this.props;

    const finalStep = value <= 1 && value > 0 ? fineStep : step;
    const newValue =
      Math.round((Number(value) - finalStep * count) * 100) / 100;

    if (newValue >= minValue && onChange) {
      onChange(newValue);
      this.setState({ text: newValue.toString() });
    }
  };

  increment = (count = 1) => {
    const { value, onChange, fineStep, step, maxValue } = this.props;

    const finalStep = value < 1 && value >= 0 ? fineStep : step;
    const newValue =
      Math.round((Number(value) + finalStep * count) * 100) / 100;

    if (newValue <= maxValue && onChange) {
      onChange(newValue);
      this.setState({ text: newValue.toString() });
    }
  };

  render() {
    const { focused, text } = this.state;
    const { value, unit } = this.props;

    return (
      <Container focused={focused}>
        <DecrementButton onMouseDown={this.onDecrementClick}>
          <Icon name="triangle" />
        </DecrementButton>
        <StyledInput
          {...this.props}
          ref={this.input}
          value={focused ? text : ""}
          onChange={this.onChange}
          type="number"
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyPress={this.onKeyPress}
          onKeyDown={this.onKeyPress}
        />
        {!focused && (
          <ValueText>
            {value} {unit}
          </ValueText>
        )}
        <IncrementButton onMouseDown={this.onIncrementClick}>
          <Icon name="triangle" />
        </IncrementButton>
      </Container>
    );
  }
}
