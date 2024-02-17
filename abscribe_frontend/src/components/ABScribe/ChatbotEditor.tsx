import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import TextareaAutosize from "react-textarea-autosize";

import { useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Form,
  InputGroup,
  Button,
  Card,
  Col,
} from "react-bootstrap";
import VanillaEditor from "./VanillaEditor";
import parse from "html-react-parser";

import useLLM, { OpenAIMessage } from "usellm";
import "../../scss/chat.scss";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export default function ChatbotEditor() {
  const [status, setStatus] = useState<Status>("idle");
  const [history, setHistory] = useState<OpenAIMessage[]>([
    {
      role: "assistant",
      content: "I'm a chatbot powered by the ChatGPT. Ask me anything!",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEnd = useRef(null);

  const llm = useLLM({
    serviceUrl: "https://usellm.org/api/llm", // For testing only. Follow this guide to create your own service URL: https://usellm.org/docs/api-reference/create-llm-service
  });

  async function handleSend() {
    if (!inputText) {
      return;
    }
    try {
      setStatus("streaming");
      const newHistory = [...history, { role: "user", content: inputText }];
      setHistory(newHistory);
      setInputText("");
      // const { message } = await llm.chat({
      //   messages: newHistory,
      //   stream: true,
      //   onStream: ({ message }) => setHistory([...newHistory, message]),
      // });
      let myOutput = "";
      await llm.chat({
        messages: newHistory,
        stream: true,
        onStream: ({ message }) => {
          myOutput += message.content;
          setHistory([...newHistory, { role: "user", content: myOutput }]);
        },
      });
      // await fetchEventSource(`http://127.0.0.1:8080/chatGPT/chat`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     messages: newHistory,
      //   }),
      //   openWhenHidden: true, // Keep the stream going even if the document gets hidden for a second.
      //   onmessage(message) {
      //     myOutput += message.data;
      //     setHistory([...newHistory, { role: "user", content: myOutput }]);
      //   },
      //   onclose() {
      //     setStatus("idle");
      //   },
      // });
    } catch (error: any) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    } finally {
      setStatus("idle");
    }
  }

  async function handleRecordClick() {
    try {
      if (status === "idle") {
        await llm.record();
        setStatus("recording");
      } else if (status === "recording") {
        setStatus("transcribing");
        const { audioUrl } = await llm.stopRecording();
        const { text } = await llm.transcribe({ audioUrl });
        setStatus("streaming");
        const newHistory = [...history, { role: "user", content: text }];
        setHistory(newHistory);
        const { message } = await llm.chat({
          messages: newHistory,
          stream: true,
          onStream: ({ message }) => setHistory([...newHistory, message]),
        });
        setHistory([...newHistory, message]);
        setStatus("idle");
      }
    } catch (error: any) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }

  const Mic = () => (
    // you can also use an icon library like `react-icons` here
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>
  );

  const Square = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
    </svg>
  );

  const Icon = status === "recording" ? Square : Mic;

  function capitalize(word: string) {
    return word.charAt(0).toUpperCase() + word.substring(1);
  }

  type Status = "idle" | "recording" | "transcribing" | "streaming";

  function getInputPlaceholder(status: Status) {
    switch (status) {
      case "idle":
        return "Ask me anything...";
      case "recording":
        return "Recording audio...";
      case "transcribing":
        return "Transcribing audio...";
      case "streaming":
        return "Wait for my response...";
    }
  }

  interface ChatMessagesProps {
    messages: OpenAIMessage[];
  }

  function ChatMessages({ messages }: ChatMessagesProps) {
    let messagesWindow = useRef<Element | null>(null);

    useEffect(() => {
      if (messagesWindow?.current) {
        messagesWindow.current.scrollTop = messagesWindow.current.scrollHeight;
      }
      scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
      messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <div
        className="w-full flex-1 overflow-y-auto px-4"
        ref={(el) => (messagesWindow.current = el)}
      >
        {messages.map((message, idx) => (
          <div className="my-4" key={idx}>
            <div className="font-semibold text-gray-800 dark:text-white">
              <strong>{capitalize(message.role)}</strong>
            </div>
            <div className="text-gray-600 dark:text-gray-200 whitespace-pre-wrap mt-1">
              {parse(message.content)}
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>
    );
  }

  interface ChatInputProps {
    placeholder: string;
    text: string;
    setText: (text: string) => void;
    sendMessage: () => void;
    disabled: boolean;
  }

  function ChatInput({
    placeholder,
    text,
    setText,
    sendMessage,
    disabled,
  }: ChatInputProps) {
    return (
      // <input
      //     className="p-2 border rounded w-full block dark:bg-gray-900 dark:text-white"
      //     id="prompt-input"
      //     type="text"
      //     placeholder={placeholder}
      //     value={text}
      //     disabled={disabled}
      //     onChange={(e) => setText(e.target.value)}
      //     onKeyDown={(event) => {
      //         if (event.key === "Enter" && !event.shiftKey) {
      //             event.preventDefault();
      //             sendMessage();
      //         }
      //     }}
      // />

      <TextareaAutosize
        maxRows={5}
        id="prompt-input"
        className="ml-1 p-2 rounded"
        placeholder={placeholder}
        style={{ resize: "none", width: "100%" }}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}
      />
    );
  }

  return (
    <>
      <Container fluid>
        <Row>
          <Col md={9} className="p-0">
            <VanillaEditor />
          </Col>
          <Col md={3} className={"p-0"}>
            <Card className="messages-card">
              <Card.Body className="messages-height">
                <ChatMessages messages={history} />
              </Card.Body>
              <Card.Footer>
                <div className="d-flex align-items-stretch">
                  <TextareaAutosize
                    maxRows={5}
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                    id="prompt-input"
                    style={{ resize: "none", width: "100%" }}
                    className="ml-1 p-2 rounded"
                    placeholder={getInputPlaceholder(status)}
                    value={inputText}
                    disabled={status !== "idle"}
                    onChange={(e) => {
                      setInputText(e.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    className="ms-1"
                    onClick={handleSend}
                  >
                    Send
                  </Button>
                </div>
                {/* <InputGroup className="p-1">
                  <Form.Control
                    aria-label="Recipient's username"
                    aria-describedby="basic-addon2"
                    id="prompt-input"
                    type="text"
                    placeholder={getInputPlaceholder(status)}
                    value={inputText}
                    disabled={status !== "idle"}
                    onChange={(e) => {
                      setInputText(e.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button variant="secondary" onClick={handleSend}>
                    Send
                  </Button>
                </InputGroup> */}
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
