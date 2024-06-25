import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./stylesheets/Signup.css";

const apiUrl = process.env.REACT_APP_API_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showMessageError, setShowMessageError] = useState(false);
  const navigate = useNavigate();

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(`${apiUrl}/api/users/check-email/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { name, email, password };

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setMessage("此信箱已註冊，請前往登入！");
        setShowMessageError(true);
        setTimeout(() => {
          setShowMessageError(false);
        }, 4000);
        return;
      }

      const response = await axios.post(`${apiUrl}/api/users/create`, userData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status === 201) {
        console.log("User created successfully:", response.data);
        setMessage("註冊成功！");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate("/personal");
        }, 800);
      } else {
        console.error("Error creating user:", response.data);
        setMessage("信箱已註冊，請前往登入！");
        setShowMessageError(true);
        setTimeout(() => {
          setShowMessageError(false)
        }, 4000);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setMessage("伺服器異常，請稍後再試！");
      setShowMessageError(true);
      setTimeout(() => {
        setShowMessageError(false)
      }, 4000);
    }
  };
  
  return (
    <div className="box">
      <h1>會員註冊</h1>
      <p>請輸入您的資訊以完成註冊</p>
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
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-name"
            placeholder="使用者名稱"
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
      <p>或點此<a href="/signin">登入</a></p>
      <div className="signup-link">
        <button type="submit" className="signup-submit">送出</button>
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

export default Signup;
