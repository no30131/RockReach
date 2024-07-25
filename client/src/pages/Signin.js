import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./stylesheets/Signin.css";
import { useAuth } from "../utils/AuthContext";

const demoAccounts = [
  { email: "tim@rock.com", password: "tim" },
  { email: "amy@rock.com", password: "amy" },
  { email: "kevin@rock.com", password: "kevin" },
];

const getRandomDemoAccount = () => {
  const randomIndex = Math.floor(Math.random() * demoAccounts.length);
  return demoAccounts[randomIndex];
};

const Signin = ({ showMessage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "true") {
      const demoAccount = getRandomDemoAccount();
      setEmail(demoAccount.email);
      setPassword(demoAccount.password);
      const handleSubmit = async () => {
        const userData = {
          email: demoAccount.email,
          password: demoAccount.password,
        };
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
            showMessage("登入成功！", "success");
            login(response.data);
            setTimeout(() => {
              navigate("/personal");
            }, 500);
          } else {
            console.error("Error logging in:", response.data);
            showMessage("密碼不正確，請重新輸入！", "error");
          }
        } catch (error) {
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
      setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  }, [location.search, navigate, showMessage, login]);

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
        showMessage("登入成功！", "success");
        login(response.data);
        setTimeout(() => {
          navigate("/personal");
        }, 500);
      } else {
        console.error("Error logging in:", response.data);
        showMessage("密碼不正確，請重新輸入！", "error");
      }
    } catch (error) {
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
          或點此{" "}
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
        <p className="demo-button">
          或點此{" "}
          <button
            type="button"
            onClick={() => {
              const demoAccount = getRandomDemoAccount();
              setEmail(demoAccount.email);
              setPassword(demoAccount.password);
              setTimeout(() => {
                handleSubmit(new Event("submit"));
              }, 100);
            }}
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
            登入示範帳號
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
