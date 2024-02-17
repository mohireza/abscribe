import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import NavHeader from "../Header/NavHeader";
import "../../scss/docs.scss";

export default function docs() {
  return (
    <>
      <NavHeader />
      <Container className="p-3">
        <Row>
          <Col md={12} className="full-height h_iframe">
            <iframe
              width="500"
              height="500"
              title="Documentation"
              src="https://docs.google.com/document/d/e/2PACX-1vQVjLOz-4gUXz-Bh_ABrBZtNgZAbkuh_1CJvEepZp7MlIlP8u_IVJ0hfjyIsi1k4Itw_KnxPnccEH-d/pub?embedded=true"
            ></iframe>
          </Col>
        </Row>
      </Container>
    </>
  );
}
