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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
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
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/post-ad" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat conversations={[]} /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/edit-profile/:section" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><SavedAds /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              <Route path="/help" element={<Help />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/community" element={<Community />} />
              <Route path="/chat/:conversationId?" element={<ChatPage />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/locals" element={<Locals />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/recently-viewed/:category" element={<ProtectedRoute><RecentlyViewed /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
              <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/whats-new" element={<WhatsNew />} />
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
