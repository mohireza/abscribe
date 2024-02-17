import React, { forwardRef, useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faPlus,
  faWandMagicSparkles,
  faMagicWandSparkles,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { faClone } from "@fortawesome/free-regular-svg-icons";
import { useHorizontalScroll } from "../ABScribe/useHorizontalScroll";
import Select from "react-select";

import useLLM from "usellm";

import { Card, Button, ButtonGroup, Dropdown } from "react-bootstrap";
import "../../scss/abtoolbar.scss";

const ABToolbar = forwardRef(function MyInput(props, ref) {
  const {
    top,
    left,
    visible,
    activeChunkid,
    createChunk,
    currentDocument,
    updateChunk,
    activeVersionIds,
    setActiveVersionIds,
    deleteChunk,
    setEditingMode,
    getFactorColor,
    activeFactorId,
    recipes,
    activeRecipe,
    setActiveRecipe,
    generateVersion,
    disable,
  } = props;
  const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
  const [result, setResult] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState("just say hi");
  const scrollRef = useHorizontalScroll();
  const activeVersionRef = useRef(null);
  async function handleSend() {
    try {
      await llm.chat({
        messages: [{ role: "user", content: content }],
        stream: true,
        onStream: ({ message }) => {
          setResult(message.content);
          setStreaming(true);
        },
      });
    } catch (error) {
      console.error("Something went wrong!", error);
    } finally {
      setStreaming(false);
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [createChunk]);

  const scrollToBottom = () => {
    activeVersionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddChunkClick = () => {
    createChunk();
  };

  const numberToLetters = (num) => {
    let letters = "";
    while (num >= 0) {
      letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num % 26] + letters;
      num = Math.floor(num / 26) - 1;
    }
    return letters;
  };

  const chunk = currentDocument?.chunks.find(
    (chunk) => chunk.frontend_id === activeChunkid
  );

  return (
    <>
      <div
        ref={ref}
        className="toolbar d-flex flex-column"
        style={{
          top: top,
          left: left,
          visibility: visible ? "visible" : "hidden",
          transition: "top 0.1s, left  0.1s ease 0s",
        }}
      >
        <Card>
          <Card.Body className="p-0 mt-0 mb-0 bg-light rounded-1 d-flex">
            {/* <Card.Text>{content}</Card.Text> */}
            <div ref={scrollRef} className="versions-container d-flex">
              {activeChunkid !== "" && chunk
                ? chunk.versions.map((version, index) => (
                    <>
                      <span key={index} className="version-container">
                        <ButtonGroup
                          className="p-1 border"
                          // style={
                          //   activeVersionIds[activeChunkid] == version.frontend_id
                          //     ? {
                          //         backgroundColor: `${getFactorColor(
                          //           activeFactorId
                          //         )}`,
                          //         // backgroundColor: "#e9ffee",
                          //       }
                          //     : {}
                          // }
                          onMouseEnter={() => {
                            if (!disable) {
                              setEditingMode(false);
                              updateChunk(activeChunkid, version.frontend_id);
                            }
                          }}
                          // onMouseClick={() => {
                          //   setActiveVersionIds((prevActiveVersionIds) => ({
                          //     ...prevActiveVersionIds,
                          //     [activeChunkid]: version.frontend_id,
                          //   }));
                          // }}
                          onMouseLeave={() => {
                            if (!disable) {
                              console.log(activeVersionIds);
                              console.log(activeChunkid, activeVersionIds);
                              updateChunk(
                                activeChunkid,
                                activeVersionIds[activeChunkid]
                              );
                            }
                          }}
                        >
                          <Button
                            size="sm"
                            variant={
                              activeVersionIds[activeChunkid] ==
                              version.frontend_id
                                ? "outline-dark"
                                : "light"
                            }
                            onClick={() => {
                              if (!disable) {
                                updateChunk(activeChunkid, version.frontend_id);
                                setActiveVersionIds((prevActiveVersionIds) => ({
                                  ...prevActiveVersionIds,
                                  [activeChunkid]: version.frontend_id,
                                }));
                              }
                            }}
                          >
                            {numberToLetters(index)}{" "}
                          </Button>
                          {activeVersionIds[activeChunkid] ==
                          version.frontend_id ? (
                            <>
                              <Button
                                size="sm"
                                ref={
                                  activeVersionIds[activeChunkid] ==
                                  version.frontend_id
                                    ? activeVersionRef
                                    : ""
                                }
                                variant={
                                  activeVersionIds[activeChunkid] ==
                                  version.frontend_id
                                    ? "outline-danger"
                                    : "light"
                                }
                                onClick={() => {
                                  console.log("i have been clicked");
                                  deleteChunk(
                                    activeChunkid,
                                    version.frontend_id
                                  );
                                }}
                              >
                                <FontAwesomeIcon size="xs" icon={faTrashAlt} />
                              </Button>
                            </>
                          ) : (
                            ""
                          )}
                        </ButtonGroup>
                      </span>
                    </>
                  ))
                : ""}
            </div>

            {activeChunkid ? (
              <Dropdown
                as={ButtonGroup}
                align="end"
                autoClose={true}
                className="dropdown"
              >
                <Button
                  variant="light"
                  size="sm"
                  className="rounded-0"
                  onClick={() => {
                    if (activeRecipe) {
                      generateVersion(activeChunkid, activeRecipe.prompt);
                    } else {
                      handleAddChunkClick();
                    }
                  }}
                >
                  <small>
                    {" "}
                    {activeRecipe ? (
                      <>
                        <FontAwesomeIcon icon={faMagicWandSparkles} />{" "}
                        {activeRecipe.name.toUpperCase()}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faClone} /> CLONE
                      </>
                    )}
                  </small>
                </Button>

                {recipes.length > 0 ? (
                  <>
                    <Dropdown.Toggle split variant="light" size="sm">
                      <FontAwesomeIcon icon={faCaretDown} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => {
                          setActiveRecipe("");
                        }}
                      >
                        <small>
                          {" "}
                          <FontAwesomeIcon icon={faClone} /> CLONE
                        </small>{" "}
                      </Dropdown.Item>
                      {recipes.map((recipe, index) => (
                        <Dropdown.Item
                          onClick={() => {
                            setActiveRecipe(recipe);
                          }}
                        >
                          <small>
                            {" "}
                            <FontAwesomeIcon icon={faMagicWandSparkles} />{" "}
                            {recipe.name.toUpperCase()}
                          </small>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </>
                ) : (
                  ""
                )}
              </Dropdown>
            ) : (
              <Button
                variant="light"
                className="rounded-0"
                onClick={() => {
                  handleAddChunkClick();
                }}
              >
                <small>
                  {/* <FontAwesomeIcon icon={faPlus} /> */}
                  CREATE VARIATION
                </small>
              </Button>
            )}
            {/* <Button
              className="mx-1"
              variant="light"
              onClick={() => {
                handleAddChunkClick();
              }}
            >
              <small>{"Copy".toUpperCase()}</small>{" "}
              <FontAwesomeIcon icon={faPlus} />
            </Button> */}
          </Card.Body>
          {/* <Card.Footer className="p-0 m-0">
            {activeChunkid ? (
              <>
                <Select
                  options={recipes.map((recipe, i) => {
                    return {
                      label: recipe.name,
                      value: recipe.frontend_id,
                    };
                  })}
                />
              </>
            ) : (
              ""
            )}
          </Card.Footer> */}
          {/* <Card.Footer className="p-0">
            {activeChunkid ? (
              <>
                <span className="recipes">
                  {recipes.map((recipe, index) => (
                    <Button
                      className="text-truncate mx-1"
                      size="sm"
                      variant="light"
                      onClick={() => {
                        generateVersion(activeChunkid, recipe.prompt);
                      }}
                    >
                      {recipe.name}
                    </Button>
                  ))}
                </span>
              </>
            ) : (
              ""
            )}
          </Card.Footer> */}
        </Card>
      </div>
    </>
  );
});

export default ABToolbar;
