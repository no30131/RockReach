import React, { useState } from "react";
import axios from "axios";
import "./stylesheets/Signin.css";

const apiUrl = process.env.REACT_APP_API_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

const Gyms = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [showMessageError, setShowMessageError] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const gymData = { name, phone, address };

    try {
      const response = await axios.post(`${apiUrl}/api/gyms/create`, gymData, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        console.log("Gym added successfully:", response.data);
        setMessage("新增成功！");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
        }, 4000);
      } else {
        console.error("Error adding gym:", response.data);
        setMessage("此岩館已存在！");
        setShowMessageError(true);
        setTimeout(() => {
          setShowMessageError(false)
        }, 4000);
      }
    } catch (error) {
      console.error("Error adding gym:", error);        
      setMessage("伺服器異常，請稍後再試！");
      setShowMessageError(true);
      setTimeout(() => {
        setShowMessageError(false)
      }, 4000);
    }
  };
  
  return (
    <div className="box">
      <h1>新增岩館</h1>
      <p>請輸入要新增的岩館及其資訊</p>
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-name"
          placeholder="名稱"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-name"
          placeholder="電話"
          required
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="input-name"
          placeholder="地址"
          required
        />
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

export default Gyms;
