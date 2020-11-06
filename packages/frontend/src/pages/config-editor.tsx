import React, { FC } from "react";
import dynamic from "next/dynamic";

const DynamicConfigEditor = dynamic(
  () => import("../components/ConfigEditor"),
  {
    ssr: false
  }
);

const ConfigEditorPage: FC = () => {
  return <DynamicConfigEditor />;
};

export default ConfigEditorPage;
