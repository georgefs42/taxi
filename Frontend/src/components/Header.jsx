import { useState } from 'react';
import '../css/Header.css'; // Import the CSS file


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  return (
    <header className="header">
      <div className="logo">
        Stockholm <span className="highlight">TAXI</span> och Åkeri
      </div>
      <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
        <ul className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
          <li><a href="#booking">Booking</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="https://georgedev.se" target="_blank" rel="GeorgeDev">George</a></li>

        </ul>
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
      </nav>
    </header>
  );
};

export default Header;
