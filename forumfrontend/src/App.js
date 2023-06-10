import { BrowserRouter, NavLink, Routes, Route } from "react-router-dom";
import LoginPage from "./jspages/LoginPage.js";
import axios from "axios";
import LandingPage from "./jspages/LandingPage.js";
import ForumPostPage from "./jspages/ForumPostPage.js";
import NewsPostPage from "./jspages/NewsPostPage.js";
import CreateForumThreadPage from "./jspages/CreateForumThreadPage.js";
import SignupPage from "./jspages/SignupPage.js";
import ProfilePage from "./jspages/ProfilePage.js";

axios.defaults.baseURL = "http://127.0.0.1:8000";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile/*" element={<ProfilePage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/forum" element={<ForumPostPage />} />
        <Route path="/news" element={<NewsPostPage />} />
        <Route
          path="/forum/create-thread"
          element={<CreateForumThreadPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
