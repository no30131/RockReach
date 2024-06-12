import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./stylesheets/Signup.css";

const Signup = () => {
  return (
    <div className="box">
      <h1>會員註冊</h1>
      <p>請輸入您的資訊以完成註冊</p>
      <div className="signup-form">
        <input
          type="email"
          name="email"
          className="input-email"
          placeholder="Email"
        />
        <input
          type="text"
          name="name"
          className="input-name"
          placeholder="使用者名稱"
        />
        <input
          type="password"
          name="password"
          className="input-password"
          placeholder="密碼"
        />
      </div>
      <p>或點此<a href="/signin">登入</a></p>
      <Link to="/personal" className="signup-link">
          <button className="signup-submit">送出</button>
      </Link>
    </div>
  );
};

export default Signup;
