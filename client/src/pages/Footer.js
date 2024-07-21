import React from "react";
import { Link } from "react-router-dom";
import "./stylesheets/Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footer-rights">
        <p>© 2024 RockReach. All rights reserved.</p>
      </div>
      <div className="footer-links">
        <Link to="/service" className="button">服務條款</Link>
        <Link to="/policy" className="button">隱私權政策</Link>
      </div>
    </footer>
  );
};

export default Footer;
