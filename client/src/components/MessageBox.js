import React from "react";
import "./MessageBox.css";

const MessageBox = ({ type, message }) => {
    if(!message) return null;

    return (
        <div className={`message-box ${type === 'error' ? 'message-error-box' : ''}`}>
          {message}
        </div>
      );
};

export default MessageBox;