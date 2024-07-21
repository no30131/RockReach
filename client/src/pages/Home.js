import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserFromToken } from "../utils/token";
import "./stylesheets/Home.css";

const Home = () => {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setIsLogged(true);
    } else {
      setIsLogged(false);
    }
  }, []);

  return (
    <div>
      {/* <div className="home-main">
        <div className="home-title">
          <h1>RockReach | 岩途</h1>
          <h2>記錄你的攀岩旅途</h2>
          <p>
            專為攀岩玩家設計，詳細記錄您的攀岩狀況與成就，讓您定期追蹤自己的進步。
            <br></br>
            <br></br>與其他岩友一同分享樂趣、互相勉勵，攜手向大神之路邁進！
          </p>
        </div>
        <img
          src="/images/home-main.png"
          alt="keep the memory"
          className="home-main-image"
        />
      </div>
      <Link
        to={isLogged ? "/personal" : "/signup"}
        className="home-signup-link"
      >
        <button className="home-signup-button">立即體驗</button>
      </Link> */}
      <div className="landing-page">
        <img src="/images/home1.png" alt="home1" />
        <div className="home1-signup-area">
          <Link
            to={isLogged ? "/personal" : "/signup"}
          >
            <button className="home-signup-button">立即體驗</button>
          </Link>
        </div>
      </div>
      <div className="landing-page">
        <img src="/images/home2.png" alt="home2" />
      </div>
      <div className="landing-page">
        <img src="/images/home3.png" alt="home3" />
      </div>
      <div className="landing-page">
        <img src="/images/home4.png" alt="home4" />
        <div className="home1-signup-area">
          <Link
            to={isLogged ? "/personal" : "/signup"}
          >
            <button className="home-signup-button">立即體驗</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
