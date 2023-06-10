import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Col, Row } from "react-bootstrap";
import "../stylesheets/LandingPage.css";
import "../stylesheets/App.css";
import ForumNavbar from "../utils/ForumNavbar";
import ForumNavbarBottom from "../utils/ForumNavbarBottom";

const BASEURL = "http://localhost:8000";

function LandingPage() {
  const [post, setPost] = useState(null);
  const [news, setNews] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {

    const get_forum_posts = async () => {
      await axios.get(BASEURL + "/user/forum/").then((response) => {
        setPost(response.data);
      });
    };
    const get_news_posts = async () => {
      await axios.get(BASEURL + "/user/news/").then((response) => {
        setNews(response.data);
        sessionStorage.setItem("user", response.data.username);
      });
    };
    get_news_posts().catch(console.error);
    get_forum_posts().catch(console.error);
  }, []);

  function populate_forum_page() {
    let postArr = [];
    if (post === null || post === 0) {
      return;
    } else {
      for (let x = 0; x < post.posts.length; x++) {
        postArr.push(post.posts[x]);
      }
      for (let x = 0; postArr.length; x++) {
        return (
          <div>
            {postArr.map((item) => {
              let date = item.created_at.split("T")[0];
              let time = item.created_at.split("T")[1].split(":").slice(0, 2);
              time = time.join(":");
              return (
                <Row
                  className="forum-div"
                  key={item.id}
                  onClick={() => {
                    navigate("/forum?id=" + item.id);
                  }}
                  onMouseOver={() => {
                    return <p>{item.title}</p>;
                  }}
                >
                  <span>{item.title}</span>
                </Row>
              );
            })}
          </div>
        );
      }
    }
  }

  function populate_news_page() {
    let postArr = [];
    if (news === null || news === 0) return;
    for (let x = 0; x < news.posts.length; x++) {
      postArr.push(news.posts[x]);
    }
    for (let x = 0; x < postArr.length; x++) {
      return (
        <div>
          {postArr.map((item) => {
            let date = item.created_at.split("T")[0];
            let time = item.created_at.split("T")[1].split(":").slice(0, 2);
            time = time.join(":");
            return (
              <Row
                className="news-div"
                key={item.id}
                onClick={() => {
                  navigate("/news?id=" + item.id);
                }}
              >
                <Col md={1}>
                  <img src={BASEURL + item.image} className="news-img" />
                </Col>
                <Col md={11}>
                  <h1>{item.title}</h1>
                  <span>
                    Created on: {date} at {time} by: {item.author}
                  </span>
                </Col>
              </Row>
            );
          })}
        </div>
      );
    }
  }
  return (
    <div style={{ height: "100vh", background: "black" }}>
      {ForumNavbar()}
      {ForumNavbarBottom()}
      <Container
        style={{ height: "83.6%", width: "80%", background: "#22272c" }}
        fluid
      >
        <Row className="App">
          <Col md={9}>{populate_news_page()}</Col>
          <Col md={1} style={{ color: "white" }}>
            This is where live matches will go
          </Col>
          <Col md={2}>
            <span className="forum-col">Recent Activity</span>
            {populate_forum_page()}
            <Row
              onClick={() => navigate("/forum/create-thread")}
              className="forum-div forum-create-thread"
            >
              <span>Create new thread</span>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LandingPage;
