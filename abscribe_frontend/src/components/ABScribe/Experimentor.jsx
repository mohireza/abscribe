import React from "react";
import {
  Tab,
  Col,
  Nav,
  Row,
  Button,
  Form,
  Container,
  Card,
} from "react-bootstrap";

export default function Experimentor() {
  const cards = [1, 2, 3, 4];
  return (
    <Container className="p-5">
      <Row>
        <Col md={12}>
          {cards.map(
            (item, index) =>
              ~(
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Experiment Name</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Document Name
                    </Card.Subtitle>
                    <Card.Text>Experiment description.</Card.Text>
                    <Card.Link href="#">Export</Card.Link>
                    <Card.Link href="#">Email</Card.Link>
                    <Card.Link href="#">Embed</Card.Link>
                    <Card.Link href="#">
                      View Factors, Chunks, Versions, Combination
                    </Card.Link>
                  </Card.Body>
                </Card>
              )
          )}
        </Col>
      </Row>
    </Container>
  );
}
