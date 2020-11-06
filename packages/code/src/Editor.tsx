import React, { FC } from "react";
import CodeEditor, {
  useCodeEditor,
  IError
} from "@bitbloq/ui/src/components/CodeEditor";

interface IEditorProps {
  code?: string;
  onChange: (newCode: string) => void;
  errors?: IError[];
}

const Editor: FC<IEditorProps> = ({ code = "", errors, onChange }) => {
  const { codeEditorPops } = useCodeEditor({
    value: code,
    onChange,
    errors
  });
  return <CodeEditor {...codeEditorPops} />;
};

export default Editor;
