import React, { FC, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import styled from "@emotion/styled";
import { Button, Icon } from "@bitbloq/ui";
import Router from "next/router";
import { Subscription } from "react-apollo";
import debounce from "lodash/debounce";
import { ApolloError } from "apollo-client";
import {
  DOCUMENT_UPDATED_SUBSCRIPTION,
  EXERCISE_BY_CODE_QUERY,
  CREATE_FOLDER_MUTATION,
  DOCS_FOLDERS_PAGE_QUERY
} from "../apollo/queries";
import useUserData from "../lib/useUserData";
import { OrderType } from "../types";
import AppLayout from "./AppLayout";
import Breadcrumbs, { IBreadcrumbLink } from "./Breadcrumbs";
import DocumentList from "./DocumentsList";
import EditTitleModal from "./EditTitleModal";
import FilterOptions from "./FilterOptions";
import GraphQLErrorMessage from "./GraphQLErrorMessage";
import NewDocumentButton from "./NewDocumentButton";
import NewExerciseButton from "./NewExerciseButton";

const Documents: FC<{ id?: string }> = ({ id }) => {
  const userData = useUserData();
  const client = useApolloClient();

  const [order, setOrder] = useState<OrderType>(OrderType.Creation);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [folderTitleModal, setFolderTitleModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagesNumber, setPagesNumber] = useState(1);
  const [currentLocation] = useState({
    id: id ? id : userData ? userData.rootFolder : null,
    name: "root"
  });
  const [breadcrumbLinks, setBreadcrumbsLinks] = useState([
    {
      route: userData ? "/" : "",
      text: userData ? "Mis documentos" : "",
      type: ""
    }
  ]);
  const [breadParents, setBreadParents] = useState<IBreadcrumbLink[]>([]);
  const [docsAndFols, setDocsAndFols] = useState<any[]>([]);
  const [parentsPath, setParentsPath] = useState<any[]>([]);
  const [nFolders, setNFolders] = useState<number>(0);

  const openFile = React.createRef<HTMLInputElement>();

  const [createFolder] = useMutation(CREATE_FOLDER_MUTATION);
  const [error, setError] = useState<ApolloError>();

  const {
    data: resultData,
    loading,
    error: errorQuery,
    refetch: refetchDocsFols
  } = useQuery(DOCS_FOLDERS_PAGE_QUERY, {
    variables: {
      currentLocation: currentLocation.id,
      currentPage,
      order,
      searchTitle: searchQuery,
      itemsPerPage: 8
    },
    fetchPolicy: "cache-and-network"
  });

  useEffect(() => {
    if (!loading && !errorQuery) {
      const {
        nFolders: foldersNumber,
        pagesNumber: numberOfPages,
        parentsPath: pathOfParent,
        result: docsAndFolsItems
      } = resultData.documentsAndFolders;
      setBreadParents(
        pathOfParent.map(item => ({
          route: `/app/folder/${item.id}`,
          text: item.name,
          type: "folder"
        }))
      );
      setDocsAndFols(docsAndFolsItems || []);
      setNFolders(foldersNumber);
      setPagesNumber(numberOfPages);
      setParentsPath(pathOfParent);
      setError(undefined);
    }
    if (errorQuery) {
      setError(errorQuery);
    }
  }, [loading, errorQuery]);

  const [loadingExercise, setLoadingExercise] = useState(false);
  const [exerciseError, setExerciseError] = useState(false);

  const onFolderClick = async ({ id: folderId }) => {
    Router.push(`/app/folder/${folderId}`);
  };

  useEffect(() => {
    if (currentPage > pagesNumber) {
      setCurrentPage(pagesNumber);
    }
  }, [pagesNumber]);

  const onDocumentClick = ({ id: documentId, title }) => {
    setBreadcrumbsLinks([
      ...breadcrumbLinks,
      { route: documentId, text: title, type: "document" }
    ]);
    Router.push(`/app/document/${documentId}`);
  };

  const onCreateFolder = async folderName => {
    await createFolder({
      variables: {
        input: { name: folderName, parent: currentLocation.id }
      }
    }).catch(e => {
      setError(e);
    });
    refetchDocsFols();
    setFolderTitleModal(false);
  };

  const onOrderChange = (newOrder: OrderType) => {
    setOrder(newOrder);
    refetchDocsFols();
  };

  const onOpenExercise = async exerciseCode => {
    if (exerciseCode) {
      try {
        setLoadingExercise(true);
        const {
          data: { exerciseByCode: exercise }
        } = await client.query({
          query: EXERCISE_BY_CODE_QUERY,
          variables: { code: exerciseCode }
        });
        setLoadingExercise(false);
        setExerciseError(false);
        window.open(`/app/exercise/${exercise.type}/${exercise.id}`);
      } catch (e) {
        setLoadingExercise(false);
        setExerciseError(true);
      }
    }
  };

  const onSearchInput = debounce((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 500);

  const onFileSelected = file => {
    if (file) {
      window.open(`/app/edit-document/${currentLocation.id}/open/new`);
      const reader = new FileReader();
      reader.onload = async e => {
        const document = JSON.parse(reader.result as string);
        const channel = new BroadcastChannel("bitbloq-documents");
        channel.onmessage = event => {
          if (event.data.command === "open-document-ready") {
            channel.postMessage({ document, command: "open-document" });
            channel.close();
          }
        };
      };
      reader.readAsText(file);
      if (openFile.current) {
        openFile.current.value = "";
      }
    }
  };

  if (error) {
    return <GraphQLErrorMessage apolloError={error} />;
  }

  return (
    <>
      {loading && <AppLayout loading />}
      <AppLayout
        header={
          currentLocation.id === (userData && userData.rootFolder) ? (
            "Mis documentos"
          ) : (
            <Breadcrumbs links={breadParents} />
          )
        }
      >
        <DocumentListHeader>
          {(docsAndFols.length > 0 || searchQuery) && (
            <FilterOptions
              onOrderChange={onOrderChange}
              searchText={searchText}
              selectValue={order}
              onChange={(value: string) => {
                setSearchText(value);
                onSearchInput(value);
              }}
            />
          )}
          <HeaderButtons>
            <NewFolderButton
              tertiary
              onClick={() => {
                setFolderTitleModal(true);
              }}
            >
              <Icon name="new-folder" />
              Nueva carpeta
            </NewFolderButton>
            <NewExerciseButton
              onOpenExercise={onOpenExercise}
              exerciseError={exerciseError}
              loadingExercise={loadingExercise}
            />
            <NewDocumentButton arrowOffset={10} />
          </HeaderButtons>
        </DocumentListHeader>
        {docsAndFols.length > 0 ? (
          <DndProvider backend={HTML5Backend}>
            <DocumentList
              currentPage={currentPage}
              parentsPath={parentsPath}
              pagesNumber={pagesNumber}
              refetchDocsFols={refetchDocsFols}
              docsAndFols={docsAndFols}
              currentLocation={currentLocation}
              order={order}
              searchText={searchText}
              onFolderClick={onFolderClick}
              onDocumentClick={onDocumentClick}
              selectPage={(page: number) => {
                setCurrentPage(page);
                refetchDocsFols();
              }}
              nFolders={nFolders}
            />
          </DndProvider>
        ) : searchQuery ? (
          <NoDocuments>
            <h1>No hay resultados para tu búsqueda</h1>
          </NoDocuments>
        ) : (
          <NoDocuments>
            <h1>No tienes ningún documento</h1>
            <p>
              Puedes crear un documento nuevo o subir uno desde tu ordenador.
            </p>
          </NoDocuments>
        )}
        <Subscription
          subscription={DOCUMENT_UPDATED_SUBSCRIPTION}
          shouldResubscribe={true}
          onSubscriptionData={() => {
            refetchDocsFols();
          }}
        />
        <input
          ref={openFile}
          type="file"
          onChange={e => onFileSelected(e.target.files![0])}
          style={{ display: "none" }}
        />
        {folderTitleModal && (
          <EditTitleModal
            title={"Carpeta sin título"}
            onCancel={() => setFolderTitleModal(false)}
            onSave={onCreateFolder}
            modalTitle="Crear carpeta"
            modalText="Nombre de la carpeta"
            placeholder="Carpeta sin título"
            saveButton="Crear"
          />
        )}
      </AppLayout>
    </>
  );
};

const DocumentsWithDelete = props => <Documents {...props} />;

export default DocumentsWithDelete;

/* styled components */

const DocumentListHeader = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 40px;
`;

const HeaderButtons = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const HiddenDocumentList = styled(DocumentList)`
  display: none;
`;

const NoDocuments = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 60px;
  margin-top: 100px;
  justify-content: center;
  align-items: center;

  h1 {
    width: 1179px;
    height: 28px;
    font-family: Roboto;
    font-size: 24px;
    font-weight: 300;
    text-align: center;
    color: #373b44;
    margin-bottom: 20px;
  }

  p {
    width: 1179px;
    height: 22px;
    font-family: Roboto;
    font-size: 14px;
    line-height: 1.57;
    text-align: center;
    color: #474749;
  }
`;

const NewFolderButton = styled(Button)`
  padding: 0px 20px;
  svg {
    width: 20px;
    height: 20px;
    margin-right: 6px;
  }
`;
