import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";

import { Editor as TinyEditor } from "@tinymce/tinymce-react";
import useLLM from "usellm";
import parse from "html-react-parser";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import PlaceHolder from "../../resources/placeHolderImg.png";

import "../../scss/editor.scss";

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
import { ButtonGroup } from "react-bootstrap";

function AIVisor({ llmOutput }) {
  return (
    <div>
      <p>{llmOutput}</p>
    </div>
  );
}

export default function Editor({
  createNewBlankDocument,
  currentDocument,
  setCurrentDocument,
  documentContentUpdateTimer,
  setDocumentContentUpdateTimer,
  activeFactorId,
  setActiveFactorId,
  activeChunkid,
  setActiveChunkid,
  activeVersionIds,
  setActiveVersionIds,
  getFactorColor,
  getChunksFromFactorId,
  chunksVisibleInDocument,
  setChunksVisbleInDocument,
  PopupToolbarVisible,
  setPopupToolbarVisible,
  updateChunk,
  updatePopupToolbarLocation,
  PopupToolbarTop,
  PopupToolbarLeft,
  setPopupToolbarTop,
  setPopupToolbarLeft,
  ideaBucketVisible,
  setIdeaBucketVisible,
  createChunk,
  deleteChunk,
  createVersion,
  getChunkIndexFromId,
  editingMode,
  setEditingMode,
  getChunkFromId,
  updateActiveVersionIds,
  updateActiveVersionId,
  documentName,
  getVisibleChunkIds,
  llmPrompts,
  setLlmPrompts,
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
  //React-Router-DOM
  const navigate = useNavigate();
  const { documentId } = useParams();

  //LLM Integration
  const llm = useLLM({ serviceUrl: "https://usellm.org/api/llm" });

  //Refs
  const editorRef = useRef(null); //TinyMCE Editor

  //States
  const [gptActive, setGptActive] = useState(false);
  const [llmButtonsTop, setLlmButtonsTop] = useState("");
  const [llmButtonsLeft, setLlmButtonsLeft] = useState("");
  const [llmStopButtonVisible, setLlmStopButtonVisible] = useState(false);

  const [factorColors, setFactorColors] = useState({});

  const [llmResult, setLlmResult] = useState("");
  const [llmPrompt, setLlmPrompt] = useState("");
  const [llmPromptsList, setLlmPromptsList] = useState([]);
  const [llmStreaming, setLlmStreaming] = useState(false);
  const [llmImage, setLlmImage] = useState("");
  const [llmContinue, setLlmContinue] = useState(true);
  const [llmId, setLlmId] = useState([]);
  const [inline, SetInline] = useState(true);

  const [value, setValue] = useState(currentDocument?.content ?? "");

  const [items, setItems] = useState([
    {
      type: "menuitem",
      text: "Menu item 1",
      onAction: function () {
        editor.insertContent(" <em>You clicked menu item 1!</em>");
      },
    },
  ]);

  useEffect(() => {
    if (activeChunkid === "") {
      setEditingMode(false);
    } else {
      setPopupToolbarVisible(true);
      setEditingMode(true);
    }
  }, [activeChunkid]);

  useEffect(() => {
    if (llmStreaming && llmContinue && editorRef !== "") {
      const nodeArray = editorRef.current.editor.dom.select(".answer");
      //console.log(nodeArray)
      //console.log("Result:")
      //console.log(llmResult)
      setLlmStopButtonVisible(true);
      const nodeId = "id" + llmId[llmId.length - 1];
      updateLlmButtonLocation();
      if (nodeArray) {
        let node = nodeArray[0];
        editorRef.current.editor.dom.addClass(node, "llmparagraph");
        editorRef.current.editor.dom.addClass(node, `${nodeId}`);
        editorRef.current.editor.dom.remove("llmresult");
        editorRef.current.editor.dom.add(
          node,
          "span", // Must be a div and not a span because we might need to place multiple paragraphs.
          { id: "llmresult" },
          llmResult // FYI: If the value in this field has HTML tags, it'll pop out of the span.
        );
      }
    }
  }, [llmResult, llmStreaming, llmContinue]);

  // useEffect(() => {
  //   if (
  //     editorRef.current !== null &&
  //     editorRef.current.editor !== undefined &&
  //     inline
  //   ) {
  //     SetInline(false);
  //     console.log(inline);
  //     editorRef.current.editor.on("keydown", function (event) {
  //       console.log(event.keyCode);
  //       if (event.keyCode == "16") {
  //         // 16 is for Shift, for TAB change to 9
  //         let highlightedText = "";
  //         const selectedText =
  //           editorRef.current.editor.selection.getNode().innerHTML;
  //         const match = selectedText.match(/\*(.*?)\*/g);
  //         //console.log(selectedText)
  //         //console.log(match)
  //         if (match) {
  //           highlightedText = match[0];
  //           console.log(highlightedText);
  //           console.log(highlightedText.replace(/<\/?[^>]+(>|$)/g, ""));
  //           const node = editorRef.current.editor.selection.getNode();
  //           const originalContent =
  //             editorRef.current.editor.selection.getNode().innerHTML;
  //           const modifiedText = highlightedText.replace(/<\/?[^>]+(>|$)/g, "");
  //           const modifiedOriginalContent = originalContent.replace(
  //             highlightedText,
  //             modifiedText
  //           );
  //           console.log(modifiedOriginalContent);
  //           const newContent = modifiedOriginalContent.replace(
  //             modifiedText,
  //             `<span class='inline-prompt'>${modifiedText.replace(
  //               /\*/g,
  //               ""
  //             )}</span>`
  //           );
  //           console.log(newContent);
  //           node.innerHTML = newContent;
  //           //console.log(node)
  //           const promptNode = node.querySelector(".inline-prompt");
  //           const promptText = promptNode.textContent;
  //           //console.log(promptText)
  //           //console.log(promptNode)
  //           getLLMResult(promptText, promptNode);

  //           //event.preventDefault();
  //         } else {
  //           highlightedText = null;
  //         }
  //       }
  //     });
  //   }
  // });

  useEffect(() => {
    if (llmImage !== "") {
      updateLlmButtonLocation();
      editorRef.current.editor.selection.setContent(
        `<img src="${llmImage}" width="256" height="256" class="shadow currImg">`
      );
      editorRef.current.editor.dom.remove("placeHolder");
    }
  }, [llmImage]);

  const handleEditorClick = () => {
    const node = editorRef.current.editor.selection.getNode();
    const chunk = editorRef.current.editor.dom.getParent(node, "span.chunk");
    const chunkClass = editorRef.current.editor.dom.getAttrib(chunk, "class");
    const factorId = chunkClass.match(/factor_.....*/);
    console.log("Factor ID: " + factorId);
    if (factorId) {
      setActiveFactorId(factorId[0]);
      console.log(factorColors);
      console.log("Factor Id Updated to " + factorId);
    }
    if (chunk) {
      const chunkid = editorRef.current.editor.dom.getAttrib(chunk, "id");
      console.log(`Chunk Found: ${chunkid}`);
      const chunkFromDocument = currentDocument.chunks.find(
        (chunk) => chunk.frontend_id === chunkid
      );
      if (chunkFromDocument) {
        console.log(`Chunk From Document Found: ${chunkid}`);
        console.log(currentDocument);
        setActiveChunkid(chunkid);
        if (!activeVersionIds[chunkid]) {
          console.log("Active Version Ids Updated");
          updateActiveVersionId(chunkid);
        }
        setEditingMode(true);
      }
    } else {
      setActiveChunkid("");
      let selection = editorRef.current.editor.selection;
      let range = selection.getRng(0);
      const length = Math.abs(range.endOffset - range.startOffset);
      if (length === 0) {
        setPopupToolbarVisible(false);
      }
    }
  };

  // Buggy version with partial support for sub-chunk selection
  //   const handleEditorClick = () => {
  //     const node = editorRef.current.editor.selection.getNode();
  //     const chunk = editorRef.current.editor.dom.getParent(node, "span.chunk");
  //     const chunkClass = editorRef.current.editor.dom.getAttrib(chunk, "class");
  //     const factorId = chunkClass.match(/factor_.....*/);
  //     let selection = editorRef.current.editor.selection;
  //     let range = selection.getRng(0);
  //     const length = Math.abs(range.endOffset - range.startOffset);
  //     console.log("Factor ID: " + factorId);
  //     if (factorId) {
  //       setActiveFactorId(factorId[0]);
  //       console.log(factorColors);
  //       console.log("Factor Id Updated to " + factorId);
  //     }
  //     if (chunk && length === 0) {
  //       const chunkid = editorRef.current.editor.dom.getAttrib(chunk, "id");
  //       console.log(`Chunk Found: ${chunkid}`);
  //       const chunkFromDocument = currentDocument.chunks.find(
  //         (chunk) => chunk.frontend_id === chunkid
  //       );
  //       if (chunkFromDocument) {
  //         console.log(`Chunk From Document Found: ${chunkid}`);
  //         console.log(currentDocument);
  //         setActiveChunkid(chunkid);
  //         if (!activeVersionIds[chunkid]) {
  //           console.log("Active Version Ids Updated");
  //           updateActiveVersionId(chunkid);
  //         }
  //         setEditingMode(true);
  //       }
  //     } else {
  //       setActiveChunkid("");
  //       if (length === 0) {
  //         setPopupToolbarVisible(false);
  //       }
  //     }
  //   };

  const handleEditorMouseUp = () => {
    updatePopupToolbarLocation();

    let selection = editorRef.current.editor.selection;
    let range = selection.getRng(0);
    const length = Math.abs(range.endOffset - range.startOffset);
    if (length > 0 || activeChunkid !== "") {
      setPopupToolbarVisible(true);
    } else {
      setPopupToolbarVisible(false);
    }
  };

  const handleEditorOnSelectionChange = () => {
    // handleEditorClick();
    // updatePopupToolbarLocation();
  };

  const handleEditorOnChange = () => {
    console.log("handleEditorOnChange");
    if (editingMode) {
      const chunk = currentDocument.chunks.find(
        (chunk) => chunk.frontend_id === activeChunkid
      );
      const activeVersion = chunk.versions.find(
        (version) => version.frontend_id === activeVersionIds[activeChunkid]
      );

      const current_version =
        editorRef.current.editor.dom.get(activeChunkid).innerHTML;

      setCurrentDocument((prevDocument) => {
        const updatedChunks = prevDocument.chunks.map((chunk) => {
          if (chunk.frontend_id === activeChunkid) {
            const updatedVersions = chunk.versions.map((version) => {
              if (version.frontend_id === activeVersion?.frontend_id) {
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
    }

    console.log("Editor Current Document Looks Like:");
    console.log(currentDocument._id);
    const newContent = editorRef.current.editor.getContent();

    clearTimeout(documentContentUpdateTimer);

    const newTimer = setTimeout(() => {
      updateDocument(currentDocument._id, newContent)
        .then(() => console.log("Document updated in backend in Editor"))
        .catch((error) =>
          console.error("Failed to update document in backend:", error)
        );
    }, 500);

    setChunksVisbleInDocument(getVisibleChunkIds());
    console.log(chunksVisibleInDocument);

    setDocumentContentUpdateTimer(newTimer);
  };

  const updateLlmButtonLocation = () => {
    const nodeArray = editorRef.current.editor.dom.select("#llmresult");
    if (nodeArray[0]) {
      let node = nodeArray[0];
      let nodeRect = node.getBoundingClientRect();

      // console.log(rect.top, rect.right, rect.bottom, rect.left);
      setLlmButtonsTop(nodeRect.top + 55 + "px");
      setLlmButtonsLeft(nodeRect.left + "px");
    }
  };


  async function getLLMResult(promptText, promptNode) {
    function countTags(text) {
      var count = 0;
      var inTag = false;
      for (var char = 0; char < text.length; char++) {
        if (text[char] === '<') {
          inTag = true;
        }

        if (inTag === false) {
          count = count + 1;
        }

        if (text[char] === '>') {
          inTag = false;
        }
      }
      return count + 1;
    }
    if (editorRef !== "") {
      try {
        console.log("Inside getLLMResult");
        editorRef.current.editor.dom.addClass(promptNode, "answer");
        editorRef.current.editor.dom.setHTML(promptNode, "");
        const currPrompts = llmPromptsList;
        currPrompts.push(promptText);
        setLlmPromptsList(currPrompts);

        const idArray = llmId;
        console.log(idArray);
        let index = -1;
        if (llmId.length === 0) {
          index = -1;
        } else {
          index = llmId[llmId.length - 1];
          console.log("array:");
          console.log(llmId);
        }
        llmId.push(index + 1);
        setLlmId(llmId);

        if (promptText.includes("image") || promptText.includes("picture")) {
          editorRef.current.editor.selection.setContent(
            `<img id= 'placeHolder' src=${PlaceHolder} width="256" height="256">`
          );
          setLlmImage("");
          const { images } = await llm.generateImage({ prompt: promptText });
          setLlmImage(images[0]);
        } else {
          setLlmImage("");
          setLlmContinue(true);
          setLlmResult("");

          console.log(`PromptText before streaming: ${promptText}`);
          let entireText = tinymce.activeEditor.getContent();
          let cleanText = tinymce.activeEditor.getContent({ format: 'text' })
          console.log("ENTIRE TEXT");
          console.log(entireText);
          const sections = entireText.split('<p class="answer">&nbsp;</p>');
          console.log("PART 1");
          console.log(sections[0]);
          console.log(countTags(sections[0]));
          console.log(cleanText.slice(0, countTags(sections[0])));
          console.log("PART 2");
          console.log(sections[1]);
          console.log(cleanText.slice(countTags(sections[0])));
          let contextText = [];
          if ((sections[0] === "" || sections[1] === null) && (sections[0] === "" || sections[1] === null)) {
            contextText = [{ role: "user", content: promptText}]
          }
          else {
            contextText = [{role: "system", content: `You are given a version of text whose first part is delimited by the triple angle brackets, while the second part is delimited by the triple dollar signs.
            <<<${cleanText.slice(0, countTags(sections[0]))}>>>
            $$$${cleanText.slice(countTags(sections[0]))}$$$
            Answer any future requests made by the user as normal but tailor the output to fit into the two sections of text if the user message requires it. If the user request pertains to something other than the text, disregard the text when generating output.
            Pay close attention to what sections of the text the user asks to be considered. If the user only mentions the text above or uses words like recent or latest, only consider the text in the triple angle brackets (YOU ARE NOT ALLOWED TO INCORPORATE ANYTHING FROM THE TRIPLE DOLLAR SIGNS IN YOUR OUTPUT), if the user asks to consider the text below, only look at the text in the triple dollar signs (YOU ARE NOT ALLOWED TO INCORPORATE ANYTHING FROM THE TRIPLE ANGLE BRACKETS IN YOUR OUTPUT). Remember that the text you output should fit in between the text in the angle brackets and the dollar signs. If the user mentions anything about earlier or later parts of the text, consider these mentions of position from the point between the two sections of text.
            IF THE USER MENTIONS THE MOST 'recent' OR 'latest' PARTS OF THE TEXT, ONLY CONSIDER THE TEXT DELIMITED BY THE TRIPLE ANGLE BRACKETS.
            If the user uses keywords like recent or latest, they are specifically talking about the text in the angle brackets, so you should disregard the text in the dollar signs if this is the case. An example is included within the triple asterisks.
            ***
            Text in the angle brackets:
            Paragraph 1
            Paragraph 2
            Text in the dollar signs:
            Paragraph 3
            Paragraph 4
            User input:
            Summarize the most recent paragraph
            Output:
            Summary of paragraph 2.
            ***
            If the user does not specify or if there is no text (no letters) in the triple angle brackets or triple dollar signs, make the output fit as seamlessly as possible in between the text delimited by the angle brackets and the text delimited by the dollar signs.
            Examples of user messages that would require considering the wider context in the triple angle brackets and the triple dollar signs are included within the triple tildes:
            ~~~
            Insert a paragraph in this spot.
            Write a concluding paragraph.
            Insert a paragraph to come before the next paragraph.
            ~~~
            If a user asks you to translate something but doesn't specify what to translate to, DO NOT TRANSLATE THIS SYSTEM MESSAGE.
            ONLY OUTPUT WHAT THE USER REQUESTS. Do not add any extra information and ensure that the output does not have any quotation marks at the beginning or end of the output! If you have quotation marks included, the output will be ruined!
            And never introduce your output with something like 'sure here you go' or anything similar! AND DO NOT MENTION ANYTHING ABOUT THE ANGLE BRACKETS OR DOLLARS SIGNS AT ALL! IF YOU DO MENTION ANYTHING ABOUT ANGLE BRACKETS OR DOLLAR SIGNS!
            Any formatting that you need to do should be done using html tags (i.e. bolding, italicizing, tables, etc.). If the user requests a list, use <ul> tags.
            DO NOT USE ANY <br> TAGS WHEN MAKING TABLES.
            `},
            {
              role: "system", content: "Be sure to not include anything from the previous system message in your output! DO NOT OUTPUT ANY ANGLE BRACKETS, DOLLAR SIGNS, OR HASHTAGS! DO NOT OUTPUT ANY BR TAGS OR &nbsp;, <br>, </br> AFTER APPLYING THE USER REQUEST!"
            },
             { role: "user", content: promptText}]
          }

          // Set up an SSE Receiver, to prepare to get the stream.
          setLlmStreaming(true);
          await fetchEventSource(`http://127.0.0.1:8080/chatGPT/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: contextText,
            }),
            openWhenHidden: true, // Keep the stream going even if the document gets hidden for a second.
            onmessage(message) {
              console.log(`Received a snippet from chatGPT: ${message.data}`);
              // console.log(tinymce.activeEditor.getContent());
              // console.log(tinymce.activeEditor.dom.get('llmresult'));
              if (promptText.includes("table") || promptText.includes("list")) {
                setLlmResult((prev) => {
                  const gptState = prev + message.data;
                  console.log(`ChatGPT state: ${gptState}`);
                  return gptState;
                });
              }
              else {
                tinymce.activeEditor.dom.setHTML(
                  tinymce.activeEditor.dom.get('llmresult'),
                  tinymce.activeEditor.dom.get('llmresult').innerHTML + message.data
                );
              }
            },
            onclose() {
              // Finishes updating the document with the generated content. Also does other teardown code to end the streaming process.
              console.log("Closed the EventSource!");
              setLlmStreaming(false);
              const nodeArray = editorRef.current.editor.dom.select(".answer");
              editorRef.current.editor.dom.removeClass(nodeArray, "answer");
              editorRef.current.editor.dom.removeAllAttribs("llmresult");
              editorRef.current.editor.dom.removeClass(
                nodeArray,
                "inline-prompt"
              );

              // This looks dumb but seems critical to the editor internal state updating correctly.
              editorRef.current.editor.setContent(
                editorRef.current.editor.getContent()
              );

              setLlmPrompt(promptText);
              SetInline(true);
              setLlmStopButtonVisible(false);
              console.log(
                `ChatGPT state when message was closed: ${llmResult}`
              ); // this doesn't work.
              console.log("Closed the message connection!");
              console.log(inline);
            },
          });
        }
      } catch (error) {
        console.error("Something went wrong!", error);
      }
    }
  }

  const handleLlmButtonAdjust = () => {
    console.log("llm adjust button clicked");
    let node = editorRef.current.editor.selection.getNode();
    // if (node.nodeName === 'IMG') {
    //   let classes = editorRef.current.editor.dom.getParent(node,'img').classList
    //   let nodeId = ''
    //   for(let i=0;i<classes.length;i++){
    //     if(classes[i].includes('id')){
    //        nodeId = classes[i]
    //     }}
    //   let index = Number(nodeId.slice(2))
    //   if(nodeId !== ''){
    //   editorRef.current.editor.dom.remove(
    //     editorRef.current.editor.dom.select(`.${nodeId}`)
    //   );
    //     editorRef.current.editor.selection.setContent(
    //     "@ai:" + llmPrompts[index]
    //   );}
    // }else{
    if (
      editorRef.current.editor.dom.getParent(node, ".llmparagraph") !== null
    ) {
      let classes = editorRef.current.editor.dom.getParent(
        node,
        ".llmparagraph"
      ).classList;
      //editorRef.current.editor.dom.getParent(node, '.llmparagraph').classList.remove('llmparagraph')
      let nodeId = "";
      for (let i = 0; i < classes.length; i++) {
        if (classes[i].includes("id")) {
          nodeId = classes[i];
        }
      }
      let index = Number(nodeId.slice(2));
      if (nodeId !== "") {
        editorRef.current.editor.dom.setHTML(
          editorRef.current.editor.dom.select(`.${nodeId}`),
          "@ai " + llmPromptsList[index]
        );
        editorRef.current.editor.dom.remove(
          editorRef.current.editor.dom.getParent(node, ".llmparagraph")
        );
        editorRef.current.editor.insertContent(node.innerHTML);
      }
    }
    setLlmPrompt("");
  };

  const handleLlmButtonInsert = () => {
    console.log("llm insert button clicked");
    let node = editorRef.current.editor.selection.getNode();
    console.log(node);
    console.log(editorRef.current.editor.dom.getParent(node, ".img"));
    // if (node.nodeName==='IMG') {
    //   editorRef.current.editor.dom.getParent(node,'img').classList.remove('shadow')
    // }else{
    if (
      editorRef.current.editor.dom.getParent(node, ".llmparagraph") !== null
    ) {
      //editorRef.current.editor.dom.getParent(node, '.llmparagraph').classList.remove('llmparagraph')
      editorRef.current.editor.dom.remove(
        editorRef.current.editor.dom.getParent(node, ".llmparagraph")
      );
      editorRef.current.editor.insertContent(node.innerHTML);
    }

    setLlmPrompt("");
  };

  const handleLlmButtonDiscard = () => {
    console.log("llm discard button clicked");
    let node = editorRef.current.editor.selection.getNode();
    console.log(node.nodeName);
    //   if (node.nodeName==='IMG') {
    //     editorRef.current.editor.dom.remove(
    //       editorRef.current.editor.dom.getParent(node,'img')
    //     );
    // }else{
    if (
      editorRef.current.editor.dom.getParent(node, ".llmparagraph") !== null
    ) {
      editorRef.current.editor.dom.remove(
        editorRef.current.editor.dom.getParent(node, ".llmparagraph")
      );
      editorRef.current.editor.insertContent("");
    }
    setLlmPrompt("");
  };

  // const handleLlmButtonStop = () => {
  //   console.log("llm stop generating button clicked");
  //   setLlmContinue(false);
  //   editorRef.current.editor.dom.removeAllAttribs("llmresult");
  //   setLlmStopButtonVisible(false);
  //   console.log("llmPrompt Inside Stop:");
  //   console.log(llmPrompt);
  // };

  return (
    <Container fluid className="p-0">
      <Row>
        <Col md={12} className="full-height">
          {currentDocument ? (
            <>
              <div className="llm-buttons">
                <ButtonGroup
                  size="sm"
                  style={{
                    visibility: llmStopButtonVisible ? "visible" : "hidden",
                    top: llmButtonsTop,
                    left: llmButtonsLeft,
                  }}
                >
                  {/* <Button
                    variant="light"
                    onClick={() => {
                      handleLlmButtonStop();
                    }}
                  >
                    Stop Generating
                  </Button> */}
                </ButtonGroup>
              </div>

              <TinyEditor
                ref={editorRef}
                disabled={llmStreaming && llmContinue}
                apiKey={import.meta.env.VITE_TINYMCE}
                initialValue={currentDocument.content}
                recipes={recipes}
                createVersion={createVersion}
                generateVersion={generateVersion}
                activeChunkid={activeChunkid}
                onClick={handleEditorClick}
                onMouseUp={handleEditorMouseUp}
                onSelectionChange={() => {
                  handleEditorOnSelectionChange();
                }}
                onEditorChange={(newValue, editor) => {
                  setValue(newValue);
                  handleEditorOnChange();
                }}
                onInit={(evt, editor) => {
                  setChunksVisbleInDocument(getVisibleChunkIds());
                  // return (editorRef.current = editor);
                }}
                init={{
                  newdocument_content: "", //change this to change new document content
                  inline_boundaries_selector:
                    "a[href],code,b,i,strong,em,span[id]",
                  resize: false,
                  content_css: "document",
                  toolbar_mode: "sliding",
                  menubar: "file edit insert view format table tools help",
                  menu: {
                    file: {
                      title: "File",
                      items:
                        "newABScribeDocument | preview | export print | deleteallconversations",
                    },
                    edit: {
                      title: "Edit",
                      items:
                        "undo redo | cut copy paste pastetext | selectall | searchreplace",
                    },
                    view: {
                      title: "View",
                      items:
                        "code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments",
                    },
                    insert: {
                      title: "Insert",
                      items:
                        "image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime",
                    },
                    format: {
                      title: "Format",
                      items:
                        "bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat",
                    },
                    tools: {
                      title: "Tools",
                      items:
                        "spellchecker spellcheckerlanguage | a11ycheck code wordcount",
                    },
                    table: {
                      title: "Table",
                      items:
                        "inserttable | cell row column | advtablesort | tableprops deletetable",
                    },
                    help: { title: "Help", items: "help" },
                  },
                  skin: "borderless",
                  height: "100%",
                  plugins: [
                    "code",
                    "link",
                    "image",
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  text_patterns: [
                    { start: "@ai", cmd: "reply", value: { color: "red" } },
                    //{start: '*', end:'*', format:'interject'},
                  ],
                  formats: {
                    factor: {
                      inline: "span",
                      classes: "chunk %factorId",
                      styles: {
                        backgroundColor: "%color",
                        // border: "1px solid #2276d2",
                        // "border-radius": "5px",
                        // padding: "2px 5px",
                        // margin: "0 2px",
                      },
                    },
                    //interject: { inline: 'span', classes: 'inline-prompt' },
                    ai: {
                      block: "p",
                      styles: {
                        backgroundColor: "%color",
                        border: "1px solid #2276d2",
                        "border-radius": "5px",
                        padding: "2px 5px",
                        margin: "0 2px",
                      },
                    },
                  },
                  // toolbar:
                  //   "code | undo redo | blocks | " +
                  //   "bold italic forecolor hilitecolor | alignleft aligncenter " +
                  //   "alignright alignjustify | bullist numlist outdent indent | " +
                  //   "removeformat | ideabucket",
                  toolbar:
                    "blocks fontfamily fontsize |ideabucket recipes @ai-Templates|" +
                    "bold italic forecolor hilitecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist | code ",

                  setup: (editor) => {
                    //adding custom icons
                    editor.on("ExecCommand", function (e) {
                      if ("mceNewDocument" == e.command) {
                        // e.preventDefault();
                        // createNewBlankDocument();
                      }
                    });
                    editor.ui.registry.addMenuItem("newABScribeDocument", {
                      text: "New Document",
                      icon: "document-properties",
                      onAction: function () {
                        createNewBlankDocument();
                      },
                    });
                    editor.ui.registry.addIcon(
                      "WandMagic",
                      '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M234.7 42.7L197 56.8c-3 1.1-5 4-5 7.2s2 6.1 5 7.2l37.7 14.1L248.8 123c1.1 3 4 5 7.2 5s6.1-2 7.2-5l14.1-37.7L315 71.2c3-1.1 5-4 5-7.2s-2-6.1-5-7.2L277.3 42.7 263.2 5c-1.1-3-4-5-7.2-5s-6.1 2-7.2 5L234.7 42.7zM46.1 395.4c-18.7 18.7-18.7 49.1 0 67.9l34.6 34.6c18.7 18.7 49.1 18.7 67.9 0L529.9 116.5c18.7-18.7 18.7-49.1 0-67.9L495.3 14.1c-18.7-18.7-49.1-18.7-67.9 0L46.1 395.4zM484.6 82.6l-105 105-23.3-23.3 105-105 23.3 23.3zM7.5 117.2C3 118.9 0 123.2 0 128s3 9.1 7.5 10.8L64 160l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L128 160l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L128 96 106.8 39.5C105.1 35 100.8 32 96 32s-9.1 3-10.8 7.5L64 96 7.5 117.2zm352 256c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L416 416l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L480 416l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L480 352l-21.2-56.5c-1.7-4.5-6-7.5-10.8-7.5s-9.1 3-10.8 7.5L416 352l-56.5 21.2z"/></svg>'
                    );
                    editor.ui.registry.addIcon(
                      "IdeaBucket",
                      '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2l0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4l0 0c19.8 27.1 39.7 54.4 49.2 86.2H272zM192 512c44.2 0 80-35.8 80-80V416H112v16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"/></svg>'
                    );
                    editor.ui.registry.addIcon(
                      "star",
                      '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>'
                    );
                    editor.ui.registry.addMenuButton("recipes", {
                      icon: "WandMagic",
                      text: "LLM Recipes",
                      tooltip: "LLM Recipes",
                      disabled: true,

                      fetch: function (callback) {
                        callback(
                          editorRef.current.props.recipes.map((recipe) => ({
                            type: "menuitem",
                            icon: "star",
                            text: recipe.name.toUpperCase(),

                            onAction: async function () {
                              if (editorRef.current.props.activeChunkid) {
                                editorRef.current.props.generateVersion(
                                  editorRef.current.props.activeChunkid,
                                  recipe.prompt
                                );
                              }
                            },
                          }))
                        );
                      },
                      onSetup: (buttonApi) => {
                        const editorEventCallback = (eventApi) => {
                          buttonApi.setEnabled(
                            eventApi.element.classList.contains("chunk") &&
                              editorRef.current.props.recipes.length > 0
                          );
                        };
                        editor.on("NodeChange", editorEventCallback);

                        /* onSetup should always return the unbind handlers */
                        return () =>
                          editor.off("NodeChange", editorEventCallback);
                      },
                    });

                    //                 const onAction = (autocompleteApi, rng, value) => {
                    //   editor.selection.setRng(rng);
                    //   editor.insertContent(value);
                    //   autocompleteApi.hide();
                    // };

                    // const getMatchedChars = (pattern) => {
                    //   let uniquePrompts = [...new Set(llmPromptsList)]
                    //   return uniquePrompts.filter(prompt => prompt.indexOf(pattern) !== -1);
                    // };

                    // //
                    // editor.ui.registry.addAutocompleter('prompts', {
                    //   trigger: '@ai:',
                    //   minChars: 1,
                    //   //columns: 1,
                    //   highlightOn: ['char_name'],
                    //   onAction: onAction,
                    //   fetch: (pattern) => {
                    //     return new Promise((resolve) => {
                    //       const results = getMatchedChars(pattern).map(char => ({
                    //         type: 'cardmenuitem',
                    //         value: '@ai:'+char,
                    //         //label: char,
                    //         items: [
                    //           {
                    //             type: 'cardcontainer',
                    //             direction: 'vertical',
                    //             items: [
                    //               {
                    //                 type: 'cardtext',
                    //                 text: char,
                    //                 name: 'char_name'
                    //               }
                    //             ]
                    //           }
                    //         ]
                    //       }));
                    //       resolve(results);
                    //     });
                    //   }
                    // });

                    editor.ui.registry.addContextToolbar("llmbuttons", {
                      predicate: (node) =>
                        editor.dom.hasClass(node, "llmparagraph"),
                      items:
                        "insertAITextButton adjustAITextButton deleteAITextButton",
                      position: "node",
                      scope: "node",
                    });
                    editor.addCommand("reply", async function () {
                      let promptNode = editor.selection.getNode();
                      let promptText = promptNode.textContent;
                      setLlmPrompt(promptText);
                      getLLMResult(promptText, promptNode);
                    }),
                      editor.ui.registry.addButton("save", {
                        text: "Save",
                        onAction: () => {
                          const newContent =
                            editorRef.current.editor.getContent();
                          updateDocument(currentDocument._id, newContent)
                            .then(() => {
                              editorRef.current.editor.notificationManager.open(
                                {
                                  text: "Document saved.",
                                  type: "success",
                                  timeout: 1000,
                                }
                              );
                            })
                            .catch((error) => {
                              console.error(
                                "Failed to save document in backend:",
                                error
                              );
                              editorRef.current.editor.notificationManager.open(
                                {
                                  text: "Failed to save document to backend.",
                                  type: "error",
                                  timeout: 1000,
                                }
                              );
                            });
                        },
                      });
                    editor.ui.registry.addButton("insertAITextButton", {
                      icon: "checkmark",
                      tooltip: "Insert AI Generated Text",
                      onAction: function (_) {
                        handleLlmButtonInsert();
                      },
                    });
                    editor.ui.registry.addButton("adjustAITextButton", {
                      icon: "edit-block",
                      tooltip: "Adjust AI Prompt",
                      onAction: function (_) {
                        handleLlmButtonAdjust();
                      },
                    });
                    editor.ui.registry.addButton("deleteAITextButton", {
                      icon: "remove",
                      tooltip: "Discard AI Generated Text",
                      onAction: function (_) {
                        handleLlmButtonDiscard();
                      },
                    });

                    // editor.ui.registry.addButton("gpt", {
                    //     text: "Interject Text",
                    //     onAction: () => {
                    //         let promptText = editor.selection.getContent()
                    //         editor.selection.setContent(`<span class='inline-prompt'>${promptText}</span>`)
                    //         let promptNode = editor.selection.getNode().querySelector('.inline-prompt')
                    //         getLLMResult(promptText,promptNode)
                    //     },
                    // });

                    editor.ui.registry.addToggleButton("ideabucket", {
                      icon: "IdeaBucket",
                      text: "Idea Bucket",
                      tooltip: "Idea Bucket",
                      onAction: () => {
                        setIdeaBucketVisible((prevState) => !prevState);
                      },
                    });
                    editor.ui.registry.addButton("viewer", {
                      text: "View",
                      onAction: () => {
                        navigate("/viewer", {
                          state: { document: currentDocument },
                        });
                      },
                    });

                    editor.ui.registry.addIcon(
                      "templates",
                      "<svg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 512 512'><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d='M288 448H64V224h64V160H64c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H288c35.3 0 64-28.7 64-64V384H288v64zm-64-96H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H224c-35.3 0-64 28.7-64 64V288c0 35.3 28.7 64 64 64z'/></svg>"
                    );
                    editor.ui.registry.addIcon(
                      "plus",
                      '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>'
                    );
                    editor.ui.registry.addIcon(
                      "paperclip",
                      '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/></svg>'
                    );
                    var items = [
                      {
                        type: "menuitem",
                        icon: "paperclip",
                        text: "Email",
                        onAction: (_) =>
                          editor.insertContent(
                            `<p>@ai Compose an email addressing the topic of <strong>[INSERT SPECIFIC TOPIC: e.g., Sustainable Travel Practices]</strong> tailored for <strong>[INTENDED RECIPIENT: e.g., Travel Enthusiasts, Corporate Clients]</strong>. Please adopt a <strong>[TONE OF VOICE AND LANGUAGE: e.g., friendly and informative, formal and professional]</strong> tone. Your email should effectively convey key information and engage the recipient.</p>`
                          ),
                      },
                      {
                        type: "menuitem",
                        icon: "paperclip",
                        text: "Travel Itinerary",
                        onAction: (_) =>
                          editor.insertContent(
                            `<p>@ai Develop a detailed travel itinerary for a <strong>[TYPE OF TRIP: e.g., week-long family vacation, romantic weekend getaway]</strong> to <strong>[DESTINATION: e.g., Paris, Bali]</strong> during the month of <strong>[MONTH OF VISIT: e.g., August]</strong>. Design the itinerary for <strong>[NUMBER OF DAYS: e.g., 5 days]</strong>, focusing on <strong>[TYPE OF ACTIVITIES: e.g., cultural exploration, outdoor adventures, relaxation]</strong>. Ensure that the itinerary includes a balanced mix of <strong>[SPECIFIC TYPES OF ACTIVITIES OR ATTRACTIONS: e.g., museums, hiking trails, local markets]</strong>.</p>`
                          ),
                      },
                      {
                        type: "menuitem",
                        icon: "paperclip",
                        text: "Meeting Agenda",
                        onAction: (_) =>
                          editor.insertContent(
                            `<p>@ai Create a comprehensive meeting agenda for a <strong>[TYPE OF MEETING: e.g., Project Kickoff, Monthly Review]</strong> scheduled on <strong>[DATE AND TIME: e.g., August 15th, 10:00 AM]</strong>. Develop an agenda that covers <strong>[MAIN TOPICS: e.g., progress updates, goal setting, team collaboration]</strong> and ensures active participation. Organize the agenda with clear time allocations for each item and include any <strong>[REQUIRED PREPARATION: e.g., data presentation, research summaries]</strong> necessary. Focus on maintaining a productive approach to facilitate a successful meeting.</p>`
                          ),
                      },
                    ];

                    editor.ui.registry.addMenuButton("@ai-Templates", {
                      icon: "templates",
                      text: "AI Templates",
                      fetch: function (callback) {
                        callback(
                          items.concat({
                            type: "menuitem",
                            icon: "plus",
                            text: "Create New Template",
                            onAction: (_) =>
                              editor.windowManager.open(dialogConfig),
                          })
                        );
                        var dialogConfig = {
                          title: "Create A New Template",
                          body: {
                            type: "panel",
                            items: [
                              {
                                type: "input",
                                name: "templateName",
                                label: "Enter the name of the new template:",
                              },
                              {
                                type: "input",
                                name: "templatePrompt",
                                label: "Enter the prompt:",
                              },
                            ],
                          },
                          buttons: [
                            {
                              type: "cancel",
                              name: "closeButton",
                              text: "Cancel",
                            },
                            {
                              type: "submit",
                              name: "submitButton",
                              text: "Create",
                              primary: true,
                            },
                          ],
                          initialData: {
                            templateName: "",
                            templatePrompt: "",
                          },
                          onSubmit: function (api) {
                            var data = api.getData();

                            items.push({
                              type: "menuitem",
                              icon: "paperclip",
                              text: data.templateName,
                              onAction: (_) =>
                                editor.insertContent(
                                  `<p>@ai ${data.templatePrompt}</p>`
                                ),
                            });
                            api.close();
                          },
                        };
                      },
                    });
                  },

                  content_style:
                    ".chunk {padding: 2px 0px; border: 1px solid #2276d2; border-radius: 5px;} #llmresult { color:#D7D7D7 } ",
                  //p.llmparagraph { border: 0px solid; background-color: #fafaf7; padding: 2px 5px; margin: 2px 2px; border-radius: 5px;}",
                }}
              />
            </>
          ) : (
            // Render a loading message or a spinner while waiting for currentDocument
            <div className="d-flex justify-content-center align-items-center full-height">
              <Spinner animation="border" role="status" />{" "}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
