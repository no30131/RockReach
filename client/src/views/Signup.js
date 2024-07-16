import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./stylesheets/Signup.css";
import { useAuth } from "../utils/AuthContext";

const Signup = ({ showMessage }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(
        `https://node.me2vegan.com/api/users/check-email/${email}`
      );
      if (response.data.exists) {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        throw new Error(error.response.data.message);
      }
      console.error("Error checking email:", error);
      throw error;
    }
  };
  
  const checkNameExists = async (name) => {
    try {
      const response = await axios.get(
        `https://node.me2vegan.com/api/users/check-name/${name}`
      );
      if (response.data.exists) {
        throw new Error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        throw new Error(error.response.data.message);
      }
      console.error("Error checking name:", error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (name.length > 15) {
      showMessage("名字不能超過15個字元！", "error");
      return;
    }
  
    const userData = { name, email, password };
  
    try {
      await checkEmailExists(email);
      await checkNameExists(name);
  
      const response = await axios.post(
        `https://node.me2vegan.com/api/users/create`,
        userData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 201) {
        showMessage("註冊成功！", "success");
        login(response.data);
        setTimeout(() => {
          navigate("/personal");
        }, 500);
      } else {
        console.error("Error creating user:", response.data);
        showMessage("伺服器異常，請稍後再試！", "error");
      }
    } catch (error) {
      if (error.message) {
        showMessage(error.message, "error");
      } else {
        showMessage("伺服器異常，請稍後再試！", "error");
      }
    }
  };
  
  return (
    <div className="box">
      <h1>會員註冊</h1>
      <p>請輸入您的資訊以完成註冊</p>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="signup-form-area">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-email"
            placeholder="Email"
            required
            name="email"
            autoComplete="email"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-name"
            placeholder="Name"
            maxLength={15}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-password"
            placeholder="Password"
            required
            name="password"
            autoComplete="new-password"
          />
        </div>
        <p>
          或點此{" "}
          <button
            type="button"
            onClick={() => navigate("/signin")}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
            }}
          >
            登入
          </button>
        </p>
        <div className="signup-link">
          <button type="submit" className="signup-submit">
            送出
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
