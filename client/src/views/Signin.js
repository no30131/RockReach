import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./stylesheets/Signin.css";

const Signin = ({ showMessage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { email, password };

    try {
      const response = await axios.post(
        `https://node.me2vegan.com/api/users/login`,
        userData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // console.log("User logged in successfully:", response.data);
        showMessage("登入成功！", "success");
        setTimeout(() => {
          navigate("/personal");
        }, 500);
      } else {
        console.error("Error logging in:", response.data);
        showMessage("密碼不正確，請重新輸入！", "error");
      }
    } catch (error) {
      // console.error("Error logging in:", error);
      if (error.response) {
        if (error.response.status === 401) {
          showMessage("密碼不正確，請重新輸入！", "error");
        } else if (error.response.status === 404) {
          showMessage("此信箱未註冊！", "error");
        } else {
          showMessage("伺服器異常，請稍後再試！", "error");
        }
      } else {
        showMessage("伺服器異常，請稍後再試！", "error");
      }
    }
  };

  return (
    <div className="box">
      <h1>會員登入</h1>
      <p>請輸入您的資訊以登入</p>
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-password"
            placeholder="Password"
            required
            name="password"
            autoComplete="current-password"
          />
        </div>
        <p>
          或點此 {" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
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
            註冊
          </button>
        </p>
        <div className="signin-link">
          <button className="signin-submit">送出</button>
        </div>
      </form>
    </div>
  );
};

export default Signin;
