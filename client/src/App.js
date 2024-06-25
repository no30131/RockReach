import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./views/Header.js";
import Footer from "./views/Footer.js";
import Home from "./views/Home.js";
import Signin from "./views/Signin.js";
import Signup from "./views/Signup.js";
import Upload from "./views/Upload.js";
import Gyms from "./views/Gyms.js";
import Custom from "./views/Custom.js";
import Friends from "./views/Friends.js";
import Footprint from "./views/Footprint.js";
import Personal from "./views/Personal.js";
import Achievements from "./views/Achievements.js";
import AchievementDetails from "./views/AchievementDetails.js";
import Explore from "./views/Explore.js";
import Service from "./views/Service.js";
import Policy from "./views/Policy.js";
import "./App.css";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/gyms" element={<Gyms />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/custom" element={<Custom />} />
            <Route path="/custom/:id" element={<Custom />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/footprint" element={<Footprint />} />
            {/* <Route path="/footprint/:id" element={<Footprint />} /> */}
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:id" element={<Explore />} />
            <Route path="/personal" element={<Personal />} />
            {/* <Route path="/personal/:id" element={<Personal />} /> */}
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/achievement/:userId/:wallName" element={<AchievementDetails />} />
            <Route path="/service" element={<Service />} />
            <Route path="/policy" element={<Policy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
