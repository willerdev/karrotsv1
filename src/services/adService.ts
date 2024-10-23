import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, arrayUnion, arrayRemove, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Ad } from "../types/Ad";

const ADS_CACHE_KEY = 'ads_cache';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
const ITEMS_PER_PAGE = 200; // Define the number of items to load per page

export const postAd = async (adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'views' | 'savedBy'>) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to post an ad');
    }

    const newAd: Omit<Ad, 'id'> = {
      ...adData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      views: 0,
      savedBy: []
    };

    const docRef = await addDoc(collection(db, "ads"), newAd);
    console.log("Ad posted successfully with ID: ", docRef.id);

    // Update cache
    const cachedAds = JSON.parse(localStorage.getItem(ADS_CACHE_KEY) || '[]');
    cachedAds.unshift({ id: docRef.id, ...newAd });
    localStorage.setItem(ADS_CACHE_KEY, JSON.stringify(cachedAds));
    localStorage.setItem('ads_cache_timestamp', Date.now().toString());

    return docRef.id;
  } catch (error) {
    console.error("Error posting ad:", error);
    throw error;
  }
};

export const getAds = async (page: number = 1, pageSize: number = 120): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      orderBy("createdAt", "desc"),
      limit(pageSize),
      startAfter((page - 1) * pageSize)
    );
    
    const querySnapshot = await getDocs(q);

    const ads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));

    // Update cache (you might want to modify this for pagination)
    localStorage.setItem(ADS_CACHE_KEY, JSON.stringify(ads));
    localStorage.setItem('ads_cache_timestamp', Date.now().toString());

    return ads;
  } catch (error) {
    console.error("Error fetching ads:", error);
    throw error;
  }
};
export const getuserAds = async (userId: string): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      where('userId', '==', userId),
      orderBy("createdAt", "desc")
      
    );
    const querySnapshot = await getDocs(q);

    const ads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));

    // Update cache
    localStorage.setItem(ADS_CACHE_KEY, JSON.stringify(ads));
    localStorage.setItem('ads_cache_timestamp', Date.now().toString());

    return ads;
  } catch (error) {
    console.error("Error fetching ads:", error);
    throw error;
  }
};

export const getUserAds = async (userId: string): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, 'ads');
    const q = query(
      adsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
  } catch (error: any) {
    if (error.code === 'failed-precondition' || error.code === 'resource-exhausted') {
      console.error('Firestore index error:', error);
      throw new Error('Database index is being created. Please try again in a few minutes.');
    }
    throw error;
  }
};

export const getSavedAds = async (): Promise<Ad[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to fetch saved ads');
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const savedAdIds = userDoc.data()?.savedAds || [];
    const savedAds: Ad[] = [];

    for (const adId of savedAdIds) {
      const adRef = doc(db, "ads", adId);
      const adDoc = await getDoc(adRef);
      if (adDoc.exists()) {
        savedAds.push({ id: adDoc.id, ...adDoc.data() } as Ad);
      }
    }

    return savedAds;
  } catch (error) {
    console.error("Error fetching saved ads:", error);
    throw error;
  }
};

export const saveAd = async (adId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to save an ad');
    }

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      savedAds: arrayUnion(adId)
    });

    const adRef = doc(db, "ads", adId);
    await updateDoc(adRef, {
      savedBy: arrayUnion(user.uid)
    });
  } catch (error) {
    console.error("Error saving ad:", error);
    throw error;
  }
};

export const unsaveAd = async (adId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to unsave an ad');
    }

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      savedAds: arrayRemove(adId)
    });

    const adRef = doc(db, "ads", adId);
    await updateDoc(adRef, {
      savedBy: arrayRemove(user.uid)
    });
  } catch (error) {
    console.error("Error unsaving ad:", error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Ad | null> => {
  try {
    const adRef = doc(db, "ads", id);
    const adDoc = await getDoc(adRef);
    
    if (adDoc.exists()) {
      return { id: adDoc.id, ...adDoc.data() } as Ad;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const sendAdConfirmationEmail = async (email: string, ad: Ad, title: string) => {
  try {
    const response = await fetch('./api/send-ad-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, ad, title }),
    });

    if (!response.ok) {
      throw new Error('Failed to send confirmation email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

export const updateAdStatus = async (adId: string, newStatus: 'active' | 'sold' | 'unavailable') => {
  try {
    const adRef = doc(db, "ads", adId);
    await updateDoc(adRef, {
      status: newStatus,
      updatedAt: new Date()
    });
    console.log(`Ad status updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating ad status:", error);
    throw error;
  }
};

export const getAdsByUserId = async (userId: string): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
  } catch (error) {
    console.error("Error fetching ads by user ID:", error);
    throw error;
  }
};
