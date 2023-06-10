import { Navbar, NavItem, NavDropdown, MenuItem, Nav } from "react-bootstrap";

import "../stylesheets/ForumNavbar.css";

const ForumNavbarBottom = () => {
  return (
    <Navbar className="navbar-bottom" bg="dark" variant="dark">
      <Navbar.Brand></Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="d-flex w-100">
          <Nav.Link id="news">News</Nav.Link>
          <Nav.Link id="matches">Matches</Nav.Link>
          <Nav.Link id="results">Results</Nav.Link>
          <Nav.Link id="events">Events</Nav.Link>
          <Nav.Link id="Stats">Stats</Nav.Link>
          <Nav.Link id="Forum">Forum</Nav.Link>

        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default ForumNavbarBottom;
