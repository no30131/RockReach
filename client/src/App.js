import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext.js";
import Header from "./views/Header.js";
import Footer from "./views/Footer.js";
import Home from "./views/Home.js";
import Signin from "./views/Signin.js";
import Signup from "./views/Signup.js";
import Upload from "./views/Upload.js";
// import Gyms from "./views/Gyms.js";
import Custom from "./views/Custom.js";
import Friends from "./views/Friends.js";
import Footprint from "./views/Footprint.js";
import Personal from "./views/Personal.js";
import Achievements from "./views/Achievements.js";
import AchievementDetails from "./views/AchievementDetails.js";
import Explore from "./views/Explore.js";
import Service from "./views/Service.js";
import Policy from "./views/Policy.js";
import MessageBox from "./components/MessageBox.js";
import "./App.css";
import ScrollToTop from "./utils/ScrollToTop.js";
// import 'antd/dist/antd.css';

function App() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div>
          <Header />
          <main className="container">
            <MessageBox type={type} message={message} />
            <Routes>
              <Route path="/" element={<Home showMessage={showMessage} />} />
              <Route path="/signup" element={<Signup showMessage={showMessage}/>} />
              <Route path="/signin" element={<Signin showMessage={showMessage} />} />
              {/* <Route path="/gyms" element={<Gyms showMessage={showMessage} />} /> */}
              <Route path="/upload" element={<Upload showMessage={showMessage} />} />
              <Route path="/custom" element={<Custom showMessage={showMessage} />} />
              <Route path="/custom/:id" element={<Custom showMessage={showMessage} />} />
              <Route path="/friends" element={<Friends showMessage={showMessage} />} />
              <Route path="/footprint" element={<Footprint showMessage={showMessage} />} />
              <Route path="/footprint/:id" element={<Footprint showMessage={showMessage} />} />
              <Route path="/explore" element={<Explore showMessage={showMessage} />} />
              <Route path="/explore/:id" element={<Explore showMessage={showMessage} />} />
              <Route path="/personal" element={<Personal showMessage={showMessage} />} />
              {/* <Route path="/personal/:id" element={<Personal showMessage={showMessage} />} /> */}
              <Route path="/achievements" element={<Achievements showMessage={showMessage} />} />
              <Route path="/achievement/:userId/:wallName" element={<AchievementDetails showMessage={showMessage} />} />
              <Route path="/service" element={<Service showMessage={showMessage} />} />
              <Route path="/policy" element={<Policy showMessage={showMessage} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

const NotFound = () => {
  return (
    <div className="notfound">
      <h1>404 - 找不到頁面</h1>
      <p>您輸入的網址不存在！</p>
      <img src="/images/gpt.jpg" alt="wall" />
    </div>
  );
};

export default App;
