import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./stylesheets/Signup.css";

const Signup = ({ showMessage }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(
        `https://node.me2vegan.com/api/users/check-email/${email}`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const checkNameExists = async (email) => {
    try {
      const response = await axios.get(
        `https://node.me2vegan.com/api/users/check-name/${name}`
      );
      return response.data.exists;
    } catch (error) {
      console.error("Error checking name:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { name, email, password };

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        showMessage("此信箱已註冊，請前往登入！", "error");
        return;
      }

      const nameExists = await checkNameExists(name);
      if (nameExists) {
        showMessage("此名字已被使用，請使用其他名字！", "error");
        return;
      }

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
        // console.log("User created successfully:", response.data);
        showMessage("註冊成功！", "success");
        setTimeout(() => {
          navigate("/personal");
        }, 500);
      } else {
        console.error("Error creating user:", response.data);
        showMessage("信箱已註冊，請前往登入！", "error");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showMessage("伺服器異常，請稍後再試！", "error");
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
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-name"
            placeholder="Name"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-password"
            placeholder="Password"
            required
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
