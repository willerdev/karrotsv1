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
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/post-ad" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile/:section" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><SavedAds /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/delivery-services" element={<DeliveryServices />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/payment/:userPlanId" element={<Payment />} />
              <Route path="/order-confirmation/:purchaseId" element={<OrderConfirmation />} />
              <Route path="/help" element={<Help />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/community" element={<Community />} />
              <Route path="/chat/:conversationId?" element={<ChatPage />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/locals" element={<Locals />} />
              <Route path="/myads" element={<ProtectedRoute><MyAds /></ProtectedRoute>} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/recently-viewed/:category" element={<ProtectedRoute><RecentlyViewed /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
              <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/whats-new" element={<WhatsNew />} />
              <Route path="/recently-viewed" element={<RecentlyViewed />} />
              <Route path="/shop-settings" element={<ShopSettings />} />
              <Route path="/shop/:shopId" element={<KarrotPage />} />
              <Route path="/support" element={<Support />} />
              <Route path="/earn-with-karrot" element={<EarnWithKarrot />} />
              <Route path="/deposit-history" element={<DepositHistory />} />
              <Route path="/withdraw-history" element={<WithdrawHistory />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <div className="md:hidden">
            <MobileFooter />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
