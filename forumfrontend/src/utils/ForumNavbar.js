import { Navbar, NavItem, NavDropdown, MenuItem, Nav } from "react-bootstrap";
import logo from "../logo.svg";
import "../stylesheets/ForumNavbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const ForumNavbar = () => {
  const profile_link = "/profile?user=" + sessionStorage.getItem("user");
  return (
    <Navbar className="navbar" bg="dark" variant="dark">
      <Navbar.Brand href="/landing">
        <img alt="" src={logo} width="70" height="70" />
        <span className="navbar-text">Home</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="d-flex w-100">
          <Form className="d-flex justify-content-center navbar-profile navbar-search-box">
            <Form.Control
              type="search"
              placeholder="Search"
              className="bg navbar-search"
              aria-label="Search"
            />
            <Button variant="outline-success navbar-search-button">
              <FontAwesomeIcon icon={solid("magnifying-glass")} size="lg" />
            </Button>
          </Form>
          <Nav.Link
            title="Profile"
            id="profile-options"
            className="navbar-text ml-auto navbar-profile"
            href={profile_link}
          >
            <FontAwesomeIcon icon={solid("user")} size="lg" />
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default ForumNavbar;
