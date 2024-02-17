import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";

import { Editor as TinyEditor } from "@tinymce/tinymce-react";
import useLLM from "usellm";
import parse from "html-react-parser";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import PlaceHolder from "../../resources/placeHolderImg.png";
import { ButtonGroup } from "react-bootstrap";

export default function Editor() {
  //     {
  //   currentDocument,
  //   setCurrentDocument,
  //   documentContentUpdateTimer,
  //   setDocumentContentUpdateTimer,
  //   activeFactorId,
  //   setActiveFactorId,
  //   activeChunkid,
  //   setActiveChunkid,
  //   activeVersionIds,
  //   setActiveVersionIds,
  //   getFactorColor,
  //   getChunksFromFactorId,
  //   chunksVisibleInDocument,
  //   setChunksVisbleInDocument,
  //   abToolBarVisible,
  //   setAbToolBarVisible,
  //   updateChunk,
  //   updateAbToolBarLocation,
  //   abToolBarTop,
  //   abToolBarLeft,
  //   setAbToolBarTop,
  //   setAbToolBarLeft,
  //   ideaBucketVisible,
  //   setIdeaBucketVisible,
  //   createChunk,
  //   deleteChunk,
  //   createVersion,
  //   getChunkIndexFromId,
  //   editingMode,
  //   setEditingMode,
  //   getChunkFromId,
  //   updateActiveVersionIds,
  //   updateActiveVersionId,
  //   documentName,
  //   getVisibleChunkIds,
  //   llmPrompts,
  //   setLlmPrompts,
  //   recipePrompt,
  //   setRecipePrompt,
  //   recipeStreaming,
  //   setRecipeStreaming,
  //   recipeResult,
  //   setRecipeResult,
  //   recipes,
  //   setRecipes,
  //   activeRecipe,
  //   setActiveRecipe,
  //   generateVersion,
  // }
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

  //   const [value, setValue] = useState(currentDocument?.content ?? "");

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
  // const handleEditorClick = () => {
  //     const node = editorRef.current.editor.selection.getNode();
  //     const chunk = editorRef.current.editor.dom.getParent(node, "span.chunk");
  //     const chunkClass = editorRef.current.editor.dom.getAttrib(chunk, "class");
  //     const factorId = chunkClass.match(/factor_.....*/);
  //     let selection = editorRef.current.editor.selection;
  //     let range = selection.getRng(0);
  //     const length = Math.abs(range.endOffset - range.startOffset);
  //     console.log("Factor ID: " + factorId);
  //     if (factorId) {
  //         setActiveFactorId(factorId[0]);
  //         console.log(factorColors);
  //         console.log("Factor Id Updated to " + factorId);
  //     }
  //     if (chunk && length === 0) {
  //         const chunkid = editorRef.current.editor.dom.getAttrib(chunk, "id");
  //         console.log(`Chunk Found: ${chunkid}`);
  //         const chunkFromDocument = currentDocument.chunks.find(
  //             (chunk) => chunk.frontend_id === chunkid
  //         );
  //         if (chunkFromDocument) {
  //             console.log(`Chunk From Document Found: ${chunkid}`);
  //             console.log(currentDocument);
  //             setActiveChunkid(chunkid);
  //             if (!activeVersionIds[chunkid]) {
  //                 console.log("Active Version Ids Updated");
  //                 updateActiveVersionId(chunkid);
  //             }
  //             setEditingMode(true);
  //         }
  //     } else {
  //         setActiveChunkid("");
  //         if (length === 0) {
  //             setAbToolBarVisible(false);
  //         }
  //     }
  // };

  // const handleEditorMouseUp = () => {
  //     updateAbToolBarLocation();

  //     let selection = editorRef.current.editor.selection;
  //     let range = selection.getRng(0);
  //     const length = Math.abs(range.endOffset - range.startOffset);
  //     if (length > 0 || activeChunkid !== "") {
  //         setAbToolBarVisible(true);
  //     } else {
  //         setAbToolBarVisible(false);
  //     }
  // };

  // const handleEditorOnSelectionChange = () => {
  //     // handleEditorClick();
  //     // updateAbToolBarLocation();
  // };

  // const handleEditorOnChange = () => {
  //     console.log("handleEditorOnChange");
  //     if (editingMode) {
  //         const chunk = currentDocument.chunks.find(
  //             (chunk) => chunk.frontend_id === activeChunkid
  //         );
  //         const activeVersion = chunk.versions.find(
  //             (version) => version.frontend_id === activeVersionIds[activeChunkid]
  //         );

  //         const current_version =
  //             editorRef.current.editor.dom.get(activeChunkid).innerHTML;

  //         setCurrentDocument((prevDocument) => {
  //             const updatedChunks = prevDocument.chunks.map((chunk) => {
  //                 if (chunk.frontend_id === activeChunkid) {
  //                     const updatedVersions = chunk.versions.map((version) => {
  //                         if (version.frontend_id === activeVersion?.frontend_id) {
  //                             return {...version, text: current_version};
  //                         }
  //                         return version;
  //                     });

  //                     return {...chunk, versions: updatedVersions};
  //                 }
  //                 return chunk;
  //             });

  //             return {
  //                 ...prevDocument,
  //                 chunks: updatedChunks,
  //             };
  //         });
  //     }

  //     console.log("Editor Current Document Looks Like:");
  //     console.log(currentDocument._id);
  //     const newContent = editorRef.current.editor.getContent();

  //     clearTimeout(documentContentUpdateTimer);

  //     const newTimer = setTimeout(() => {
  //         updateDocument(currentDocument._id, newContent)
  //             .then(() => console.log("Document updated in backend in Editor"))
  //             .catch((error) =>
  //                 console.error("Failed to update document in backend:", error)
  //             );
  //     }, 500);

  //     setChunksVisbleInDocument(getVisibleChunkIds());
  //     console.log(chunksVisibleInDocument);

  //     setDocumentContentUpdateTimer(newTimer);
  // };

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
          // Set up an SSE Receiver, to prepare to get the stream.
          setLlmStreaming(true);
          await fetchEventSource(`https://abtestingtools-backend.up.railway.app/chatGPT/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: promptText }],
            }),
            openWhenHidden: true, // Keep the stream going even if the document gets hidden for a second.
            onmessage(message) {
              console.log(`Received a snippet from chatGPT: ${message.data}`);
              setLlmResult((prev) => {
                const gptState = prev + message.data;
                console.log(`ChatGPT state: ${gptState}`);
                return gptState;
              });
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
              initialValue={""}
              // recipes={recipes}
              // createVersion={createVersion}
              // generateVersion={generateVersion}
              // activeChunkid={activeChunkid}
              //onClick={handleEditorClick}
              //onMouseUp={handleEditorMouseUp}
              //onSelectionChange={() => {
                //handleEditorOnSelectionChange();
              //}}
              //onEditorChange={(newValue, editor) => {
                //setValue(newValue);
                //handleEditorOnChange();
              //}}
              //onInit={(evt, editor) => {
              //setChunksVisbleInDocument(getVisibleChunkIds());
              // return (editorRef.current = editor);
              //}}
              init={{
                inline_boundaries_selector:
                  "a[href],code,b,i,strong,em,span[id]",
                resize: false,
                content_css: "document",
                toolbar_mode: "sliding",
                menubar: true,
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
                  {start: "@ai", cmd: "reply", value: {color: "red"}},
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
                  // editor.ui.registry.addButton("save", {
                  //     text: "Save",
                  //     onAction: () => {
                  //         const newContent =
                  //             editorRef.current.editor.getContent();
                  //         updateDocument(currentDocument._id, newContent)
                  //             .then(() => {
                  //                 editorRef.current.editor.notificationManager.open(
                  //                     {
                  //                         text: "Document saved.",
                  //                         type: "success",
                  //                         timeout: 1000,
                  //                     }
                  //                 );
                  //             })
                  //             .catch((error) => {
                  //                 console.error(
                  //                     "Failed to save document in backend:",
                  //                     error
                  //                 );
                  //                 editorRef.current.editor.notificationManager.open(
                  //                     {
                  //                         text: "Failed to save document to backend.",
                  //                         type: "error",
                  //                         timeout: 1000,
                  //                     }
                  //                 );
                  //             });
                  //     },
                  // });
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
                          `<p>@ai Compose an email addressing the topic of <strong>[INSERT SPECIFIC TOPIC: e.g., Sustainable Travel Practices]</strong> tailored for <strong>[INTENDED RECIPIENT: e.g., Travel Enthusiasts, Corporate Clients]</strong>. Please adopt a <strong>[TONE OF VOICE AND LANGUAGE: e.g., friendly and informative, formal and professional]</strong> tone. Your email should effectively convey key information and engage the recipient. </p>`
                        ),
                    },
                    {
                      type: "menuitem",
                      icon: "paperclip",
                      text: "Travel Itinerary",
                      onAction: (_) =>
                        editor.insertContent(
                          `<p>@ai Develop a detailed travel itinerary for a <strong>[TYPE OF TRIP: e.g., week-long family vacation, romantic weekend getaway]</strong> to <strong>[DESTINATION: e.g., Paris, Bali]</strong> during the month of <strong>[MONTH OF VISIT: e.g., August]</strong>. Design the itinerary for <strong>[NUMBER OF DAYS: e.g., 5 days]</strong>, focusing on <strong>[TYPE OF ACTIVITIES: e.g., cultural exploration, outdoor adventures, relaxation]</strong>. Ensure that the itinerary includes a balanced mix of <strong>[SPECIFIC TYPES OF ACTIVITIES OR ATTRACTIONS: e.g., museums, hiking trails, local markets]</strong>. </p>`
                        ),
                    },
                    {
                      type: "menuitem",
                      icon: "paperclip",
                      text: "Meeting Agenda",
                      onAction: (_) =>
                        editor.insertContent(
                          `<p>@ai Create a comprehensive meeting agenda for a <strong>[TYPE OF MEETING: e.g., Project Kickoff, Monthly Review]</strong> scheduled on <strong>[DATE AND TIME: e.g., August 15th, 10:00 AM]</strong>. Develop an agenda that covers <strong>[MAIN TOPICS: e.g., progress updates, goal setting, team collaboration]</strong> and ensures active participation. Organize the agenda with clear time allocations for each item and include any <strong>[REQUIRED PREPARATION: e.g., data presentation, research summaries]</strong> necessary. Focus on maintaining a productive approach to facilitate a successful meeting. </p>`
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
        </Col>
      </Row>
    </Container>
  );
}
