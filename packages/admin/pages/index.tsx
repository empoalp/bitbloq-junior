import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import Head from "next/head";
import Document from "@bitbloq/ui/src/components/Document";
import Icon from "@bitbloq/ui/src/components/Icon";
import LogViewer from "../components/LogViewer";

const IndexPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <Head>
        <title>Bitbloq Admin</title>
      </Head>
      <Document
        brandColor="#ffffff"
        title="Bitbloq Admin"
        icon={<Icon name="cthulhito" />}
        tabIndex={tabIndex}
        onTabChange={setTabIndex}
        onEditTitle={() => null}
        menuOptions={[]}
        tabs={[
          {
            icon: <Icon name="eye" />,
            label: "Logs",
            content: <LogViewer />
          }
        ]}
      />
    </>
  );
};

export default IndexPage;
