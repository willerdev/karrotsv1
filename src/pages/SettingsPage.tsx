import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, Shield, Bell, Lock, HelpCircle, FileText, Trash2, Database, Flag, UserPlus, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LucideIcon } from 'lucide-react';
import TwoFactorAuthModal from '../components/TwoFactorAuthModal';

const SettingsPage = () => {
  const { logout } = useAuth();
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-[600px] mx-auto w-full bg-white p-4 flex items-center">
        <Link to="/profile" className="text-gray-600">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-semibold ml-4">Settings</h1>
      </div>

      <div className="max-w-[600px] mx-auto w-full p-4">
        <h2 className="text-lg font-semibold mb-2">Account</h2>
        <ul className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SettingsItem icon={User} text="Edit profile" link="/edit-profile" />
          <SettingsItem
            icon={Shield}
            text="Security"
            onClick={() => setShowTwoFactorModal(true)}
          />
          <SettingsItem icon={Bell} text="Notifications" link="/notifications" />
          <SettingsItem icon={Lock} text="Privacy" link="/privacy" />
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">Support & About</h2>
        <ul className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SettingsItem icon={Settings} text="My Subscription" link="/subscription" />
          <SettingsItem icon={HelpCircle} text="Help & Support" link="/support" />
          <SettingsItem icon={FileText} text="Terms and Policies" link="/terms" />
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">Cache & Cellular</h2>
        <ul className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SettingsItem icon={Trash2} text="Free up space" link="/free-up-space" />
          {/* <SettingsItem icon={Database} text="Data Saver" link="/data-saver" /> */}
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-2">Actions</h2>
        <ul className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SettingsItem icon={Flag} text="Report a problem" link="/support" />
          {/* <SettingsItem icon={UserPlus} text="Add account" link="/add-account" /> */}
          <li className="border-t">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center text-red-500"
            >
              <LogOut size={20} className="mr-3" />
              Log out
            </button>
          </li>
        </ul>
      </div>

      {showTwoFactorModal && (
        <TwoFactorAuthModal onClose={() => setShowTwoFactorModal(false)} />
      )}
    </div>
  );
};

const SettingsItem = ({
  icon: Icon,
  text,
  link,
  onClick
}: {
  icon: LucideIcon;
  text: string;
  link?: string;
  onClick?: () => void;
}) => (
  <li className="border-t first:border-t-0">
    {onClick ? (
      <button onClick={onClick} className="w-full px-4 py-3 flex items-center">
        <Icon size={20} className="text-gray-500 mr-3" />
        <span>{text}</span>
      </button>
    ) : (
      <Link to={link!} className="px-4 py-3 flex items-center">
        <Icon size={20} className="text-gray-500 mr-3" />
        <span>{text}</span>
      </Link>
    )}
  </li>
);

export default SettingsPage;
