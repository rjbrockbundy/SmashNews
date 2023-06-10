import "../stylesheets/App.css";
import "../stylesheets/ForumPostPage.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ForumNavbar from "../utils/ForumNavbar";
import { Row, Col, Container } from "react-bootstrap";
import ForumNavbarBottom from "../utils/ForumNavbarBottom";

const BASEURL = "http://localhost:8000";

function ForumPostPage() {
  const [post, setPost] = useState(null);
  const [forum_id, setForum_id] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showReply, setShowReply] = useState(null);
  const [openReplyCommentId, setOpenReplyCommentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const forum_id = searchParams.get("id");
 
    const get_forum_post_from_id = async () => {
      await axios
        .get(BASEURL + "/user/forum/" + forum_id + "/")
        .then((response) => {
          setPost(response.data);
          sessionStorage.setItem("user", response.data.username);
        });
    };

    get_forum_post_from_id().catch(console.error);
    setForum_id(searchParams.get("id"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    await axios
      .post(
        BASEURL + "/user/forum/" + forum_id + "/",
        {
          content: e.target.content.value,
          parent_comment_id: formData.get("parent_comment_id"),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        window.location.reload(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function replyButton(item) {
    const showReplyForm = openReplyCommentId === item.id;
    if (!showReplyForm) return;
    return (
      <form onSubmit={handleSubmit} key={item.id}>
        <div className="input-group ">
          <textarea
            id="content"
            name="content"
            required
            placeholder="Make a comment"
            className="comment-textbox"
          />
        </div>
        <input
          type="hidden"
          id="parent_comment_id"
          name="parent_comment_id"
          value={item.id}
        />
        <button type="submit" className="primary comment-submit-button ">
          Post Comment
        </button>
      </form>
    );
  }

  function populate_comments() {
    let commentArr = [];
    if (post === null) return;

    for (let x = 0; x < post.comments.length; x++) {
      commentArr.push(post.comments[x]);
    }
    for (let x = 0; commentArr.length; x++) {
      return (
        <Container fluid>
          <Row>
            <Col md={1} />
            <Col md={8}>
              {commentArr.map((item) => {
                let date = item.created_at.split("T")[0];
                let time = item.created_at.split("T")[1].split(":").slice(0, 2);
                time = time.join(":");
                if (item.parent_comment === 0) {
                  return (
                    <Row className="comment" key={item.id}>
                      <Row>
                        <Col md={1}>
                          <p
                            onClick={() =>
                              navigate("/profile?user=" + item.author)
                            }
                            className="comment-author"
                          >
                            {item.author}
                          </p>
                        </Col>
                        <Col md={10} />
                        <Col md={1}>
                          <p>#{item.id}</p>
                        </Col>
                        <Row>
                          <Col md={12}>
                            <span>
                              Created on: {date} at {time}{" "}
                            </span>
                            <p className="comment-content">{item.content}</p>
                          </Col>
                        </Row>
                      </Row>
                      <Row>
                        <button
                          className="reply-button"
                          onClick={() => {
                            setShowReply(!showReply);
                            setOpenReplyCommentId(item.id);
                          }}
                        >
                          Reply
                        </button>
                        {showReply && replyButton(item)}
                      </Row>
                    </Row>
                  );
                } else {
                  let parent;
                  for (let x = 0; x < commentArr.length; x++) {
                    if (commentArr[x].id === item.parent_comment) {
                      parent = commentArr[x];
                      break;
                    }
                  }
                  return (
                    <Row className="comment" key={item.id}>
                      <Row>
                        <Col md={11}>
                          <p
                            onClick={() =>
                              navigate("/profile?user=" + item.author)
                            }
                            className="comment-author"
                          >
                            {item.author}
                          </p>
                          <span>
                            Created on: {date} at {time}{" "}
                          </span>
                          <Row className="parent-comment">
                            <Col md={11}>
                              <p
                                onClick={() =>
                                  navigate("/profile?user=" + parent.author)
                                }
                                className="parent-author"
                              >
                                Replying to: {parent.author}
                              </p>
                              <p className="parent-comment">{parent.content}</p>
                            </Col>
                            <Col md={1}>#{parent.id}</Col>
                          </Row>
                          <p className="comment-content">{item.content}</p>
                        </Col>
                        <Col md={1}>
                          <p>#{item.id}</p>
                        </Col>
                      </Row>
                      <Row>
                        <button
                          className="reply-button"
                          onClick={() => {
                            setShowReply(!showReply);
                            setOpenReplyCommentId(item.id);
                          }}
                        >
                          Reply
                        </button>
                        {showReply && replyButton(item)}
                      </Row>
                    </Row>
                  );
                }
              })}
            </Col>
            <Col />
          </Row>
        </Container>
      );
    }
  }

  function populate_main_forum_post() {
    if (post === null) return;

    let date = post.created_at.split("T")[0];
    let time = post.created_at.split("T")[1].split(":").slice(0, 2);
    time = time.join(":");
    return (
      <Container fluid style={{ color: "white", textAlign: "center" }}>
        <Row>
          <Col md={1} />
          <Col md={10}>
            <h1>{post.title}</h1>
            <span>
              Created on: {date} at {time} by:
            </span>
            <span
              className="forum-author"
              onClick={() => navigate("/profile?user=" + post.author)}
            >
              {" "}
              {post.author}
            </span>

            <p className="forum-content">{post.content}</p>
          </Col>
          <Col md={1} />
        </Row>
        <hr className="content-comment-line" />
        <Row>
          <Col md={1} />
          <Col md={10}>
            <h3 className="comment-header">Comments:</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group ">
                <textarea
                  id="content"
                  name="content"
                  required
                  placeholder="Make a comment"
                  className="comment-textbox"
                />
              </div>
              <button type="submit" className="primary comment-submit-button ">
                Post Comment
              </button>
            </form>
          </Col>
          <Col md={1} />
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ height: "100vh", background: "black" }}>
      {ForumNavbar()}
      {ForumNavbarBottom()}
      {populate_main_forum_post()}
      {populate_comments()}
    </div>
  );
}

export default ForumPostPage;
