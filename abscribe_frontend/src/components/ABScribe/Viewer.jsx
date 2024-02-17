import React, { useRef, useState, useEffect } from "react";
import parse from "html-react-parser";
import Form from "react-bootstrap/Form";

import { useLocation, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import "../../scss/viewer.scss";
import Button from "react-bootstrap/Button";
import { ButtonGroup } from "react-bootstrap";

export default function Viewer({ currentDocument, visibleChunks }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      setCurrentDocument(location.state.document);
      console.log(location.state.document);
    }
  }, [location.state]);

  const handleEditClick = (document) => {
    navigate("/editor", { state: { document: document } });
  };

  const getCombinations = () => {
    console.log("Begin");
    const chunk_ids = [];
    const version_ids = [];
    for (let chunk of currentDocument.chunks) {
      if (visibleChunks.includes(chunk.frontend_id)) {
        chunk_ids.push(frontend_id);
        version_;
        for (let version of chunk.versions) {
          console.log(`${chunk.frontend_id} - ${version.frontend_id}`);
        }
      }
    }
    console.log("End");
  };
  return (
    <Container fluid>
      <Row>
        <Col md={12}>
          {currentDocument ? (
            <Card className="viewer-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Viewer</span>
                <div>
                  {currentDocument.chunks.map((chunk, chunk_key) => {
                    if (visibleChunks.includes(chunk.frontend_id)) {
                      return (
                        <Form key={chunk_key}>
                          {chunk.versions.map((version, version_key) => {
                            return (
                              <>
                                <Form.Check
                                  inline // prettier-ignore
                                  type={"radio"}
                                  id={version_key}
                                  key={version_key}
                                  name={`group-${chunk_key}`}
                                  onClick={() => {
                                    getCombinations();
                                  }}
                                />
                              </>
                            );
                          })}
                        </Form>
                      );
                    } else {
                      return "";
                    }
                  })}
                </div>
                <ButtonGroup>
                  <Button size="sm" variant="outline-secondary">
                    Export
                  </Button>
                </ButtonGroup>
              </Card.Header>
              <Card.Body className="viewer-body">
                {parse(currentDocument.content)}
              </Card.Body>
            </Card>
          ) : (
            <div className="d-flex justify-content-center align-items-center full-height">
              <Spinner animation="border" role="status" />{" "}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
