import React, { useState } from "react";
import "./stylesheets/Signin.css";

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
      const response = await fetch("http://localhost:7000/api/gyms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(gymData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Gym added successfully:", data);
        setMessage("新增成功！");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
        }, 4000);
      } else {
        console.error("Error add gym:", data);
        setMessage("此岩館已存在！");
        setShowMessageError(true);
        setTimeout(() => {
          setShowMessageError(false)
        }, 4000);
      }
    } catch (error) {
      console.error("Error add gym:", error);        
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
          type="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-name"
          placeholder="名稱"
          required
        />
        <input
          type="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-name"
          placeholder="電話"
          required
        />
        <input
          type="address"
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
