import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-orange-500 text-white py-8 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Karrots</h3>
            <ul className="space-y-2">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/safety">Safety Center</Link></li>
              <li><Link to="/community">Community Guidelines</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/cookies">Cookies Policy</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Install App</h3>
            <p>Coming soon to iOS and Android</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2024 Karrots. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;