import React from "react";
import "./MessageBox.css";

const MessageBox = ({ type, message }) => {
    if(!message) return null;

    const icon = type === 'error' ? '/images/error.png' : '/images/ok.png';

    return (
        <div className={`message-box ${type === 'error' ? 'message-error-box' : ''}`}>
          <img src={icon} alt={type} className="message-icon" />
          <span>{message}</span>
        </div>
      );
};

export default MessageBox;