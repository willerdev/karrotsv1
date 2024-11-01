import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostAd from './pages/PostAd';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import ProductDetails from './pages/ProductDetails';
import Footer from './components/Footer';
import MobileFooter from './components/MobileFooter';
import EditProfile from './pages/EditProfile';
import SavedAds from './pages/SavedAds';
import CategoryPage from './pages/CategoryPage';
import About from './pages/About';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Help from './pages/Help';
import Safety from './pages/Safety';
import Community from './pages/Community';
import Cookies from './pages/Cookies';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Locals from './pages/Locals';
import Explore from './pages/Explore';
import Wallet from './pages/Wallet';
import RecentlyViewed from './pages/RecentlyViewed';
import Favorites from './pages/Favorites';
import Listings from './pages/Listings';
import Purchases from './pages/Purchases';
import Savings from './pages/Savings';
import Events from './pages/Events';
import WhatsNew from './pages/WhatsNew';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';
import DeliveryServices from './pages/DeliveryServices';
import Payment from './pages/Payment';
import MyAds from './pages/MyAds';
import Subscription from './pages/Subscription';
import LoadingScreen from './components/LoadingScreen';
import ShopSettings from './pages/ShopSettings'; // Add this import
import KarrotPage from './pages/KarrotPage';
import Support from './pages/Support';
import EarnWithKarrot from './pages/EarnWithKarrot';
import DepositHistory from './pages/DepositHistory';
import WithdrawHistory from './pages/WithdrawHistory';
import Transactions from './pages/Transactions'; // Import the Transactions component
import OrderTracking from './pages/OrderTracking';
import NotFound from './pages/NotFound';
import OrderConfirmation from './pages/OrderConfirmation';
import SettingsPage from './pages/SettingsPage';
import FreeUpSpacePage from './pages/FreeUpSpacePage';
import NotificationHandler from './components/NotificationHandler';
import Offline from './pages/Offline';
import ChatConversation from './components/ChatConversation';
import MobileAuthRoute from './components/MobileAuthRoute';

// Remove the following line:
import AIChat from './pages/assistant';
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MobileAuthRoute>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:conversationId" element={<ChatConversation />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/post-ad" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/assistant" element={<AIChat />} />
                <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                <Route path="/saved" element={<ProtectedRoute><SavedAds /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </MobileAuthRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;
