import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState
} from "react";
import styled from "@emotion/styled";
import { Icon } from "@bitbloq/ui";

export interface ArrowProps {
  direction: "decrement" | "increment";
  page: number;
  onClick: (page: number) => void;
}

const Arrow: React.FC<ArrowProps> = ({ direction, page, onClick }) => {
  return (
    <PageItem
      onClick={() => onClick(direction === "decrement" ? page - 1 : page + 1)}
    >
      {direction === "decrement" ? (
        <AngleIcon direction={direction} name="angle" />
      ) : (
        <AngleIcon direction={direction} name="angle" />
      )}
    </PageItem>
  );
};

export interface PageProps {
  page: number;
  onClick: (page: number) => void;
  selected: boolean;
}

const Page: React.FC<PageProps> = ({ page, selected, onClick }) => {
  return (
    <PageItem onClick={() => onClick(page)} selected={selected}>
      {page}
    </PageItem>
  );
};

export interface PaginatorProps {
  className?: string;
  currentPage: number;
  pages: number;
  selectPage: (page: number) => void;
}

const Paginator: React.FC<PaginatorProps> = ({
  className,
  currentPage,
  pages,
  selectPage
}) => {
  let pagesElements: JSX.Element[] = [];

  for (let i = 1; i <= pages; i++) {
    pagesElements.push(
      <Page
        key={i}
        page={i}
        selected={currentPage === i}
        onClick={selectPage}
      />
    );
  }

  return (
    <PagesBar className={className}>
      <Arrow direction="decrement" page={currentPage} onClick={selectPage} />
      {pagesElements}
      <Arrow direction="increment" page={currentPage} onClick={selectPage} />
    </PagesBar>
  );
};

export default Paginator;

interface AngleIconProps {
  direction: "decrement" | "increment";
}
const AngleIcon = styled(Icon)<AngleIconProps>`
  height: 12px;
  transform: rotate(
    ${(props: AngleIconProps) =>
      props.direction === "decrement" ? "90" : "-90"}deg
  );
  width: 12px;
`;

interface PageItemProps {
  selected?: boolean;
}
const PageItem = styled.div<PageItemProps>`
  align-items: center;
  background-color: ${(props: PageItemProps) =>
    props.selected ? "#eee" : "#fff"};
  border: solid 1px #cccccc;
  border-radius: 4px;
  color: #373b44;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-family: Roboto;
  font-size: 14px;
  font-weight: 500;
  height: 32px;
  justify-content: center;
  margin-right: 6px;
  width: 32px;

  &:hover {
    background-color: #eee;
  }

  &:last-of-type {
    margin: 0;
  }
`;

const PagesBar = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;
