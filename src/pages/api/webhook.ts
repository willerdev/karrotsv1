import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../firebase';
import { collection, doc, updateDoc, addDoc, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const webhookData = req.body;

    // Save webhook data to the webhooks collection
    await addDoc(collection(db, 'webhooks'), webhookData);

    // Update transaction status
    const { ref, status } = webhookData.data;
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('transId', '==', ref));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const transactionDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'transactions', transactionDoc.id), {
        status: status === 'successful' ? 'success' : 'failed',
        updatedAt: new Date()
      });
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
