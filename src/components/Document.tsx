import * as React from "react";
import Tooltip from "./Tooltip";
import MenuBar, {
  MainMenuOption,
  OptionClickHandler as MenuOptionClickHandler
} from "./MenuBar";
import styled, { css } from "react-emotion";
import CollapseIcon from "./icons/AngleDouble";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
`;

interface HeaderWrapProps {
  collapsed: boolean;
}
const HeaderWrap = styled.div<HeaderWrapProps>`
  height: 70px;
  overflow: hidden;
  transition: height 150ms ease-out;

  ${props =>
    props.collapsed &&
    css`
      height: 0px;
    `};
`;

const Header = styled.div`
  height: 70px;
  display: flex;
`;

const DocumentIcon = styled.div`
  width: 70px;
  background-color: #4dc3ff;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  padding-left: 18px;
  background-color: #ebebeb;
  flex: 1;
  font-weight: 500;
  font-style: italic;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
`;

const MenuWrap = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  border-bottom: 1px solid #cfcfcf;
`;

interface CollapsedButtonProps {
  collapsed: boolean;
}
const CollapseButton = styled.div<CollapsedButtonProps>`
  cursor: pointer;
  svg {
    width: 12px;
    margin: 0px 12px;
    transition: transform 150ms ease-out;
  }

  ${props =>
    props.collapsed &&
    css`
      svg {
        transform: rotateX(180deg);
      }
    `};
`;

const Tabs = styled.div`
  width: 70px;
  min-width: 70px;
  background-color: #3b3e45;
  color: white;
`;

interface TabIconProps {
  selected: boolean;
}
const TabIcon = styled.div<TabIconProps>`
  height: 70px;
  border-bottom: 1px solid #797c81;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    opacity: 0.5;
  }

  ${props =>
    props.selected &&
    css`
      background-color: #1e1f21;

      svg {
        opacity: 1;
      }
    `};
`;

interface ContentProps {
  active: boolean;
}
const Content = styled.div<ContentProps>`
  display: none;
  flex: 1;
  overflow: hidden;

  ${props =>
    props.active &&
    css`
      display: flex;
    `};
`;

export interface TabProps {
  label: string;
  icon: string;
  children: React.ReactChild;
}

export const Tab: React.SFC<TabProps> = props => null;

export interface DocumentProps {
  menuOptions?: MainMenuOption[];
  onMenuOptionClick?: MenuOptionClickHandler;
  menuRightContent?: React.ReactChild;
}

interface State {
  currentTabIndex: number;
  isHeaderCollapsed: boolean;
}

class Document extends React.Component<DocumentProps, State> {
  state = {
    currentTabIndex: 0,
    isHeaderCollapsed: false
  };

  onCollapseButtonClick = () => {
    this.setState(state => ({
      ...state,
      isHeaderCollapsed: !state.isHeaderCollapsed
    }));
  };

  render() {
    const {
      children,
      menuOptions = [],
      menuRightContent,
      onMenuOptionClick
    } = this.props;
    const { currentTabIndex, isHeaderCollapsed } = this.state;

    const currentTab = React.Children.toArray(children)[currentTabIndex];

    return (
      <Container>
        <HeaderWrap collapsed={isHeaderCollapsed}>
          <Header>
            <DocumentIcon />
            <Title>Proyecto sin título</Title>
          </Header>
        </HeaderWrap>
        <MenuWrap>
          <MenuBar options={menuOptions} onOptionClick={onMenuOptionClick} />
          {menuRightContent}
          <CollapseButton
            onClick={this.onCollapseButtonClick}
            collapsed={isHeaderCollapsed}
          >
            <CollapseIcon />
          </CollapseButton>
        </MenuWrap>
        <Main>
          <Tabs>
            {React.Children.map(
              children,
              (tab: React.ReactElement<TabProps>, i) => (
                <Tooltip position="right" content={tab.props.label}>
                  {tooltipProps => (
                    <TabIcon
                      {...tooltipProps}
                      selected={i === currentTabIndex}
                      onClick={() => this.setState({ currentTabIndex: i })}
                    >
                      {tab.props.icon}
                    </TabIcon>
                  )}
                </Tooltip>
              )
            )}
          </Tabs>
          {React.Children.map(
            children,
            (tab: React.ReactElement<TabProps>, i) => (
              <Content active={i === currentTabIndex}>
                {tab.props.children}
              </Content>
            )
          )}
        </Main>
      </Container>
    );
  }
}

export default Document;
