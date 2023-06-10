import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../stylesheets/LandingPage.css";
import "../stylesheets/App.css";
import ForumNavbar from "../utils/ForumNavbar";
import { Container, Col, Row } from "react-bootstrap";
import ForumNavbarBottom from "../utils/ForumNavbarBottom";

const BASEURL = "http://localhost:8000";

function SignupPage() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileInputChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await axios
      .post(
        BASEURL + "/user/profile/",
        {
          username: event.target.username.value,
          password: event.target.password.value,
          email: event.target.email.value,
          first_name: event.target.first_name.value,
          last_name: event.target.last_name.value,
          profile_picture: file,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        sessionStorage.setItem("username", response.data.username);
        document.cookie = "sessionid=" + response.data.session_id;
        document.cookie = "csrftoken=" + response.data.csrf_token;
        navigate("/landing");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  function SignupForm() {
    return (
      <div className="App">
        <header className="App-header">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="name">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="name">First Name:</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="First Name"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="name">Last Name:</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Last Name"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
              />
            </div>
            <div className="input-group">
              <label>Profile Picture:</label>
              <input
                type="file"
                id="profile_picture"
                name="profile_picture"
                onChange={handleFileInputChange}
                required
              />
            </div>
            <button type="submit" className="primary">
              Signup
            </button>
          </form>
        </header>
      </div>
    );
  }
  return (
    <div style={{ height: "100vh", background: "black" }}>{SignupForm()}</div>
  );
}

export default SignupPage;
