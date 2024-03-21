import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tab, Col, Nav, Row, Button, Form, Container } from "react-bootstrap";
import { faFilePen, faFlask, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Editor from "./Editor";
import Viewer from "./Viewer";
import Badge from "react-bootstrap/Badge";
import PopupToolbar from "./PopupToolbar";
import useLLM from "usellm";
import Collapse from "react-bootstrap/Collapse";
import VanillaEditor from "./VanillaEditor";

import "../../scss/documentcontainer.scss";

import {
  getChunks,
  addChunk,
  addChunks,
  getChunk,
  removeChunk,
} from "../../services/chunkService";
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../../services/documentService";
import {
  addVersion,
  updateVersion,
  removeVersion,
} from "../../services/versionService";
import VariationSidebar from "./VariationSidebar";
import Experimentor from "./Experimentor";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { recipeService } from "../../services/recipeService";
import ChatbotEditor from "./ChatbotEditor";

export default function DocumentContainer() {
  //Refs for positioning AB Toolbar
  const editorColRef = useRef(null); //For PopupToolbar Positioning
  const PopupToolbarRef = useRef(null); //For PopupToolbar Positioning

  //Edit and Preview Tab Key
  const [tabKey, setTabKey] = useState("abscribe");

  //Document name as shown in the top left-hand corner of Edit tab
  const [documentName, setDocumentName] = useState("");

  const [editingMode, setEditingMode] = useState(false); //True when a chunk is selected and ready to be edited.
  const [currentDocument, setCurrentDocument] = useState(null);

  //Timer for Updating Content to the backend (to prevent crazy number of updates as edits are being made)
  const [documentContentUpdateTimer, setDocumentContentUpdateTimer] =
    useState(null);
  const [documentNameUpdateTimer, setDocumentNameUpdateTimer] = useState(null);

  //Show saving error label beside document name when true
  const [savingError, setSavingError] = useState(false);
  const { documentId } = useParams();

  const [activeFactorId, setActiveFactorId] = useState("");
  const [activeChunkid, setActiveChunkid] = useState("");
  const [activeVersionIds, setActiveVersionIds] = useState({});

  // Sometimes, a chunk may remain in currentDocument even if no longer
  // visible in the document. This list is meant to have all chunkids
  // that are actually visible in the document.
  const [chunksVisibleInDocument, setChunksVisbleInDocument] = useState([]);

  const [PopupToolbarTop, setPopupToolbarTop] = useState("");
  const [PopupToolbarLeft, setPopupToolbarLeft] = useState("");
  const [PopupToolbarVisible, setPopupToolbarVisible] = useState(false);
  const [variationSidebarVisible, setVariationSidebarVisible] = useState(true);

  const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });
  // States for LLM Recipes
  const [recipeResult, setRecipeResult] = useState("");
  const [recipePrompt, setRecipePrompt] = useState("");
  const [recipeStreaming, setRecipeStreaming] = useState(false);
  const [recipes, setRecipes] = useState([]);

  const [activeRecipe, setActiveRecipe] = useState("");

  const [llmPrompts, setLlmPrompts] = useState([]);

  const [disablePopupToolbar, setDisablePopupToolbar] = useState(false);

  useEffect(() => {
    fetchDocument(documentId);
  }, []);

  useEffect(() => {
    setRecipeResult("");
    if (activeChunkid) {
      setPopupToolbarVisible(true);
    } else {
      setPopupToolbarVisible(false);
    }
  }, [activeChunkid]);

  useEffect(() => {
    recipeService.getRecipes().then((result) => {
      setRecipes(result);
    });
  }, []);
  const fetchDocument = async (documentId) => {
    await getDocument(documentId)
      .then((document) => {
        const document_clone = {
          _id: document._id["$oid"],
          content: document.content,
          name: document.name,
          chunks: document.chunks,
        };
        setCurrentDocument(document_clone);
        setDocumentName(document_clone.name);
        console.log("CURRENT DOCUMENT");
        console.log(document_clone);
      })
      .catch((error) =>
        console.error("Failed to fetch document from backend:", error)
      );
  };

  const createNewBlankDocument = () => {
    createDocument("")
      .then((document) => {
        console.log("Document created in backend");
        window.open(`/#/document/${document._id["$oid"]}`, "_blank");
      })
      .catch((error) =>
        console.error("Failed to create document in backend:", error)
      );
  };
  const updateDocumentName = (name) => {
    // if (!name) name = "Untitled document";

    updateDocument(currentDocument._id, currentDocument.content, name)
      .then(() => console.log("Document updated in backend"))
      .catch((error) => {
        console.error(
          "Failed to update document in backend when trying name:",
          error
        );
        setSavingError(true);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      tinyMCE.activeEditor.focus();
      updateDocumentName(e.target.value);
    }
  };

  const handleDocumentNameOnChange = (e) => {
    setDocumentName(e.target.value);
    console.log(e.target.value);

    clearTimeout(documentNameUpdateTimer);

    const newTimer = setTimeout(() => {
      updateDocumentName(e.target.value);
    }, 500);

    setDocumentNameUpdateTimer(newTimer);
  };

  const getFactorColor = (factorId) => {
    const chunks = getChunksFromFactorId(factorId);
    if (chunks.length > 0) {
      return chunks[0].style.backgroundColor;
    } else {
      const hue = Math.floor(Math.random() * 360);
      const color = `hsl(${hue}, 100%, 95%)`;
      return color;
    }
  };
  const getChunksFromFactorId = (factorId) => {
    return tinymce.activeEditor.dom.select(`span.${factorId}`);
  };

  const makeid = (length) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const createChunk = () => {
    const node = tinymce.activeEditor.selection.getNode();
    const chunk = tinymce.activeEditor.dom.getParent(node, "span.chunk");
    const range = tinymce.activeEditor.selection.getRng(0);
    const length = range.endOffset - range.startOffset;

    if (!chunk && length !== 0) {
      const createFactor = (factorId) => {
        tinymce.activeEditor.formatter.apply("factor", {
          factorId: factorId,
          color: getFactorColor(factorId),
        });
        setActiveFactorId(factorId);
      };

      const createChunksFromFactor = (factorId) => {
        const factorChunks = getChunksFromFactorId(factorId);
        const newChunks = [];
        for (const chunk of factorChunks) {
          const chunkId = "chunk_" + makeid(5);
          chunk.setAttribute("id", chunkId);
          const content = chunk.innerHTML;
          const newChunk = {
            frontend_id: chunkId,
            versions: [
              {
                frontend_id: "version_" + makeid(5),
                text: content,
              },
              // {
              //   frontend_id: "version_" + makeid(5),
              //   text: content,
              // },
            ],
          };
          setCurrentDocument((prevDocument) => {
            return {
              ...prevDocument,
              chunks: [...prevDocument.chunks, newChunk],
            };
          });
          const versionAIndex = 0; //A=0, B=1 in the versions array
          setActiveVersionIds((prevActiveVersionIds) => ({
            ...prevActiveVersionIds,
            [chunkId]: newChunk.versions[versionAIndex].frontend_id,
          }));
          newChunks.push(newChunk);
        }
        addChunks(currentDocument._id, newChunks)
          .then(() => console.log("Chunk created in backend"))
          .catch((error) =>
            console.error("Failed to create chunk in backend:", error)
          );
        setActiveChunkid(newChunks[0].frontend_id);
        console.log(newChunks.length + " Chunks Created");
      };
      const factorId = "factor_" + makeid(5);
      createFactor(factorId);
      createChunksFromFactor(factorId);
      // Update the document content with the new span
      const newContent = tinymce.activeEditor.getContent();

      updateDocument(currentDocument._id, newContent, documentName)
        .then(() =>
          console.log("Document updated in backend while adding chunk")
        )
        .catch((error) =>
          console.error("Failed to update document in backend:", error)
        );
    } else {
      const frontend_id = tinymce.activeEditor.dom.getAttrib(chunk, "id");
      const mostRecentChunkIndex = currentDocument.chunks.findIndex(
        (chunk) => chunk.frontend_id === frontend_id
      );
      const versionId = "version_" + makeid(5);
      const versionContent =
        tinymce.activeEditor.dom.get(frontend_id).innerHTML;

      createVersion(frontend_id, versionContent);
    }
    setChunksVisbleInDocument(getVisibleChunkIds());
  };

  const getVisibleChunkIds = () => {
    let visibleChunkIds = [];
    let visibleChunkElements = tinymce.activeEditor.dom.select(`span.chunk`);
    for (let element of visibleChunkElements) {
      visibleChunkIds.push(tinymce.activeEditor.dom.getAttrib(element, "id"));
    }
    return visibleChunkIds;
  };

  const createVersion = (chunkId, versionContent) => {
    const frontend_id = chunkId;
    const mostRecentChunkIndex = currentDocument.chunks.findIndex(
      (chunk) => chunk.frontend_id === frontend_id
    );
    const versionId = "version_" + makeid(5);

    setCurrentDocument((prevDocument) => {
      const updatedChunks = prevDocument.chunks.map((chunk) => {
        if (chunk.frontend_id === frontend_id) {
          return {
            ...chunk,
            versions: [
              ...chunk.versions,
              {
                frontend_id: versionId,
                text: versionContent,
              },
            ],
          };
        }
        return chunk;
      });

      return {
        ...prevDocument,
        chunks: updatedChunks,
      };
    });

    // Update the active version ID for the chunk with the newly added version
    setActiveVersionIds((prevActiveVersionIds) => ({
      ...prevActiveVersionIds,
      [frontend_id]: versionId,
    }));
    // Call addVersion service to update the backend
    addVersion(currentDocument._id, mostRecentChunkIndex, {
      frontend_id: versionId,
      text: versionContent,
    })
      .then(() => console.log("Version added in backend"))
      .catch((error) =>
        console.error("Failed to add version in backend:", error)
      );
    return versionId;
  };

  async function generateVersion(chunkId, prompt) {
    //Helper Functions
    function getStartWord() {
      const chunk = tinymce.activeEditor.dom.get(chunkId);
      const words = chunk.innerHTML.split(" ");
      return words[0];
    }

    function getEndWord() {
      const chunk = tinymce.activeEditor.dom.get(chunkId);
      const words = chunk.innerHTML.split(" ");
      return words[words.length - 1];
    }

    function checkCompletenessStart() {
      const chunk = tinymce.activeEditor.dom.get(chunkId);
      if (!chunk.previousSibling || chunk.previousSibling.nodeName == "BR") {
        return true;
      }
      const before = chunk.previousSibling.data;
      if (before.length === 0) {
        return true;
      }
      // ACCOUNT FOR WHITESPACE?
      const alphaNumeric = /^[a-zA-Z0-9]+$/.test(before[before.length - 1]);
      return !alphaNumeric;
    }
    //Check Completeness For End
    function checkCompletenessEnd() {
      const chunk = tinymce.activeEditor.dom.get(chunkId);
      if (!chunk.nextSibling || chunk.nextSibling.nodeName == "BR") {
        return true;
      }
      const after = chunk.nextSibling.data;
      if (after.length === 0) {
        return true;
      }
      // ACCOUNT FOR WHITESPACE?
      const alphaNumeric = /^[a-zA-Z0-9]+$/.test(after[0]);
      return !alphaNumeric;
    }

    let entireText = tinymce.activeEditor.getContent();
    console.log(recipes);
    let element = tinymce.activeEditor.dom.get(chunkId);
    console.log("Element looks like:");
    console.log(element);
    let htmlText = "";

    try {
      console.log("START INDEX");
      console.log(checkCompletenessStart());
      console.log("END INDEX");
      console.log(checkCompletenessEnd());
      console.log(getStartWord());
      console.log(getEndWord());

      const startBool = checkCompletenessStart();
      const endBool = checkCompletenessEnd();
      const startWord = getStartWord();
      const endWord = getEndWord();

      let followup = "";
      let punctiation = "";

      if (startBool && endBool) {
        followup = "There are no incomplete words in the text originally in the triple tildes, apply the user command to the entire text in the triple tildes."
      }
      else if (startBool && !endBool) {
        followup = `Since ${endWord} is an incomplete word, your output should end exactly with ${endWord} and the user request should only be applied to the text before ${endWord} from the previous system message.`
      }
      else if (!startBool && endBool) {
        followup = `Since ${startWord} is an incomplete word, your output should start with exactly ${startWord} and the user request should only be applied to the text after ${startWord} from the previous system message.`
      }
      else {
        followup = `Since ${startWord} and ${endWord} are incomplete words, your output should start with exactly ${startWord} and end in ${endWord} and the user request should only be applied to the text after ${startWord} and before ${endWord} from the previous system message.`
      }

      if (element.innerText.length > 0 && /[A-Z]/.test(element.innerText[0])) {
        followup += " Be sure to start your output with a capital letter."
      }
      else if (element.innerText.length > 0 && /[a-z]/.test(element.innerText[0])) {
        followup += " Be sure to start your output with a lowercase letter."
      }
      if (/.*[.,;:!?]$/.test(element.innerText)) {
        punctiation = element.innerText[element.innerText.length - 1];
      }
      if (punctiation.length > 0) {
        followup += ` Make sure your output ends in the punctuation mark: ${punctiation}`
      }
      else {
        followup += " Make sure your output DOES NOT end in a punctuation mark."
      }

      console.log("FOLLOWUP:");
      console.log(followup);

      await fetchEventSource("http://127.0.0.1:8080/chatGPT/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        openWhenHidden: true,
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are given a version of some text delimited by triple tildes.
              Everything in this system message that is written in all caps is especially important and should not be ignored or else the output will be ruined!
              You are tasked with applying the specifications given by the user to the text delimited by the triple tildes. ONLY OUTPUT THE MODIFIED TEXT, DO NOT INTRO OUR OUTPUT OR REPEAT ANY OF THE INSTRUCTIONS!
              If the user asks for an example, THEY ARE ASKING FOR AN EXAMPLE RELEVANT TO THE TEXT IN THE TRIPLE TILDES. ADD OUR RELEVANT EXAMPLE TO THE FOUNDATION TEXT IN THE TRIPLE TILDES, DO NOT COMPLETELY REPlACE THE TEXTIN THE TRIPLE TILDES
              ~~~${element.innerHTML}~~~
              Do not surround your response with tildes at all! If an triple tildes are included at the beginning or end of your output, THE OUTPUT WILL BE RUINED!
              If the users asks to modify the style of the text (i.e. bold, italics, etc.), use html tags. Use only the basic html tags without any alternative characters, for example bolding is <b></b>, Italicizing is <i></i>, and all other tags should be outputted in the same simple manner. DO NOT INCLUDE ANY AMPERSANDS WHEN OUTPUTTING YOUR HTML TAGS! DO NOT USE '&gt;' TO REPRESENT '>' AND DO NOT USE '&lt;' TO REPRESENT '<'! Do not forget to include these tags if the user mentions anything about bolding, italicizing, etc.
              If there are any incomplete words at the beginning or end of the text delimited by the triple tildes, keep those incomplete words exactly the same when generating the output. Incomplete words can be defined as those that do not have any meaning in English or break spelling or break phonotactic rules (i.e. no vowels). Do not include any new ideas in your output. If your output contains any thoughts or words that cannot be mapped onto the original text in the triple tildes, remove them from the final output.
              Also, an reference the user makes to 'it' or 'the text', they are referring to the text delimited by the triple tildes, not the entire system message, so ONLY CONSIDER THE TEXT IN THE TRIPLE TILDES WHEN ANSWERING SUCH A REQUEST.
              If the original text in the triple tildes ends in a punctiation mark like a period or explanation mark, keep the punctuation there. Otherwise, do not end your output in any punctuation. 
              If the first letter of the text in the triple tildes begins in a lowercase letter, the output must also start with a lowercase letter, and if the text begins with an uppercase letter, your output should begin with an uppercase letter. For example, if the first word is 'an', the output should start with a lowercase letter, and if the first word is 'One', then the output should start with an uppercase letter.
              PLEASE DO NOT INCLUDE ANY TILDES AT THE START OR END OF THE OUTPUT! IF YOU DO THE OUTPUT WILL BE RUINED!
              IF THE USERS ASKS YOU TO TRANSLATE, MAKE SURE TO NOT INCLUDE ANY TILDES IN OUR OUTPUT!
              DO NOT REOUTPUT ANYTHING THE USER SAYS. DO NOT REOUTPUT ANYTHING FROM THIS SYSTEM MESSAGE.
              BEFORE OUTPUTTING CHECK ONE MORE TIME IF YOUR OUTPUT INCLUDES TILDES, IF SO, REMOVE THEM. ALSO IF YOU FIND YOURSELF RESTATING ANY OF THE INSTRUCTIONS ABOVE, STOP, AND ONLY OUTPUT WHAT THE USER REQUESTS!`,
            },
            {
              role: "system",
              content: followup,
            },
            {
              role: "user",
              content: `${prompt}`,
            },
          ],
        }),
        async onopen(response) {
          // just remove the generating... text.
          setDisablePopupToolbar(true);
          tinymce.activeEditor.dom.setHTML(element, "");
        },
        onmessage(message) {
          console.log(`generating version. Snippet received: ${message.data}`);

          if (message.data.includes("><") || message.data.includes("></")) {
            console.log("CASE 1");
            htmlText += message.data.slice(0, message.data.indexOf(">") + 1);
            console.log(htmlText);
            tinymce.activeEditor.dom.setHTML(
              element,
              element.innerHTML + htmlText
            );
            if (htmlText.includes("</")) {
              element = element.parentElement;
            }
            else {
              element = element.children[element.children.length - 1];
            }
            htmlText = message.data.slice(message.data.indexOf(">") + 1)
          }
          else if (/^.*<(\/?\w*)?$/.test(message.data.trim())) {
            console.log("CASE 2");
            htmlText += message.data;
          }
          else if (/.*\/?>/.test(message.data.trim())) {
            console.log("CASE 3");
            htmlText += message.data;
            console.log(htmlText);
            tinymce.activeEditor.dom.setHTML(
              element,
              element.innerHTML + htmlText,
            );
            if (htmlText.includes("</")) {
              element = element.parentElement;
            }
            else {
              element = element.children[element.children.length - 1];
            }
            console.log(element.children[element.children.length - 1]);
            htmlText = "";
          }
          else {
            if (htmlText.length > 0) {
              console.log("CASE 5");
              htmlText += message.data
            }
            else {
              console.log("CASE 6");
              tinymce.activeEditor.dom.setHTML(
                element,
                element.innerHTML + message.data
              );
              console.log(element.innerHTML);
            }
          }
        },
        onclose() {
          // Finishes updating the document with the generated content. Also does other teardown code to end the streaming process.
          console.log("Closing generated version eventSource!");
          setDisablePopupToolbar(false);

          const current_version =
            tinymce.activeEditor.dom.get(activeChunkid).innerHTML; // FIXME: for some reason leaving this name unimported is actually the way to keep the app working?
          const versionId = createVersion(chunkId, current_version);
          setCurrentDocument((prevDocument) => {
            const updatedChunks = prevDocument.chunks.map((chunk) => {
              if (chunk.frontend_id === activeChunkid) {
                const updatedVersions = chunk.versions.map((version) => {
                  if (version.frontend_id === versionId) {
                    return { ...version, text: current_version };
                  }
                  return version;
                });

                return { ...chunk, versions: updatedVersions };
              }
              return chunk;
            });

            return {
              ...prevDocument,
              chunks: updatedChunks,
            };
          });
        },
        onerror(err) {
          throw err;
        },
      });
    } catch (error) {
      console.error("Something went wrong!", error);
    }
  }

  const getVersionIndexFromId = (chunk, versionId) => {
    const versionIndex = chunk.versions.findIndex(
      (version) => version.frontend_id === versionId
    );
    return versionIndex;
  };
  const getChunkFromId = (chunkId) => {
    const chunkIndex = getChunkIndexFromId(chunkId);
    return currentDocument.chunks[chunkIndex];
  };

  const deleteChunk = (chunkId, versionId) => {
    console.log("Chunk ID: " + chunkId + "|| Version ID: " + versionId);

    setCurrentDocument((prevDocument) => {
      const updatedChunks = prevDocument.chunks.map((chunk) => {
        if (chunk.frontend_id === chunkId) {
          const updatedVersions = chunk.versions.filter(
            (version) => version.frontend_id !== versionId
          );
          // so the issue is that we need index not id
          console.log("Updated Versions;");

          console.log(updatedVersions);
          const chunkIndex = getChunkIndexFromId(chunkId);
          const versionIndex = getVersionIndexFromId(
            getChunkFromId(chunkId),
            versionId
          );

          // Call removeChunk or removeVersion service to update the backend
          if (chunk.versions.length === 1) {
            removeChunk(currentDocument._id, chunkIndex)
              .then(() => {
                console.log("Chunk removed from backend");
                const element = tinymce.activeEditor.dom.get(chunkId);
                console.log(element);
                // tinymce.activeEditor.formatter.remove("factor", {}, element);
                tinymce.activeEditor.dom.removeAllAttribs(element);
                setActiveChunkid("");
              })
              .catch((error) =>
                console.error("Failed to remove chunk from backend:", error)
              );
          } else {
            removeVersion(currentDocument._id, chunkIndex, versionIndex)
              .then(() => {
                console.log("Version removed from backend");
                let newActiveVersionId =
                  updatedVersions[updatedVersions.length - 1].frontend_id;
                setActiveVersionIds((prevState) => ({
                  ...prevState,
                  [chunkId]: newActiveVersionId,
                }));
                console.log("active version ids");
                console.log(activeVersionIds);
                updateChunk(chunkId, newActiveVersionId);
              })
              .catch((error) =>
                console.error("Failed to remove version from backend:", error)
              );
          }

          return { ...chunk, versions: updatedVersions };
        }
        return chunk;
      });

      const cleanedChunks = updatedChunks.filter(
        (chunk) => chunk.versions.length !== 0
      );

      return {
        ...prevDocument,
        chunks: cleanedChunks,
      };
    });
  };
  const getChunkIndexFromId = (chunkId) => {
    const index = currentDocument.chunks.findIndex(
      (chunk) => chunk.frontend_id === chunkId
    );
    return index;
  };
  const updateChunk = (chunkId, versionId) => {
    const chunkIndex = currentDocument.chunks.findIndex(
      (chunk) => chunk.frontend_id === chunkId
    );
    const chunk = currentDocument.chunks[chunkIndex];
    console.log("Chunk: ", chunk);
    if (!chunk) {
      console.log("Chunk not found");
      return;
    }

    const versionIndex = chunk.versions.findIndex(
      (version) => version.frontend_id === versionId
    );
    if (versionIndex !== -1) {
      const version = chunk.versions[versionIndex];
      console.log("Version: ", version);
      // console.log("Version_Index: ", versionIndex);

      const element = tinymce.activeEditor.dom.get(chunkId);
      // const element = tinymce.activeEditor.dom.select(`span.${chunkId}`)[0];
      tinymce.activeEditor.dom.setHTML(element, version.text);

      // Call updateVersion service to update the backend
      updateVersion(currentDocument._id, chunkIndex, versionIndex, version)
        .then(() => console.log("Version updated in backend"))
        .catch((error) =>
          console.error("Failed to update version in backend:", error)
        );
    } else {
      console.log(`Version Index (${versionIndex}) Invalid`);
    }
  };

  const updatePopupToolbarLocation = (node) => {
    if (node) {
      tinymce.activeEditor.selection.select(node);
    }
    // Selection Related Variables
    let selection = tinymce.activeEditor.selection;
    let getRange = selection.getRng(0);
    let selectionRect = getRange.getBoundingClientRect();
    let editorRect = editorColRef.current.getBoundingClientRect();
    let PopupToolbarRect = PopupToolbarRef.current.getBoundingClientRect();

    // Set the PopupToolbar Position
    setPopupToolbarTop(selectionRect.top + 80 + "px");
    setPopupToolbarLeft(
      selectionRect.left +
        editorRect.left +
        selectionRect.width * 0.5 -
        PopupToolbarRect.width * 0.5 +
        "px"
    );
  };
  const getVersionIdFromText = (chunkId, versionContent) => {
    if (chunkId && versionContent) {
      const chunk = getChunkFromId(chunkId);
      const versionIndex = chunk.versions.findIndex(
        (version) => version.text === versionContent
      );
      return chunk.versions[versionIndex]?.frontend_id;
    }
    return 0;
  };
  const updateActiveVersionIds = () => {
    if (!currentDocument) return;
    let newActiveVersionIds = {};
    const chunkElements = tinymce.activeEditor.dom.select(`span.chunk`);
    chunkElements.forEach((element) => {
      const chunkId = element.id;
      const versionContent = element.innerHTML;
      const versionId = getVersionIdFromText(chunkId, versionContent);
      newActiveVersionIds[chunkId] = versionId;
    });
    setActiveVersionIds(newActiveVersionIds);
    console.log("active version ids");
    console.log(newActiveVersionIds);
  };

  const updateActiveVersionId = (chunkId) => {
    const chunkElement = tinymce.activeEditor.dom.get(chunkId);
    const versionContent = chunkElement.innerHTML;
    const versionId = getVersionIdFromText(chunkId, versionContent);
    setActiveVersionIds((prevState) => ({
      ...prevState,
      [chunkId]: versionId,
    }));
    console.log(`Active Version Id for Chunk ${chunkId} set to ${versionId}`);
  };

  return (
    <>
      <Tab.Container defaultActiveKey={tabKey} onSelect={(k) => setTabKey(k)}>
        <Row>
          <Col md={12} className="m-0">
            <Nav
              variant="tabs"
              className="flex-row justify-content-between align-items-center"
            >
              <div className="d-flex align-items-center">
                <Button variant="light" href="/#/">
                  <FontAwesomeIcon icon={faFilePen} />
                </Button>
                <Form.Control
                  className="document-name text-truncate"
                  type="text"
                  placeholder="Untilted document"
                  value={documentName}
                  onChange={(e) => {
                    handleDocumentNameOnChange(e);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <span className="d-flex align-items-center">
                {savingError ? (
                  <Badge className="m-2" bg="danger">
                    Couldn't Connect to Server
                  </Badge>
                ) : (
                  ""
                )}
                {/* <Nav.Item>
                  <Nav.Link eventKey="abscribe">A</Nav.Link>
                </Nav.Item> */}
                {/* <Nav.Item>
                  <Nav.Link eventKey="text">B</Nav.Link>
                </Nav.Item> */}
                {/* <Nav.Item>
                  <Nav.Link eventKey="test">
                    <FontAwesomeIcon icon={faFlask} /> A/B Tests
                  </Nav.Link>
                </Nav.Item> */}
              </span>
            </Nav>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Tab.Content>
              <Tab.Pane eventKey="abscribe">
                <Container fluid className="m-0">
                  <Row>
                    <Col
                      ref={editorColRef}
                      className="p-0"
                    >
                      <PopupToolbar
                        ref={PopupToolbarRef}
                        top={PopupToolbarTop}
                        left={PopupToolbarLeft}
                        visible={PopupToolbarVisible}
                        activeChunkid={activeChunkid}
                        createChunk={createChunk}
                        currentDocument={currentDocument}
                        updateChunk={updateChunk}
                        activeVersionIds={activeVersionIds}
                        setActiveVersionIds={setActiveVersionIds}
                        deleteChunk={deleteChunk}
                        setEditingMode={setEditingMode}
                        getFactorColor={getFactorColor}
                        activeFactorId={activeFactorId}
                        recipes={recipes}
                        setActiveRecipe={setActiveRecipe}
                        activeRecipe={activeRecipe}
                        generateVersion={generateVersion}
                        disable={disablePopupToolbar}
                      />
                      <Editor
                        createNewBlankDocument={createNewBlankDocument}
                        documentName={documentName}
                        editingMode={editingMode}
                        setEditingMode={setEditingMode}
                        currentDocument={currentDocument}
                        setCurrentDocument={setCurrentDocument}
                        documentContentUpdateTimer={documentContentUpdateTimer}
                        setDocumentContentUpdateTimer={
                          setDocumentContentUpdateTimer
                        }
                        activeFactorId={activeFactorId}
                        setActiveFactorId={setActiveFactorId}
                        activeChunkid={activeChunkid}
                        setActiveChunkid={setActiveChunkid}
                        activeVersionIds={activeVersionIds}
                        setActiveVersionIds={setActiveVersionIds}
                        getFactorColor={getFactorColor}
                        getChunksFromFactorId={getChunksFromFactorId}
                        chunksVisibleInDocument={chunksVisibleInDocument}
                        setChunksVisbleInDocument={setChunksVisbleInDocument}
                        PopupToolbarVisible={PopupToolbarVisible}
                        setPopupToolbarVisible={setPopupToolbarVisible}
                        updateChunk={updateChunk}
                        updatePopupToolbarLocation={updatePopupToolbarLocation}
                        PopupToolbarTop={PopupToolbarTop}
                        setPopupToolbarTop={setPopupToolbarTop}
                        PopupToolbarLeft={PopupToolbarLeft}
                        setPopupToolbarLeft={setPopupToolbarLeft}
                        variationSidebarVisible={variationSidebarVisible}
                        setVariationSidebarVisible={setVariationSidebarVisible}
                        createChunk={createChunk}
                        deleteChunk={deleteChunk}
                        createVersion={createVersion}
                        getChunkIndexFromId={getChunkIndexFromId}
                        getChunkFromId={getChunkFromId}
                        updateActiveVersionIds={updateActiveVersionIds}
                        updateActiveVersionId={updateActiveVersionId}
                        getVisibleChunkIds={getVisibleChunkIds}
                        llmPrompts={llmPrompts}
                        setLlmPrompts={setLlmPrompts}
                        recipePrompt={recipePrompt}
                        setRecipePrompt={setRecipePrompt}
                        recipeStreaming={recipeStreaming}
                        setRecipeStreaming={setRecipeStreaming}
                        recipeResult={recipeResult}
                        setRecipeResult={setRecipeResult}
                        recipes={recipes}
                        setRecipes={setRecipes}
                        activeRecipe={activeRecipe}
                        setActiveRecipe={setActiveRecipe}
                        generateVersion={generateVersion}
                      />
                    </Col>
                    <Collapse in={variationSidebarVisible} dimension={"width"}>
                      <Col md={3} className="p-0">
                        <VariationSidebar
                          setTabKey={setTabKey}
                          activeChunkid={activeChunkid}
                          setActiveChunkid={setActiveChunkid}
                          currentDocument={currentDocument}
                          activeVersionIds={activeVersionIds}
                          setActiveVersionIds={setActiveVersionIds}
                          getFactorColor={getFactorColor}
                          activeFactorId={activeFactorId}
                          visibleChunks={chunksVisibleInDocument}
                          setPopupToolbarVisible={setPopupToolbarVisible}
                          updateChunk={updateChunk}
                          updatePopupToolbarLocation={updatePopupToolbarLocation}
                          variationSidebarVisible={variationSidebarVisible}
                          setVariationSidebarVisible={setVariationSidebarVisible}
                          getChunkIndexFromId={getChunkIndexFromId}
                          getVersionIndexFromId={getVersionIndexFromId}
                          updateActiveVersionId={updateActiveVersionId}
                          createVersion={createVersion}
                          deleteChunk={deleteChunk}
                          makeid={makeid}
                          recipePrompt={recipePrompt}
                          setRecipePrompt={setRecipePrompt}
                          recipeStreaming={recipeStreaming}
                          setRecipeStreaming={setRecipeStreaming}
                          recipeResult={recipeResult}
                          setRecipeResult={setRecipeResult}
                          recipes={recipes}
                          setRecipes={setRecipes}
                          activeRecipe={activeRecipe}
                          setActiveRecipe={setActiveRecipe}
                          generateVersion={generateVersion}
                        />
                      </Col>
                    </Collapse>
                  </Row>
                </Container>
              </Tab.Pane>
              {/* <Tab.Pane eventKey="text">
                <Container fluid className="m-0">
                  <Row>
                    <Col className="p-0">
                      <ChatbotEditor />
                    </Col>
                  </Row>
                </Container>
              </Tab.Pane> */}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </>
  );
}
