import React, { useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { useTranslate } from "@bitbloq/ui";
import Hardware from "./Hardware";
import Bloqs from "./Bloqs";
import Diagram from "./Diagram";

export interface IRoboticsCallbackProps {
  hardware: React.ReactElement;
  bloqs: React.ReactElement;
  diagram: React.ReactElement;
}

export interface IRoboticsProps {
  initialContent?: any;
  onContentChange: (content: any) => any;
  children: (props: IRoboticsCallbackProps) => React.ReactElement;
}

const Robotics: React.FunctionComponent<IRoboticsProps> = ({
  children,
  initialContent,
  onContentChange
}) => {
  const t = useTranslate();
  const [content, setContent] = useState(initialContent);

  const [undoPast, setUndoPast] = useState<any[]>([]);
  const [undoFuture, setUndoFuture] = useState<any[]>([]);

  const updateContent = (newContent: any) => {
    setUndoPast([content, ...undoPast]);
    setUndoFuture([]);
    setContent(newContent);
  };

  const undo = () => {
    setUndoPast(undoPast.slice(1));
    setUndoFuture([content, ...undoFuture]);
    setContent(undoPast[0]);
  };

  const redo = () => {
    setUndoPast([content, ...undoPast]);
    setUndoFuture(undoFuture.slice(1));
    setContent(undoFuture[0]);
  };

  useEffect(() => {
    if (content !== initialContent) {
      onContentChange(content);
    }
  }, [content]);

  return children({
    hardware: (
      <Hardware />
    ),
    bloqs: (
      <Bloqs />
    ),
    diagram: (
      <Diagram />
    )
  });
};

export default Robotics;
