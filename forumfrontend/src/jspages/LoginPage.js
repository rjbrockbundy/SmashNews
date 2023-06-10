import logo from "../logo.svg";
import "../stylesheets/App.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
/*
change the div wrapper to this when ready to submit information to backend


*/

const BASEURL = "http://localhost:8000";

function App() {
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();

    await axios
      .post(BASEURL + "/user/login/", {
        username: e.target.username.value,
        password: e.target.password.value,
      })
      .then((response) => {
        setPost(response.data);
        sessionStorage.setItem("user", response.data.username);
        document.cookie = "sessionid=" + response.data.session_id;
        document.cookie = "csrftoken=" + response.data.csrf_token;
        navigate("/landing");
      })
      .catch((error) => {
        setPost(error.response);
      });
  }
  //console.log(post);
  function invalid_login() {
    let error = post;
    if (error != null) {
      if (error.status === 400)
        return <div style={{ color: "red" }}>{post.data.non_field_errors}</div>;
    }
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo noselect" alt="logo" />
        {invalid_login()}
        <form className="" onSubmit={login}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="username"
              name="username"
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" required />
          </div>
          <button className="primary">LOGIN</button>
          <button className="secondary" onClick={() => navigate("/signup")}>
            SIGN UP
          </button>
        </form>
      </header>
    </div>
  );
}

export default App;
