import React, { FC, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { RecoilRoot } from "recoil";
import { colors, Document, Icon, Input, Select } from "@bitbloq/ui";
import CodeEditor, {
  useCodeEditor
} from "@bitbloq/ui/src/components/CodeEditor";
import YAML, { Document as YAMLDocument } from "yaml";
import { YAMLMap, YAMLSeq } from "yaml/types";
import Bloq from "@bitbloq/robotics/src/Bloq";
import {
  IBloqType,
  BloqCategory,
  BloqSubCategory
} from "@bitbloq/robotics/src/types";
import { BloqsDefinitionProvider } from "@bitbloq/robotics/src/useBloqsDefinition";

const bloqCategoryOptions = Object.values(BloqCategory).map(c => ({
  label: c,
  value: c
}));

const bloqSubCategoryOptions = Object.values(BloqSubCategory).map(c => ({
  label: c,
  value: c
}));

interface IObjectListProps {
  selected: number;
  objects: YAMLMap[];
  onSelect: (i: number) => void;
}

const ObjectList: FC<IObjectListProps> = ({ selected, objects, onSelect }) => {
  return (
    <ObjectListContainer>
      {objects.map((o, i) => (
        <ObjectItem
          key={i}
          onClick={() => onSelect(i)}
          selected={i === selected}
        >
          <span>{o.get("name")}</span>
        </ObjectItem>
      ))}
    </ObjectListContainer>
  );
};

const ObjectListContainer = styled.div`
  width: 210px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${colors.gray3};
`;

const ObjectItem = styled.div<{ selected?: boolean }>`
  padding: 0px 8px 0px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-color: #eee;
  border-style: solid;
  border-width: 1px 0px 1px 0px;
  margin-bottom: -1px;
  font-size: 14px;
  height: 30px;
  background-color: ${props => (props.selected ? colors.black : "white")};
  color: ${props => (props.selected ? "white" : colors.black)};

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

interface IEditorProps {
  inputYaml: string;
}

const Editor: FC<IEditorProps> = ({ inputYaml }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [objects, setObjects] = useState<YAMLMap[]>([]);
  const documentRef = useRef<YAMLDocument | null>(null);
  const { codeEditorPops, editText, revealPosition } = useCodeEditor({
    value: inputYaml,
    language: "yaml"
  });

  const [name, setName] = useState("");

  useEffect(() => {
    documentRef.current = YAML.parseDocument(inputYaml);
    setObjects(documentRef.current.contents?.items || []);
    editText(documentRef.current.toString());
  }, [inputYaml]);

  const selectedItem = objects[selectedIndex];

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.range) {
        revealPosition(selectedItem.range[0] || 0);
      }
      setName(selectedItem.get("name"));
    }
  }, [selectedItem]);

  const bloqTypes = objects.map(o => o.toJSON());

  const onChangeName = (newName: string) => {
    if (!documentRef.current || !selectedItem) return;

    const nameItem = selectedItem.items.find(i => i.key.value === "name");
    if (nameItem?.value) {
      const [start, end] = nameItem.value.range;
      nameItem.value.value = newName;
      editText(nameItem.value.value, { start, end: end - 1 });
    }
    setName(newName);
  };

  return (
    <Container>
      <VisualEditor>
        <ObjectList
          selected={selectedIndex}
          objects={objects}
          onSelect={i => setSelectedIndex(i)}
        />
        {selectedItem && (
          <RecoilRoot>
            <BloqEditor>
              <BloqPreview>
                <BloqsDefinitionProvider
                  bloqTypes={bloqTypes as IBloqType[]}
                  categories={Object.values(BloqCategory)}
                >
                  <Bloq
                    bloq={{ type: selectedItem.get("name") }}
                    section=""
                    path={[]}
                  />
                </BloqsDefinitionProvider>
              </BloqPreview>
              <BloqForm>
                <FormRow>
                  <FormLabel>
                    <label>Name</label>
                  </FormLabel>
                  <FormInput>
                    <Input
                      value={name}
                      onChange={e => onChangeName(e.target.value)}
                    />
                  </FormInput>
                </FormRow>
                <FormRow>
                  <FormLabel>
                    <label>Category</label>
                  </FormLabel>
                  <FormInput>
                    <Select
                      options={bloqCategoryOptions}
                      value={selectedItem.get("category")}
                    />
                  </FormInput>
                </FormRow>
                <FormRow>
                  <FormLabel>
                    <label>Sub-category</label>
                  </FormLabel>
                  <FormInput>
                    <Select
                      options={bloqSubCategoryOptions}
                      value={selectedItem.get("subCategory")}
                    />
                  </FormInput>
                </FormRow>
              </BloqForm>
            </BloqEditor>
          </RecoilRoot>
        )}
      </VisualEditor>
      <Code>
        <CodeEditor {...codeEditorPops} />
      </Code>
    </Container>
  );
};

const ConfigEditor: FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [bloqsInput, setBloqsInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelected = (file?: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setBloqsInput(reader.result as string);
      };
      reader.readAsText(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Document
        brandColor="#ffffff"
        title="Configuration Editor"
        icon={<Icon name="cthulhito" />}
        tabIndex={tabIndex}
        onTabChange={setTabIndex}
        onEditTitle={() => null}
        menuOptions={[
          {
            id: "file",
            label: "File",
            children: [
              {
                id: "open-bloqs-file",
                label: "Open bloqs file",
                icon: <Icon name="programming-bloqs" />,
                type: "option",
                onClick: () => fileInputRef.current?.click()
              }
            ]
          }
        ]}
        tabs={[
          {
            icon: <Icon name="programming-bloqs" />,
            label: "Bloqs",
            content: <Editor inputYaml={bloqsInput} />
          }
        ]}
      />
      <input
        accept=".yml"
        ref={fileInputRef}
        type="file"
        onChange={e => onFileSelected(e.target.files && e.target.files[0])}
        style={{ display: "none" }}
      />
    </>
  );
};

export default ConfigEditor;

const Container = styled.div`
  display: flex;
  flex: 1;
`;

const VisualEditor = styled.div`
  flex: 1;
  display: flex;
`;

const Code = styled.div`
  flex: 1;
  display: flex;
  border-left: 1px solid ${colors.gray3};
`;

const Form = styled.div`
  flex: 1;
`;

const BloqEditor = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const BloqPreview = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${colors.gray3};
`;

const BloqForm = styled.div`
  padding: 20px;
`;

const FormRow = styled.div`
  display: flex;
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const FormLabel = styled.div`
  flex: 1;
  font-size: 14px;
  margin-right: 30px;

  label {
    min-height: 35px;
    display: flex;
    align-items: center;
    line-height: 1.4;
  }
`;

const FormInput = styled.div`
  flex: 2;
  max-width: 66%;
`;
