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

export const getAds = async (page: number = 1): Promise<Ad[]> => {
  try {
    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      orderBy("createdAt", "desc"),
      limit(ITEMS_PER_PAGE * page)
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

export const getUserAds = async (page: number = 1): Promise<Ad[]> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to fetch ads');
    }

    const adsRef = collection(db, "ads");
    const q = query(
      adsRef,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(ITEMS_PER_PAGE * page)
    );
    const querySnapshot = await getDocs(q);

    const userAds = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));

    // Update cache
    localStorage.setItem(ADS_CACHE_KEY, JSON.stringify(userAds));
    localStorage.setItem('ads_cache_timestamp', Date.now().toString());

    return userAds;
  } catch (error) {
    console.error("Error fetching user ads:", error);
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