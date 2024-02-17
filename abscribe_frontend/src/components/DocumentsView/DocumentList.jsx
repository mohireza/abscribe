import React, { useState, useEffect } from "react";
import { Badge, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Sugar from "sugar";

import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../../services/documentService";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Dropdown from "react-bootstrap/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faTrashAlt,
  faPencil,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import NavHeader from "../Header/NavHeader";
import "../../scss/documentlist.scss";

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [deleteModalShow, setDeleteModalShow] = React.useState(false);
  const [deleteModalName, setDeleteModalName] = React.useState("");
  const [deleteModalId, setDeleteModalId] = React.useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getFormattedTimestamp = (timestamp) => {
    var date = new Date(timestamp + "Z"); //appending Z so considered valid ISO 8601
    return Sugar.Date(date).relative();

    // return date.toLocaleString([], {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });
  };

  const fetchDocuments = async () => {
    const fetchedDocuments = await getDocuments();
    console.log(`We got this from the documents route: ${fetchedDocuments}`)
    setDocuments(fetchedDocuments);
  };

  const handleDocumentClick = (document) => {
    console.log("Document clicked: ", document);
    navigate(`/document/${document._id}`);
    // navigate("/document", { state: { document: document } });
  };

  const handleNewDocumentClick = () => {
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

  const handleDeleteDocumentClick = (documentId, documentName) => {
    setDeleteModalShow(true);
    setDeleteModalName(documentName);
    setDeleteModalId(documentId);
  };

  const handleViewDocumentClick = (document) => {
    console.log("Document viewer clicked: ", document);
    navigate("/viewer", { state: { document: document } });
  };

  function DeleteConfirmationModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Delete "{deleteModalName}"?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This will delete the document permanently. You can't undo this
            action.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide} variant="light">
            Cancel
          </Button>
          <Button
            onClick={() => {
              deleteDocument(deleteModalId)
                .then(() => {
                  console.log("Document deleted in backend");
                  fetchDocuments();
                })
                .catch((error) =>
                  console.error("Failed to delete document in backend:", error)
                )
                .finally(() => {
                  setDeleteModalShow(false);
                });
            }}
            variant="danger"
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <div>
      <NavHeader />
      <Container className="p-3">
        <Row>
          <Col md={12}>
            <ListGroup>
              <ListGroup.Item
                className="d-flex justify-content-right"
                key={document._id}
                style={{
                  cursor: "pointer",
                }}
              >
                <Button
                  variant="light"
                  onClick={() => handleNewDocumentClick()}
                >
                  <FontAwesomeIcon size="xs" icon={faPlus} /> Create Blank
                  Document
                </Button>
              </ListGroup.Item>
              {documents.map((document) => (
                <ListGroup.Item
                  className="d-flex justify-content-between"
                  key={document._id}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <Button
                    variant="link"
                    onClick={() => handleDocumentClick(document)}
                    className="text-truncate"
                  >
                    {document.name}
                  </Button>
                  <div className="d-flex align-items-center">
                    <small className="m-1 p-2 text-muted">
                      {`Created: ${getFormattedTimestamp(document.timestamp)}`}
                    </small>
                    <Button
                      variant="light"
                      onClick={() => {
                        handleDeleteDocumentClick(document._id, document.name);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </Button>
                  </div>

                  {/* <Dropdown align="end">
                    <Dropdown.Toggle variant="light">
                      <FontAwesomeIcon size="xs" icon={faEllipsisVertical} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item disabled>
                        <FontAwesomeIcon size="xs" icon={faPencil} /> Rename
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          handleDeleteDocumentClick(document._id);
                        }}
                      >
                        <FontAwesomeIcon size="xs" icon={faTrashAlt} /> Remove
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown> */}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
        <DeleteConfirmationModal
          show={deleteModalShow}
          onHide={() => setDeleteModalShow(false)}
        />
      </Container>
    </div>
  );
};

export default DocumentList;
