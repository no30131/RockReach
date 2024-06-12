import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./stylesheets/Header.css";

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <nav className="header-menu">
        <div className="menu-links">
            <Link to="/">
                <img src="../logo2.png" alt="Logo 由 https://www.designevo.com/tw/ 免費的線上標誌製做器 DesignEvo 製作的標誌" className="logo"/>
            </Link>
            <Link to="/personal" className={`button ${location.pathname === "/personal" ? "active" : ""}`}>個人空間</Link>
            <Link to="/upload" className={`button ${location.pathname === "/upload" ? "active" : ""}`}>新增紀錄</Link>
            <Link to="/explore" className={`button ${location.pathname === "/explore" ? "active" : ""}`}>動態牆</Link>
            <Link to="/friends" className={`button ${location.pathname === "/friends" ? "active" : ""}`}>好友</Link>
            <Link to="/achievements" className={`button ${location.pathname === "/achievements" ? "active" : ""}`}>成就</Link>
            <Link to="/footprint" className={`button ${location.pathname === "/footprint" ? "active" : ""}`}>足跡地圖</Link>
            <Link to="/custom" className={`button ${location.pathname === "/custom" ? "active" : ""}`}>自訂路線</Link>
        </div>
        <div className="menu-login">
          <Link to="/signin" className="button login-button">登入</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
