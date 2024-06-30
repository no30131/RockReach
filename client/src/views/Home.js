import React from "react";
import { Link } from "react-router-dom";
import "./stylesheets/Home.css";

const Home = () => {
    return (
        <div>
            <div className="home-main">
                <div className="home-title">
                    <h1>RockReach 岩途</h1>
                    <h2>記錄你的攀岩旅途</h2>
                    <p>專為攀岩玩家設計，詳細記錄您的攀岩狀況與成就，讓您定期追蹤自己的進步。<br></br><br></br>與其他岩友一同分享樂趣、互相勉勵，攜手向大神之路邁進！</p>
                </div>
                <img src="/images/home-main.png" alt="keep the memory" className="home-main-image"/>
            </div>
            <Link to="/signup" className="home-signup-link">
                <button className="home-signup-button">立即體驗</button>
            </Link>
        </div>
    );
};

export default Home;