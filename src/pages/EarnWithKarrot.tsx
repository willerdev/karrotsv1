import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Copy, ExternalLink } from 'lucide-react';

type Referral = {
  id: string;
  link: string;
  userId: string;
  newUserId: string;
  amount: number;
  status: string;
  dateCreated: Date;
};

const EarnWithKarrot = () => {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (user) {
      // Generate referral link
      const encryptedId = btoa(user.uid); // Simple base64 encoding (replace with more secure method in production)
      setReferralLink(`https://karrot.rw/register?ref=${encryptedId}`);

      // Fetch referrals
      const fetchReferrals = async () => {
        const q = query(collection(db, 'referrals'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const referralData: Referral[] = [];
        let total = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Referral;
          referralData.push({ ...data, id: doc.id });
          if (data.status === 'completed') {
            total += data.amount;
          }
        });
        setReferrals(referralData);
        setTotalEarned(total);
      };

      fetchReferrals();
    }
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Earn with Karrot</h1>
      
      <div className="bg-orange-100 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Send this link to your friends if they use it to sign up, you will earn 100 Frw</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={copyToClipboard}
            className="bg-orange-500 text-white p-2 rounded-r hover:bg-orange-600 transition-colors duration-300"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Earnings withdraw only from 50k</h2>
        <p className="text-2xl font-bold text-green-600">{totalEarned.toFixed(2)} Frw</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Referral History</h2>
      </div>
    </div>
  );
};

export default EarnWithKarrot;

