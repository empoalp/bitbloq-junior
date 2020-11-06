import React, { FC, useEffect, useRef } from "react";
import colors from "../colors";
import styled from "@emotion/styled";
import * as monaco from "monaco-editor";
import {
  editorBackground,
  editorForeground
} from "monaco-editor/esm/vs/platform/theme/common/colorRegistry";
import {
  editorActiveLineNumber,
  editorLineNumbers
} from "monaco-editor/esm/vs/editor/common/view/editorColorRegistry";

monaco.editor.defineTheme("bitbloqTheme", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "", foreground: colors.black },
    { token: "keyword", foreground: colors.green, fontStyle: "bold" },
    { token: "comment", foreground: colors.gray4 },
    { token: "number", foreground: colors.brandBlue },
    { token: "string", foreground: colors.brandOrange },
    { token: "type.yaml", foreground: colors.green },
    { token: "string.yaml", foreground: colors.black }
  ],
  colors: {
    [editorBackground]: "#ffffff",
    [editorForeground]: colors.black,
    [editorLineNumbers]: colors.gray5,
    [editorActiveLineNumber]: colors.black
  }
});

export interface IError {
  line: number;
  column: number;
  message: string;
}

export interface IRange {
  start: number;
  end: number;
}

export interface IUseCodeEditorOptions {
  value: string;
  onChange?: (newCode: string) => void;
  readOnly?: boolean;
  disableMinimap?: boolean;
  language?: string;
  errors?: IError[];
}

export interface IUseCodeEditorReturn {
  codeEditorPops: {
    containerRef: React.RefObject<HTMLDivElement>;
    editor?: monaco.editor.ICodeEditor;
  };
  editText: (newValue: string, range?: IRange) => void;
  setSelection: (range: IRange) => void;
  revealPosition: (position: number) => void;
  getValue: () => string;
  setValue: (newValue: string) => void;
}

export const useCodeEditor = (
  options: IUseCodeEditorOptions
): IUseCodeEditorReturn => {
  const {
    value,
    onChange,
    readOnly = false,
    disableMinimap = false,
    language = "cpp",
    errors = []
  } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.ICodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      const editor = monaco.editor.create(containerRef.current, {
        value,
        language,
        fontFamily: "Roboto Mono",
        theme: "bitbloqTheme",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        readOnly,
        minimap: {
          enabled: !disableMinimap
        }
      });

      const subscription = editor.onDidChangeModelContent(event => {
        onChange && onChange(editor.getValue());
      });

      editorRef.current = editor;

      return () => {
        editor.dispose();
        const model = editor.getModel();
        if (model) {
          model.dispose();
        }
        subscription.dispose();
      };
    }
    return undefined;
  }, []);

  const editText = (value: string, range?: IRange) => {
    const editor = editorRef.current;
    const model = editor && editor.getModel();

    if (model) {
      model.pushEditOperations(
        [],
        [
          {
            range: range
              ? monaco.Range.fromPositions(
                  model.getPositionAt(range.start),
                  model.getPositionAt(range.end)
                )
              : model.getFullModelRange(),
            text: value
          }
        ],
        () => null
      );
    }
  };

  const setErrors = (errors: IError[]) => {
    const editor = editorRef.current;
    const model = editor && editor.getModel();

    if (model) {
      monaco.editor.setModelMarkers(
        model,
        "compile",
        errors.map(error => ({
          ...error,
          startLineNumber: error.line,
          endLineNumber: error.line,
          startColumn: error.column,
          endColumn: error.column + 1,
          severity: monaco.MarkerSeverity.Error
        }))
      );
    }
  };

  const setSelection = (range?: IRange) => {
    const editor = editorRef.current;
    const model = editor && editor.getModel();
    if (editorRef.current && model) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        range
          ? [
              {
                range: monaco.Range.fromPositions(
                  model.getPositionAt(range.start),
                  model.getPositionAt(range.end)
                ),
                options: {
                  inlineClassName: "selected-range"
                }
              }
            ]
          : []
      );
    }
  };

  const revealPosition = (position: number) => {
    const editor = editorRef.current;
    const model = editor && editor.getModel();
    if (editor && model) {
      editor.revealLineNearTop(
        model.getPositionAt(position).lineNumber,
        monaco.editor.ScrollType.Smooth
      );
    }
  };

  const getValue = () => {
    const editor = editorRef.current;
    const model = editor && editor.getModel();
    return editor && model ? model.getValue() : "";
  };

  const setValue = (newValue: string) => {
    const editor = editorRef.current;
    const model = editor && editor.getModel();
    if (editor && model) {
      model.setValue(newValue);
    }
  };

  useEffect(() => setErrors(errors), [errors]);

  return {
    codeEditorPops: {
      containerRef,
      editor: editorRef.current || undefined
    },
    editText,
    setSelection,
    revealPosition,
    getValue,
    setValue
  };
};

interface ICodeEditorProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  editor?: monaco.editor.ICodeEditor;
}

const CodeEditor: FC<ICodeEditorProps> = ({ containerRef, editor }) => {
  useEffect(() => {
    const onWindowResize = () => {
      if (editor) {
        editor.layout();
      }
    };

    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return <Container ref={containerRef} key="editor" />;
};

export default CodeEditor;

const Container = styled.div`
  flex: 1;

  .selected-range {
    background-color: ${colors.black};
    color: white;
  }
`;
