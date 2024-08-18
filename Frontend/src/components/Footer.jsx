import '../css/Footer.css'

import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa'; // Font Awesome icons
import { IoMdMail } from 'react-icons/io'; // Ionicons

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        
        <div className="footer-links">
          <a href="/hero">Booking</a>
          <a href="/main">About</a>
          <a href="https://georgedev.se" target="_blank" rel="GeorgeDev">George</a>
        </div>
        <div className="footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={24} />
          </a>
        
          <a href="mailto:info@georgedev.se">
            <IoMdMail size={24} />
          </a>
          <p>&copy; {new Date().getFullYear()} Stockholm Taxi och Åkeri. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
