import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './stylesheets/Header.css';
import { useAuth } from '../utils/AuthContext';
import { getUserFromToken } from "../utils/token";

const Header = () => {
  const { user, logout } = useAuth();
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try{
      const userData = getUserFromToken();
      setUserId(userData.userId);
      console.log(userData.userId);
    } catch (error) {
      console.log(error);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUserId(null);
    navigate("/signin");
  };

  return (
    <header className="header">
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
    </header>
  );
};

export default Header;
