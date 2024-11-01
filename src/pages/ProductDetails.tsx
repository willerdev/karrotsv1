import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Flag, MapPin, Star, CheckCircle, CreditCard, Heart, Mail, Loader, Smartphone, Battery, Cpu, Award, Clock, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp, query, where, increment, Timestamp, runTransaction, deleteDoc, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Ad } from '../types/Ad';
import { User } from '../types/User';
import { Dialog, Transition } from '@headlessui/react';
import LoadingScreen from '../components/LoadingScreen';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useWallet } from '../contexts/WalletContext'; // Adjust the import path as needed
import { WalletProvider } from '../contexts/WalletContext'; // Import the WalletProvider
import DeliveryModal from '../components/DeliveryModal';
import { Link } from 'react-router-dom';
const ProductDetailsWrapper: React.FC = () => {
  return (
    <WalletProvider>
      <ProductDetails />
    </WalletProvider>
  );
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [seller, setSeller] = useState<User | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isOfferLoading, setIsOfferLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [paymentOptions, setPaymentOptions] = useState<string[]>([]);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'sms' | 'system'>('system');
  const { walletBalance, updateWalletBalance, walletId } = useWallet(); // Add walletId here
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Ad[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(() => {
    return localStorage.getItem('hideSafetyTips') !== 'true';
  });
  // Add this animation variant
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !user) {
        setError('No product ID provided or user not logged in');
        return;
      }

      // Create an abort controller
      const abortController = new AbortController();

      try {
        const productRef = doc(db, 'ads', id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = { id: productSnap.id, ...productSnap.data() } as Ad;
          setProduct(productData);
          setIsSaved(user ? productData.savedBy?.includes(user.uid) : false);

          // Update or create adview record
          await updateAdView(id, user.uid);

          // Fetch seller information
          const sellerRef = doc(db, 'users', productData.userId);
          const sellerSnap = await getDoc(sellerRef);
          if (sellerSnap.exists()) {
            setSeller({ id: sellerSnap.id, ...sellerSnap.data() } as User);
          }

          // Fetch ratings
          const ratingsRef = collection(db, 'ads', productData.id, 'ratings');
          const ratingsSnapshot = await getDocs(ratingsRef);
          const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
          const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
          setAverageRating(avg);
          setTotalRatings(ratings.length);

          if (user) {
            const userRatingDoc = ratingsSnapshot.docs.find(doc => doc.id === user.uid);
            if (userRatingDoc) {
              setUserRating(userRatingDoc.data().rating);
            }
          }
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching product:', err);
          setError('Failed to load product details. Please try again.');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }

      // Return a cleanup function
      return () => {
        abortController.abort();
      };
    };

    fetchProduct();
  }, [id, user]);

  const updateAdView = async (adId: string, userId: string) => {
    try {
      const adViewRef = doc(db, 'adviews', `${adId}_${userId}`);
      const adViewSnap = await getDoc(adViewRef);

      if (adViewSnap.exists()) {
        // Update existing record
        await updateDoc(adViewRef, {
          viewCount: increment(1),
          lastViewed: serverTimestamp()
        });
      } else {
        // Create new record
        await setDoc(adViewRef, {
          adId,
          userId,
          viewCount: 1,
          firstViewed: serverTimestamp(),
          lastViewed: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating ad view:', error);
      // Note: We're not setting an error state here to avoid disrupting the user experience
    }
  };

  useEffect(() => {
    // Check if the user is following the seller
    const checkFollowStatus = async () => {
      if (user && seller) {
        const followersRef = collection(db, 'followers');
        const q = query(
          followersRef,
          where('followerId', '==', user.uid),
          where('userId', '==', seller.id)
        );
        const querySnapshot = await getDocs(q);
        setIsFollowing(!querySnapshot.empty);
      }
    };

    checkFollowStatus();

    // Fetch any products as similar products
    const fetchSimilarProducts = async () => {
      const adsRef = collection(db, 'ads');
      const q = query(adsRef, limit(4));
      const querySnapshot = await getDocs(q);
      const similarProductsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      setSimilarProducts(similarProductsData);
    };

    fetchSimilarProducts();
  }, [id, user, seller]);

  const handleSaveAd = async () => {
    if (!user || !product) return;

    try {
      const adRef = doc(db, 'ads', product.id);
      const userRef = doc(db, 'users', user.uid);

      if (isSaved) {
        await updateDoc(adRef, {
          savedBy: arrayRemove(user.uid)
        });
        await updateDoc(userRef, {
          savedAds: arrayRemove(product.id)
        });
        toast.success('Ad removed from saved items', {
          icon: '🗑️',
          duration: 3000,
        });
      } else {
        await updateDoc(adRef, {
          savedBy: arrayUnion(user.uid)
        });
        await updateDoc(userRef, {
          savedAds: arrayUnion(product.id)
        });
        toast.success('Ad saved successfully', {
          icon: '💾',
          duration: 3000,
        });
      }

      setIsSaved(!isSaved);
    } catch (err: any) {
      console.error('Error saving/unsaving ad:', err);
      setError('Failed to save/unsave ad. Please try again later.');
      toast.error('Failed to save/unsave ad. Please try again.', {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) {
      setError('Product information is missing');
      return;
    }

    setIsOfferLoading(true);

    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', user.uid),
        where('adId', '==', product.id)
      );
      const querySnapshot = await getDocs(q);

      let conversationId;

      if (!querySnapshot.empty) {
        // Existing conversation found
        conversationId = querySnapshot.docs[0].id;
      } else {
        // Create a new conversation
        const newConversationRef = await addDoc(conversationsRef, {
          participants: [user.uid, product.userId],
          adId: product.id,
          lastMessage: '',
          lastMessageSentBy: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadCount: 0
        });
        conversationId = newConversationRef.id;
      }

      // Navigate to the chat page
      navigate(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start chat. Please try again.');
    } finally {
      setIsOfferLoading(false);
    }
  };

  const handleReportAd = () => {
    if (!user) {
      navigate('/login');
    } else {
      setIsReportModalOpen(true);
    }
  };

  const handleSubmitReport = async () => {
    if (!user || !product) return;

    setIsSubmitting(true);
    try {
      const reportData = {
        userId: user.uid,
        sellerId: product.userId,
        adId: product.id,
        reason: reportReason,
        details: reportDetails,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'reports'), reportData);
      setIsReportModalOpen(false);
      setReportReason('');
      setReportDetails('');
      alert('Report submitted successfully');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user || !product) return;

    setIsRatingSubmitting(true);
    try {
      const ratingRef = doc(db, 'ads', product.id, 'ratings', user.uid);
      await setDoc(ratingRef, { rating, userId: user.uid, createdAt: serverTimestamp() });
      setUserRating(rating);

      const ratingsRef = collection(db, 'ads', product.id, 'ratings');
      const ratingsSnapshot = await getDocs(ratingsRef);
      const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
      const newTotal = ratings.length;
      const newAvg = ratings.reduce((a, b) => a + b, 0) / newTotal;
      
      setAverageRating(newAvg);
      setTotalRatings(newTotal);

      console.log('Rating saved successfully');
    } catch (error) {
      console.error('Error saving rating:', error);
      setError('Failed to save rating. Please try again later.');
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user || !product) return;

    try {
      const adRef = doc(db, 'ads', product.id);
      const userWalletRef = doc(db, 'wallets', user.uid);
      const sellerWalletRef = doc(db, 'wallets', product.userId);

      await runTransaction(db, async (transaction) => {
        let userWalletDoc = await transaction.get(userWalletRef);
        let sellerWalletDoc = await transaction.get(sellerWalletRef);

        // Create buyer's wallet if it doesn't exist
        if (!userWalletDoc.exists()) {
          transaction.set(userWalletRef, { balance: 0 });
          userWalletDoc = await transaction.get(userWalletRef);
        }

        // Create seller's wallet if it doesn't exist
        if (!sellerWalletDoc.exists()) {
          transaction.set(sellerWalletRef, { balance: 0, releaseable: 0 });
          sellerWalletDoc = await transaction.get(sellerWalletRef);
        }

        const userWalletData = userWalletDoc.data();
        const sellerWalletData = sellerWalletDoc.data();
        const currentBalance = userWalletData?.balance ?? 0;
        const sellerReleaseable = sellerWalletData?.releaseable ?? 0;

        if (currentBalance < product.price) {
          throw new Error("Insufficient funds");
        }

        // Update buyer's wallet
        transaction.update(userWalletRef, {
          balance: currentBalance - product.price
        });

        // Update ad status
        transaction.update(adRef, {
          status: 'sold',
        });

        // Update seller's wallet
        transaction.update(sellerWalletRef, {
          releaseable: sellerReleaseable + product.price,
        });

        // Create a new purchase record
        const purchaseRef = collection(db, 'purchases');
        const newPurchaseRef = doc(purchaseRef);
        const newPurchase = {
          productId: product.id,
          productTitle: product.title,
          buyerId: user.uid,
          sellerId: product.userId,
          price: product.price,
          paymentMethod: 'wallet',
          status: 'pending',
          purchaseDate: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        };
        transaction.set(newPurchaseRef, newPurchase);
      });

      // Update local wallet balance
      const newBalance = walletBalance - product.price;
      updateWalletBalance(newBalance);
      console.log('Updated wallet balance:', newBalance);

      // Add notifications for seller and buyer
      await addDoc(collection(db, 'notifications'), {
        userId: product.userId,
        dateCreated: serverTimestamp(),
        details: "Product sold",
        status: true,
        title: `Your product ${product.title} has been sold for ${product.price} Frw`,
      });

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        dateCreated: serverTimestamp(),
        details: "Purchase successful",
        status: true,
        title: `You have successfully purchased ${product.title} for ${product.price} Frw`,
      });

      toast.success('Purchase successful!', {
        icon: '✅',
        duration: 3000,
      });

      // Refresh product data
      const updatedProductSnap = await getDoc(adRef);
      if (updatedProductSnap.exists()) {
        setProduct({ id: updatedProductSnap.id, ...updatedProductSnap.data() } as Ad);
      }
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Failed to complete purchase. Please try again.', {
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const handleNotifyMe = async () => {
    if (!user || !product) return;

    try {
      const settingsRef = doc(db, 'settings', user.uid);
      await setDoc(settingsRef, {
        notificationMethod: notificationMethod,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast.success('Notification preference saved successfully', {
        icon: '✅',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving notification preference:', error);
      toast.error('Failed to save notification preference', {
        icon: '❌',
        duration: 3000,
      });
    } finally {
      setIsNotificationModalOpen(false);
    }
  };

  const handleFollowSeller = async () => {
    if (!user || !seller) return;

    try {
      if (isFollowing) {
        // Unfollow logic
        const followersRef = collection(db, 'followers');
        const q = query(
          followersRef,
          where('followerId', '==', user.uid),
          where('userId', '==', seller.id)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setIsFollowing(false);
        toast.success('Unfollowed seller successfully');
      } else {
        // Follow logic
        const followersRef = collection(db, 'followers');
        await addDoc(followersRef, {
          followerId: user.uid,
          userId: seller.id,
          createdAt: serverTimestamp(),
        });
        setIsFollowing(true);
        toast.success('Following seller successfully');
      }
    } catch (error) {
      console.error('Error following/unfollowing seller:', error);
      toast.error('Failed to follow/unfollow seller. Please try again.');
    }
  };

  // Add this function to check if the product is sold
  const isProductSold = () => {
    return product?.status === "sold";
  };

  // Add this function near your other handler functions
  const handlePaymentOption = (option: string) => {
    // Implement the logic for handling the payment option here
    console.log(`Selected payment option: ${option}`);
    // You might want to update state or perform other actions based on the selected option
  };

  const handleShare = async (platform: 'instagram' | 'whatsapp' | 'facebook') => {
    if (!user || !product) return;

    try {
      // Save share information to the 'shares' table
      const shareRef = collection(db, 'shares');
      await addDoc(shareRef, {
        userId: user.uid,
        adId: product.id,
        platform,
        date: serverTimestamp(),
      });

      // Generate share URL (you may want to use a URL shortener service in a real application)
      const shareUrl = `${window.location.origin}/product/${product.id}`;

      // Open share dialog based on the platform
      switch (platform) {
      
        case 'whatsapp':
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this product: ${product.title} - ${shareUrl}`)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
      }

      toast.success(`Shared on ${platform} successfully!`);
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleDeleteAd = async (e: React.MouseEvent, adId: string) => {
    e.preventDefault();
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'ads', adId));
      toast.success('Ad deleted successfully');
      // You might want to update the local state or refetch the ads here
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad. Please try again.');
    }
  };

  const handleMarkAsSold = async (e: React.MouseEvent, adId: string) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateDoc(doc(db, 'ads', adId), { status: 'sold' });
      toast.success('Ad marked as sold');
      // Update local state or refetch ads here
    } catch (error) {
      console.error('Error marking ad as sold:', error);
      toast.error('Failed to mark ad as sold. Please try again.');
    }
  };

  const dismissSafetyTips = () => {
    localStorage.setItem('hideSafetyTips', 'true');
    setShowSafetyTips(false);
  };

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-500 mb-4">{error}</p>
      <p className="mb-4">Please try one of the following:</p>
      <div className="space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Page
        </button>
        <Link
          to="/"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Go to Home Page
        </Link>
      </div>
    </div>
  );
  if (!product) return <div className="text-center py-8">Product not found</div>;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <motion.div 
        className="max-w-4xl mx-auto p-4 mb-20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={product.images[selectedImageIndex]} 
              alt={`${product.title} - Image ${selectedImageIndex + 1}`} 
              className="w-full h-80 object-contain bg-gray-100 rounded-lg mb-4"
            />
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.title} - Thumbnail ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded-md cursor-pointer ${
                    index === selectedImageIndex ? 'border-2 border-orange-500' : ''
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
            <p className="text-2xl font-bold text-orange-500 mt-4">{product.price.toLocaleString()} Frw</p>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-2">
              <MapPin size={20} className="mr-2 text-gray-500" />
              <span>{product.location}</span>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">DESCRIPTION</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
            <div className="flex space-x-2 mb-4">
              {product.status === 'underDeal' ? (
                <button
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors flex-grow"
                >
                  Notify me if not bought
                </button>
              ) : (
                <motion.button
                  onClick={handleBuyNow}
                  disabled={insufficientFunds || isProductSold()}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors flex-grow disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <CreditCard size={20} className="mr-2" />
                  {isProductSold() ? 'Sold Out' : 'Buy Now'}
                </motion.button>
              )}
              <button
                onClick={handleSaveAd}
                className={`p-2 rounded-lg border ${
                  isSaved ? 'bg-orange-100 text-orange-500 border-orange-500' : 'bg-white text-gray-500 border-gray-300'
                } hover:bg-orange-50 transition-colors`}
              >
                <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleReportAd}
                className="p-2 text-red-500 rounded-lg border border-red-500 hover:bg-red-50 transition-colors"
              >
                <Flag size={20} />
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 text-blue-500 rounded-lg border border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>
            {insufficientFunds && (
              <div className="text-red-500 text-sm mt-2">
                <p>Insufficient funds in your wallet. Please add money to your wallet before making a purchase.</p>
                <p>Current Balance: {walletBalance.toLocaleString()} Frw</p>
                {/* <p>Wallet ID: {walletId}</p>
                <p>User ID: {user?.uid}</p> */}
              </div>
            )}
            {seller && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Seller Information</h2>
                <div className="flex items-center mb-2">
                  <Heart size={20} className="mr-2 text-gray-500" />
                  <span>{seller.name}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Mail size={20} className="mr-2 text-gray-500" />
                  <span>{seller.email}</span>
                </div>
                {seller.isVerified && (
                  <span className="bg-green-100 text-green-900 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full flex items-center mt-2">
                    <CheckCircle size={14} className="mr-1" />
                    Verified Seller
                  </span>
                )}
              <button
  onClick={handleFollowSeller}
  disabled={user?.uid === product?.userId}
  className={`mt-2 px-4 py-2 rounded-lg ${
    user?.uid === product?.userId
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : isFollowing
      ? 'bg-gray-200 text-gray-700'
      : 'bg-orange-500 text-white'
  } hover:bg-orange-600 transition-colors disabled:hover:bg-gray-300`}
>
  {user?.uid === product?.userId 
    ? "Can't follow yourself" 
    : isFollowing 
    ? 'Unfollow Seller' 
    : 'Follow Seller'
  }
</button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Product details section */}
        <motion.div 
          className="mt-8 grid grid-cols-2 gap-4 hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center space-x-2 ">
            <Smartphone className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">BRAND</p>
              <p>{product.brand}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">MODEL</p>
              <p>{product.model}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">CONDITION</p>
              <p>{product.condition}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Battery className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">INTERNAL STORAGE</p>
              <p>{product.internalStorage} GB</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">RAM</p>
              <p>{product.ram} GB</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="mt-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-xl font-bold mb-4">Rate this Product</h2>
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star
                  size={24}
                  className={`cursor-pointer ${star <= (userRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  onClick={() => !isRatingSubmitting && handleRating(star)}
                />
              </motion.div>
            ))}
          </div>
          {averageRating !== null && (
            <p className="text-sm text-gray-600">
              Average rating: {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </p>
          )}
        </motion.div>

        {/* Report Modal */}
        <Transition appear show={isReportModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsReportModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Report Ad
                    </Dialog.Title>
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Reason for reporting"
                        className="w-full p-2 border rounded mb-2"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                      />
                      <textarea
                        placeholder="Additional details"
                        className="w-full p-2 border rounded mb-2"
                        rows={4}
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-orange-100 px-4 py-2 text-sm font-medium text-orange-900 hover:bg-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                        onClick={handleSubmitReport}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Payment Modal */}
        <Transition appear show={isPaymentModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsPaymentModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      Payment Details
                    </Dialog.Title>
                    <div className="mt-4">
                      {paymentMessage && <p className='text-center text-orange-500 font-bold text-xl mb-4'>{paymentMessage}</p>}
                      {paymentOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handlePaymentOption(option)}
                          className="w-full mb-2 inline-flex justify-center rounded-md border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                          disabled={isPaymentProcessing}
                        >
                          {isPaymentProcessing ? <Loader size={20} className="animate-spin mr-2" /> : null}
                          {option}
                        </button>
                      ))}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {product.status === 'underClaim' && (
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            Notify me if not bought
          </button>
        )}

        {/* Notification Modal */}
        <Transition appear show={isNotificationModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsNotificationModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      Choose Notification Method
                    </Dialog.Title>
                    <div className="mt-4">
                      <select
                        value={notificationMethod}
                        onChange={(e) => setNotificationMethod(e.target.value as 'email' | 'sms' | 'system')}
                        className="w-full p-2 border rounded mb-4"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="system">System</option>
                      </select>
                      <button
                        onClick={handleNotifyMe}
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Save Preference
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {showSafetyTips && (
          <motion.div 
            className="mt-4 bg-blue-50 p-4 rounded-lg relative"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button
              onClick={dismissSafetyTips}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Dismiss safety tips"
            >
              ×
            </button>
            <details className="cursor-pointer">
              <summary className="text-lg font-semibold mb-2">Safety Tips</summary>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Avoid advance payments</li>
                <li>Meet in public places</li>
                <li>Verify item condition</li>
                <li>Pay only when satisfied</li>
              </ul>
            </details>
          </motion.div>
        )}

        {/* Similar Products */}
        <motion.div 
          className="mt-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <h2 className="text-xl font-bold mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarProducts.map((similarProduct) => (
              <div key={similarProduct.id} className="border rounded-lg p-4">
                <img 
                  src={similarProduct.images[0]} 
                  alt={similarProduct.title} 
                  className="w-full h-40 object-cover mb-2 rounded"
                />
                <h3 className="font-semibold">{similarProduct.title}</h3>
                <p className="text-orange-500 font-bold">{similarProduct.price.toLocaleString()} Frw</p>
                <Link to={`/product/${similarProduct.id}`} className="mt-2 block text-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Share Modal */}
        <Transition appear show={isShareModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={() => setIsShareModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      Share this product
                    </Dialog.Title>
                    <div className="mt-4 space-y-4">
                      {/* <button
                        onClick={() => handleShare('instagram')}
                        className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
                      >
                        Share on Instagram
                      </button> */}
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      >
                        Share on WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Share on Facebook
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </motion.div>
    </>
  );
};

export default ProductDetailsWrapper;
