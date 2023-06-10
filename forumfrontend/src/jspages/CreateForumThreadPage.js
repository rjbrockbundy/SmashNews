import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../stylesheets/CreateForumThreadPage.css";
import "../stylesheets/App.css";
import ForumNavbar from "../utils/ForumNavbar";
import { Container, Col, Row } from "react-bootstrap";
import ForumNavbarBottom from "../utils/ForumNavbarBottom";

const BASEURL = "http://localhost:8000";

function CreateForumThreadPage() {
  const navigate = useNavigate();

  function CreateForum() {
    async function handleSubmit(e) {
      e.preventDefault();
   

      await axios
        .post(
          BASEURL + "/user/forum/",
          {
            title: e.target.title.value,
            content: e.target.content.value,
            author: sessionStorage.getItem("user"),
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          navigate("/forum?id=" + response.data.id);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    return (
      <div className="App">
        <header className="Forum-post-header">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="title">Title:</label>
              <input type="text" id="title" name="title" required />
            </div>
            <div className="input-group">
              <label htmlFor="content">Content:</label>
              <textarea id="content" name="content" required />
            </div>
            <button type="submit" className="primary">
              Submit
            </button>
          </form>
        </header>
      </div>
    );
  }
  return (
    <div style={{ height: "100vh", background: "black" }}>
      {ForumNavbar()}
      {ForumNavbarBottom()}
      {CreateForum()}
    </div>
  );
}

export default CreateForumThreadPage;
