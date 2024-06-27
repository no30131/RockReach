import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./stylesheets/Signin.css";

const apiUrl = process.env.REACT_APP_API_URL;

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showMessageError, setShowMessageError] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, password };

    try {
      const response = await axios.post(`${apiUrl}/api/users/login`, userData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        console.log("User logged in successfully:", response.data);
        setMessage("登入成功！");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate("/personal");
        }, 800);
      } else {
        console.error("Error logging in:", response.data);
        setMessage("密碼不正確，請重新輸入！");
        setShowMessageError(true);
        setTimeout(() => {
          setShowMessageError(false)
        }, 4000);
      }
    } catch (error) {
      console.error("Error logging in:", error);        
      if (error.response) {
        if (error.response.status === 401) {
          setMessage("密碼不正確，請重新輸入！");
        } else if (error.response.status === 404) {
          setMessage("此信箱未註冊！");
        } else {
          setMessage("伺服器異常，請稍後再試！");
        }
      } else {
        setMessage("伺服器異常，請稍後再試！");
      }
      setShowMessageError(true);
      setTimeout(() => {
        setShowMessageError(false)
      }, 4000);
    }
  };
  
  return (
    <div className="box">
      <h1>會員登入</h1>
      <p>請輸入您的資訊以登入</p>
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-email"
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-password"
          placeholder="密碼"
          required
        />
        <p>或點此<a href="/signup">註冊</a></p>
        <div className="signin-link">
            <button className="signin-submit">送出</button>
        </div>
      </form>
      {showMessage && (
        <div className="message-box">{message}</div>
      )}
      {showMessageError && (
        <div className="message-error-box">{message}</div>
      )}
    </div>
  );
};

export default Signin;
