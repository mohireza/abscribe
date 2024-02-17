import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePen } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";

export default function NavHeader() {
  return (
    <Navbar bg="light" expand="sm" sticky="top">
      <Container>
        <Navbar.Brand href="/#/">
          <div className="d-flex align-items-center">
            <Button variant="light">
              <FontAwesomeIcon icon={faFilePen} /> ABScribe
            </Button>{" "}
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <LinkContainer to="/">
        <Nav.Link>Home</Nav.Link>
      </LinkContainer> */}
            {/* <LinkContainer to="/documentlist">
              <Nav.Link>Documents</Nav.Link>
            </LinkContainer> */}
            {/* <LinkContainer to="/docs">
        <Nav.Link>Help</Nav.Link>
      </LinkContainer> */}
          </Nav>
          <Nav>
            <LinkContainer to="/documentlist">
              <Nav.Link>Documents</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
