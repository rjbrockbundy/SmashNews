import "../stylesheets/App.css";
import "../stylesheets/NewsPostPage.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ForumNavbar from "../utils/ForumNavbar";
import { Row, Col, Container } from "react-bootstrap";
import ForumNavbarBottom from "../utils/ForumNavbarBottom";

const BASEURL = "http://localhost:8000";

function NewsPostPage() {
  const [post, setPost] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const news_id = searchParams.get("id");

    const get_news_posts_from_id = async () => {
      await axios
        .get(BASEURL + "/user/news/" + news_id + "/")
        .then((response) => {
          setPost(response.data);
          sessionStorage.setItem("user", response.data.username);
        });
    };

    get_news_posts_from_id().catch(console.error);
  }, []);

  function populate_main_news_post() {
    if (post === null) return;

    let date = post.created_at.split("T")[0];
    let time = post.created_at.split("T")[1].split(":").slice(0, 2);
    time = time.join(":");
    return (
      <Row>
        <h1>{post.title}</h1>
        <Col md={12}>
          <img src={BASEURL + post.image} className="news-image" />
        </Col>
        <span>
          Created on: {date} at {time}{" "}
        </span>
        <span>by: {post.author}</span>

        <p>{post.content}</p>
      </Row>
    );
  }

  return (
    <div style={{ height: "100vh", background: "black" }}>
      {ForumNavbar()}
      {ForumNavbarBottom()}
      <Container className="App news-post">
        {populate_main_news_post()}
      </Container>
    </div>
  );
}

export default NewsPostPage;
