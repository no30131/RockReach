import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './stylesheets/Header.css';
import { useAuth } from '../utils/AuthContext';
import { getUserFromToken } from "../utils/token";
import { FaAlignJustify } from "react-icons/fa";

const Header = () => {
  const { user, logout } = useAuth();
  const [userId, setUserId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 599);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try{
      const userData = getUserFromToken();
      setUserId(userData.userId);
    } catch (error) {
      console.log(error);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 599);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUserId(null);
    navigate("/signin");
  };

  const toggleMenuContainer = () => {
    if (isMenuOpen) {
      document
        .querySelector(".menu-container-box")
        .classList.remove("expanded");
      document
        .querySelector(".menu-container-box")
        .classList.add("collapsed");
      setTimeout(() => {
        setIsMenuOpen(false);
      }, 500);
    } else {
      setIsMenuOpen(true);
      setTimeout(() => {
        document
          .querySelector(".menu-container-box")
          .classList.add("expanded");
        document
          .querySelector(".menu-container-box")
          .classList.remove("collapsed");
      }, 10);
    }
  };

  return (
    <header className="header">
      {!isMobile &&(
        <nav className="header-menu">
          <div className="menu-links">
            <Link to="/">
              <img src="/images/logo5.png" alt="Logo" className="logo" />
            </Link>
            <Link to="/personal" className={`button ${location.pathname === "/personal" ? "active" : ""}`}>個人空間</Link>
            <Link to="/upload" className={`button ${location.pathname === "/upload" ? "active" : ""}`}>新增紀錄</Link>
            <Link to="/explore" className={`button ${location.pathname === "/explore" ? "active" : ""}`}>動態牆</Link>
            <Link to="/friends" className={`button ${location.pathname === "/friends" ? "active" : ""}`}>好友</Link>
            <Link to="/custom" className={`button ${location.pathname === "/custom" ? "active" : ""}`}>自訂路線</Link>
            <Link to="/achievements" className={`button ${location.pathname === "/achievements" ? "active" : ""}`}>成就</Link>
            <Link to="/footprint" className={`button ${location.pathname === "/footprint" ? "active" : ""}`}>足跡地圖</Link>
          </div>
          <div className="menu-login">
            {!user && !userId ? (
              <Link to="/signin" className="button login-button">登入</Link>
            ) : (
              <button onClick={handleLogout} className="button logout-button">登出</button>
            )}
          </div>
        </nav>
      )}

      {isMobile &&(
        <nav className="header-menu">
          <div className="m-menu-links">
            <Link to="/">
              <img src="/images/logo5.png" alt="Logo" className="logo" />
            </Link>
          </div>
          <div>
            <button className="menu-button" onClick={toggleMenuContainer}>
              <FaAlignJustify />
            </button>
            <div
              className={`menu-container-box ${
                isMenuOpen ? "expanded" : "collapsed"
              }`}
            >
              {isMenuOpen && (
                <nav>
                  <div className="m-menu-links">
                    <Link to="/personal" className={`m-button ${location.pathname === "/personal" ? "active" : ""}`} onClick={toggleMenuContainer}>個人空間</Link>
                    <Link to="/upload" className={`m-button ${location.pathname === "/upload" ? "active" : ""}`} onClick={toggleMenuContainer}>新增紀錄</Link>
                    <Link to="/explore" className={`m-button ${location.pathname === "/explore" ? "active" : ""}`} onClick={toggleMenuContainer}>動態牆</Link>
                    <Link to="/friends" className={`m-button ${location.pathname === "/friends" ? "active" : ""}`} onClick={toggleMenuContainer}>好友</Link>
                    <Link to="/custom" className={`m-button ${location.pathname === "/custom" ? "active" : ""}`} onClick={toggleMenuContainer}>自訂路線</Link>
                    <Link to="/achievements" className={`m-button ${location.pathname === "/achievements" ? "active" : ""}`} onClick={toggleMenuContainer}>成就</Link>
                    <Link to="/footprint" className={`m-button ${location.pathname === "/footprint" ? "active" : ""}`} onClick={toggleMenuContainer}>足跡地圖</Link>
                    {!user && !userId ? (
                      <Link to="/signin" className="m-login-button" onClick={toggleMenuContainer}>登入</Link>
                    ) : (
                      <button onClick={handleLogout} className="button logout-button">登出</button>
                    )}
                  </div>
                </nav>
              )}
            </div>
          </div>          
        </nav>
      )}
    </header>
  );
};

export default Header;



