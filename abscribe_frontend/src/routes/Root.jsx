import React from "react";
import { Outlet } from "react-router-dom";

import { LinkContainer } from "react-router-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePen } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/esm/Button";

export default function Navigation() {
  return (
    <>
      <div>
        <Outlet />
      </div>
    </>
  );
}
