import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import YoutubeEmbed from "./YoutubeEmbed";
import "../../scss/home.scss";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import {
  faDemocrat,
  faFilePdf,
  faFilePen,
  faHandSparkles,
  faMagic,
  faPeace,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

import eustressEmail from "../../resources/eustressEmail";

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import {
  faChrome,
  faGithub,
  faSafari,
} from "@fortawesome/free-brands-svg-icons";
import Button from "react-bootstrap/Button";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../../services/documentService";

import abscribegif from "../../resources/abscribe.gif";
import nsflogo from "../../resources/nsf.png";
import dgplogo from "../../resources/dgp.png";
import iailogo from "../../resources/iai.png";
import NavHeader from "../Header/NavHeader";
// import screenshotGif from "../resources/screenshot.gif";
// import dfpImg from "../resources/dfp.png";
// import selectiveRevealGif from "../resources/selective_reveal.gif";
// import pauseGif from "../resources/pause.gif";
// import stepsGif from "../resources/steps.gif";
// import markersGif from "../resources/markers.gif";

import aiButtonsGif from "../../resources/ai_buttons_new.gif";
import aiInsertGif from "../../resources/abscribe_ai_insert_new.gif";
import hoverButtonsGif from "../../resources/hover_buttons_new.gif";
import variationComponentGif from "../../resources/variations_new.gif";

// import "../scss/home.scss";

export default function Home() {
  const navigate = useNavigate();
  const [demo, setDemo] = useState("video");
  const [gif, setGif] = useState({
    "ai-insert": aiInsertGif,
    "ai-buttons": aiButtonsGif,
    "hover-buttons": hoverButtonsGif,
    "variation-component": variationComponentGif,
  });

  const handleTryABSCribeButtonClick = () => {
    createDocument("")
      .then((document) => {
        console.log("Document created in backend");
        // navigate("/document", { state: { document: document } });
        navigate(`/document/${document._id["$oid"]}`);
      })
      .catch((error) =>
        console.error("Failed to create document in backend:", error)
      );
  };

  return (
    <>
      <NavHeader />
      <div class="jumbotron m-3">
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <h1 className="display-4">AI Rewriting Simplified</h1>
              <p className="lead mt-4">
                Craft, organize, and explore diverse phrasings effortlessly with{" "}
                <strong>ABScribe</strong>, in a clutter-free editing interface
                powered by Large Language Models.
              </p>
              <Button
                className="mt-2"
                onClick={handleTryABSCribeButtonClick}
                variant="outline-dark"
                size="lg"
              >
                Try ABScribe
              </Button>{" "}
              <Link
                className="btn btn-outline btn-outline-dark btn-lg mt-2"
                to="https://arxiv.org/abs/2310.00117"
                role="button"
                target="newtab"
              >
                Read the Paper
              </Link>{" "}
              <div className="my-1">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faInfoCircle} /> Requires a recent
                  version of <strong>Chrome</strong>{" "}
                  <FontAwesomeIcon icon={faChrome} /> or <strong>Safari</strong>{" "}
                  <FontAwesomeIcon icon={faSafari} /> <br /> running on a
                  desktop or laptop computer.
                </small>
              </div>
            </div>
            <div className="col-md-7 d-flex flex-column justify-content-center ">
              {demo == "video" ? (
                <YoutubeEmbed embedId="Bpg4EVIKeEs" />
              ) : (
                <img
                  src={gif[demo]}
                  className="card-img-top"
                  alt="GIF Feature Animation"
                />
              )}
            </div>
          </div>

          <div className="row row-cols-1 row-cols-md-4 mt-4">
            <div className="col mb-4">
              <div
                className="feature-card card h-100"
                onMouseOver={() => {
                  setDemo("ai-insert");
                }}
                onMouseLeave={() => {
                  setDemo("video");
                }}
              >
                <div className="card-body">
                  <h5 className="card-title">
                    Generate text with <strong>AI Insert</strong>
                  </h5>
                  <p className="card-text">
                    ABScribe makes it easy to stream text from GPT-4 directly
                    into the document. Simply type @ai followed by a prompt and
                    press enter.
                  </p>
                </div>
              </div>
            </div>
            <div className="col mb-4">
              <div
                className="feature-card card h-100"
                onMouseOver={() => {
                  setDemo("variation-component");
                }}
                onMouseLeave={() => {
                  setDemo("video");
                }}
              >
                <div className="card-body">
                  <h5 className="card-title">
                    Organize variations inside{" "}
                    <strong>Variation Components</strong>
                  </h5>
                  <p className="card-text">
                    ABScribe lets you organize and edit multiple writing
                    variations inside persistent text segments. Simply select
                    and click on "Create Variation".
                  </p>
                </div>
              </div>
            </div>
            <div className="col mb-4">
              <div
                className="feature-card card h-100"
                onMouseOver={() => {
                  setDemo("hover-buttons");
                }}
                onMouseLeave={() => {
                  setDemo("video");
                }}
              >
                <div className="card-body">
                  <h5 className="card-title">
                    Compare variations with <strong>Hover Buttons</strong>
                  </h5>
                  <p className="card-text">
                    Swiftly preview text variations in context of the
                    surrounding content by moving your mouse over dynamically
                    placed buttons above the text.
                  </p>
                </div>
              </div>
            </div>
            <div className="col mb-4">
              <div
                className="feature-card card h-100"
                onMouseOver={() => {
                  setDemo("ai-buttons");
                }}
                onMouseLeave={() => {
                  setDemo("video");
                }}
              >
                <div className="card-body">
                  <h5 className="card-title">
                    Generate variations with <strong>AI Buttons</strong>
                  </h5>
                  <p className="card-text">
                    Create variations by typing instructions to the AI that are
                    auto-converted into reusable buttons that can be applied to
                    other parts.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">BibTex</h5>
              <p className="card-text">
                <pre>
                  <code>
                    {`
@inproceedings{reza2023abscribe,
  title={ABScribe: Rapid Exploration of Multiple Writing Variations in Human-AI Co-Writing Tasks using Large Language Models}, 
  author={Mohi Reza and Nathan Laundry and Ilya Musabirov and Peter Dushniku and Zhi Yuan "Michael" Yu and Kashish Mittal and Tovi Grossman and Michael Liut and Anastasia Kuzminykh and Joseph Jay Williams},
  year={2023},
  eprint={2310.00117},
  archivePrefix={arXiv},
  primaryClass={cs.HC}
}
  `}
                  </code>
                </pre>
              </p>
            </div>
            <div>
              {/* <div className="app-screenshot my-4">
              <img
                src={abscribegif}
                className="img-fluid"
                alt="ABScribe screenshot"
              />
            </div> */}
            </div>
          </div>
          <hr />
          <p className="lead py-4 mt-2 text-center">
            Please reach out to{" "}
            <a href="mailto:mohireza@cs.toronto.edu">mohireza@cs.toronto.edu</a>{" "}
            for all bugs, feature requests and questions.
          </p>
          <div className="text-center">
            <h5 className="text-center">Organizations and Sponsors</h5>
            <img src={iailogo} height="45px" alt="IAI Lab Logo" />{" "}
            <img src={nsflogo} height="70px" alt="NSF Logo" />
          </div>

          <p className="text-muted text-center mt-4">
            Copyright © 2023 Mohi Reza
          </p>
        </div>
      </div>
    </>
  );
}
