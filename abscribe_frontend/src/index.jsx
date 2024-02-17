import React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/Root";
import ErrorPage from "./ErrorPage";
import Editor from "./components/ABScribe/Editor";
import Viewer from "./components/ABScribe/Viewer";
import Home from "./components/Home/Home";
import Docs from "./components/Docs/docs";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "react-tooltip/dist/react-tooltip.css";
import "./index.css";

import reportWebVitals from "./reportWebVitals";
import DocumentList from "./components/DocumentsView/DocumentList";
import DocumentContainer from "./components/ABScribe/DocumentContainer";


const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/editor",
        element: <Editor />,
      },
      {
        path: "/document/:documentId",
        element: <DocumentContainer />,
      },
      {
        path: "/document/",
        element: <DocumentContainer />,
      },
      {
        path: "/viewer",
        element: <Viewer />,
      },
      {
        path: "/docs",
        element: <Docs />,
      },
      {
        path: "/documentlist",
        element: <DocumentList />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
