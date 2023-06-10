import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Col, Row } from "react-bootstrap";
import "../stylesheets/App.css";
import "../stylesheets/ProfilePage.css";
import ForumNavbar from "../utils/ForumNavbar";
import ForumNavbarBottom from "../utils/ForumNavbarBottom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

const BASEURL = "http://localhost:8000";

function ProfilePage() {
  const [info, setInfo] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    let user_url = searchParams.get("user");
    if (user_url === null) {
      user_url = sessionStorage.getItem("user");
    }

    const get_profile_information = async () => {
      await axios
        .get(BASEURL + "/user/profile/" + user_url + "/")
        .then((response) => {
          setInfo(response.data);
          sessionStorage.setItem("user", response.data.username);
        });
    };

    get_profile_information().catch(console.error);
  }, []);

  function populate_profile_picture() {
    if (info === null) return;
    if (info.profile_picture != null) {
      return (
        <div className="profile-picture">
          <img
            src={BASEURL + info.profile_picture}
            className="profile-background"
          />
        </div>
      );
    }
    return (
      <div className="profile-picture">
        <span className="profile-background">
          {" "}
          <FontAwesomeIcon
            icon={solid("user")}
            size="lg"
            className="profile-icon"
          />
        </span>
      </div>
    );
  }

  function populate_profile_information() {
    if (info === null) return;

    return (
      <Row>
        <Row>{info.username}</Row>
        <Row>{info.first_name}</Row>
        <Row>{info.last_name}</Row>
      </Row>
    );
  }

  async function log_out() {
    const user_id = sessionStorage.getItem("user");
    await axios
      .post(BASEURL + "/user/logout/", { username: user_id })
      .then((response) => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function log_out_button() {
    let user_url = searchParams.get("user");
    if (user_url != sessionStorage.getItem("user")) {
      return;
    }
    return (
      <Row>
        <Col md={3}>
          <button onClick={log_out}>Log Out</button>
        </Col>
        <Col md={9} />
      </Row>
    );
  }

  async function edit_profile_information() {}

  return (
    <div style={{ height: "100vh", background: "black" }}>
      {ForumNavbar()}
      {ForumNavbarBottom()}
      <Container
        style={{ height: "83.6%", width: "80%", background: "#22272c" }}
        fluid
      >
        <Row className="App">
          <Col md={4}>{populate_profile_picture()}</Col>
          <Col md={8}>{populate_profile_information()}</Col>
        </Row>
        {log_out_button()}
      </Container>
    </div>
  );
}

export default ProfilePage;
