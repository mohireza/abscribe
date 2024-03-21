import React, { useRef, useState, useEffect } from "react";
import Placeholder from "react-bootstrap/Placeholder";

import {
  Button,
  Form,
  Card,
  ListGroup,
  Accordion,
  ListGroupItem,
  InputGroup,
  Badge,
  Nav,
  ButtonGroup,
  CloseButton,
} from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faFlask,
  faMagicWandSparkles,
  faPaperPlane,
  faTrashAlt,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import AIModifiers from "./AIModifiers";
import parse from "html-react-parser";
import "../../scss/ideabucket.scss";

export default function IdeaBucket({
  activeChunkid,
  currentDocument,
  activeVersionIds,
  getFactorColor,
  activeFactorId,
  visibleChunks,
  setActiveChunkid,
  setActiveVersionIds,
  updateChunk,
  updatePopupToolbarLocation,
  getChunkIndexFromId,
  getVersionIndexFromId,
  createVersion,
  deleteChunk,
  updateActiveVersionId,
  setTabKey,
  makeid,
  recipePrompt,
  setRecipePrompt,
  recipeStreaming,
  setRecipeStreaming,
  recipeResult,
  setRecipeResult,
  recipes,
  setRecipes,
  activeRecipe,
  setActiveRecipe,
  generateVersion,
}) {
  const [selectVersions, setSelectVersions] = useState(false);
  useState("");

  useEffect(() => {
    if (currentDocument) {
      updateChunk(activeChunkid, activeVersionIds[activeChunkid]);
    }
  }, [activeVersionIds]);

  const getChunkIdsFromEditorContent = () => {
    let chunkIds = [];
    const chunkElements = tinymce.activeEditor.dom.select(`span.chunk`);
    for (const element of chunkElements) {
      chunkIds.push(tinymce.activeEditor.dom.getAttrib(element, "id"));
    }
    return chunkIds;
  };

  const getVersionTextFromIds = (chunkId, versionId) => {
    if (chunkId && versionId) {
      const chunkIndex = getChunkIndexFromId(chunkId);
      const versionIndex = getVersionIndexFromId(
        currentDocument.chunks[chunkIndex],
        versionId
      );
      return currentDocument.chunks[chunkIndex].versions[versionIndex].text;
    }
  };

  return (
    <Card className="rounded-0 border-0">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <strong>
          <FontAwesomeIcon icon={faLightbulb} /> Idea Bucket
        </strong>
        {/* <Button
          variant="outline-dark"
          size="sm"
          onClick={() => {
            setSelectVersions((prevState) => !prevState);
          }}
        >
          A/B Test
        </Button> */}
      </Card.Header>
      {visibleChunks.length > 0 ? (
        <div className="d-flex flex-column justify-content-between idea-bucket-container">
          <Accordion
            activeKey={`${activeChunkid}`}
            flush
            className="chunk-accordion"
          >
            {currentDocument
              ? currentDocument.chunks.map((chunk, index) => {
                  if (visibleChunks.includes(chunk.frontend_id)) {
                    return (
                      <Accordion.Item
                        eventKey={`${chunk.frontend_id}`}
                        key={index}
                      >
                        <Accordion.Header
                          onClick={() => {
                            setActiveChunkid(chunk.frontend_id);
                            updateActiveVersionId(chunk.frontend_id);
                            updatePopupToolbarLocation(
                              tinymce.activeEditor.dom.get(chunk.frontend_id)
                            );
                          }}
                        >
                          <strong className="text-truncate">
                            {parse(`${chunk.versions[0].text}`)}
                          </strong>
                          {"  "}
                          <Badge className="mx-1" bg="secondary">
                            {chunk.versions?.length}
                          </Badge>
                          <span className="visually-hidden">
                            Number of versions for the given chunk
                          </span>
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                          <ListGroup variant="flush">
                            {chunk.versions.map((version, index) => (
                              <ListGroupItem
                                key={index}
                                onClick={() => {
                                  // setLlmResult("");
                                  updateChunk(
                                    activeChunkid,
                                    version.frontend_id
                                  );
                                  setActiveVersionIds(
                                    (prevActiveVersionIds) => ({
                                      ...prevActiveVersionIds,
                                      [chunk.frontend_id]: version.frontend_id,
                                    })
                                  );
                                  // const nodeArray =
                                  //   editorRef.current.dom.select("p.answer");
                                  updatePopupToolbarLocation(
                                    tinymce.activeEditor.dom.get(
                                      chunk.frontend_id
                                    )
                                  );
                                }}
                                action
                                variant={
                                  activeVersionIds[activeChunkid] ==
                                  version.frontend_id
                                    ? "primary"
                                    : "light"
                                }
                                // style={
                                //   activeVersionIds[activeChunkid] ==
                                //   version.frontend_id
                                //     ? {
                                //         backgroundColor: `${getFactorColor(
                                //           activeFactorId
                                //         )}`,
                                //         // backgroundColor: `#e9ffee`,
                                //       }
                                //     : {}
                                // }
                              >
                                <>
                                  {activeVersionIds[activeChunkid] ==
                                  version.frontend_id ? (
                                    <small>
                                      <CloseButton
                                        style={{
                                          position: "absolute",
                                          top: "9px",
                                          right: "6px",
                                        }}
                                        onClick={() => {
                                          deleteChunk(
                                            activeChunkid,
                                            activeVersionIds[activeChunkid]
                                          );
                                        }}
                                      />
                                    </small>
                                  ) : (
                                    ""
                                  )}
                                </>
                                {parse(`${version.text}`)}{" "}
                                {selectVersions ? (
                                  <Form.Check
                                    className="mx-2"
                                    aria-label="option 1"
                                  />
                                ) : (
                                  ""
                                )}
                                {activeVersionIds[activeChunkid] ==
                                version.frontend_id ? (
                                  <div className="d-grid gap-2"></div>
                                ) : (
                                  ""
                                )}
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  } else {
                    return "";
                  }
                })
              : ""}
          </Accordion>

          {/* <ButtonGroup>
              <Button
                onClick={() => {
                  console.log(currentDocument);
                }}
              >
                Log Document Datastructure
              </Button>
              <Button
                onClick={() => {
                  console.log(tinymce.activeEditor.getContent());
                }}
              >
                Log Document Content
              </Button>
            </ButtonGroup> */}

          <AIModifiers
            selectVersions={selectVersions}
            activeChunkid={activeChunkid}
            activeVersionIds={activeVersionIds}
            updateActiveVersionId={updateActiveVersionId}
            getVersionTextFromIds={getVersionTextFromIds}
            createVersion={createVersion}
            deleteChunk={deleteChunk}
            makeid={makeid}
            llmResult={recipeResult}
            setLlmResult={setRecipeResult}
            llmPrompt={recipePrompt}
            setLlmPrompt={setRecipePrompt}
            llmStreaming={recipeStreaming}
            setLlmStreaming={setRecipeStreaming}
            llmRecipes={recipes}
            setLlmRecipes={setRecipes}
            activeLlmRecipe={activeRecipe}
            setActiveLlmRecipe={setActiveRecipe}
            generateVersion={generateVersion}
          />
          {/* {activeChunkid && activeVersionIds[activeChunkid] ? (
              <>
                <RefinementRecipes
                  selectVersions={selectVersions}
                  activeVersionIds={activeVersionIds}
                  activeChunkid={activeChunkid}
                  updateActiveVersionId={updateActiveVersionId}
                  getVersionTextFromIds={getVersionTextFromIds}
                  createVersion={createVersion}
                  deleteChunk={deleteChunk}
                  makeid={makeid}
                />
              </>
            ) : (
              ""
            )} */}
        </div>
      ) : (
        <>
          <Card.Body className="d-flex flex-column align-items-center justify-content-center idea-bucket-container">
            <h1 className="display-1 text-muted">
              <FontAwesomeIcon icon={faLightbulb} />
            </h1>

            <p className="lead text-center p-2">
              Your ideas for text variations will appear here. Select some text
              and create a chunk to get started.
            </p>
          </Card.Body>
        </>
      )}
    </Card>
  );
}
