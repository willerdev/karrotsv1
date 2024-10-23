import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { FaTicketAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  userId: string;
  dateCreated: string;
}

const Support = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return; // Add this line
    const q = query(collection(db, 'tickets'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const fetchedTickets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ticket));
    setTickets(fetchedTickets);
  };

  const handleCloseTicket = async (ticketId: string) => {
    await updateDoc(doc(db, 'tickets', ticketId), { status: 'closed' });
    fetchTickets();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to submit a support ticket.');
      return;
    }

    setSubmitStatus('submitting');

    try {
      await addDoc(collection(db, 'tickets'), {
        title,
        description,
        phoneNumber,
        status: 'open',
        userId: user.uid,
        dateCreated: new Date().toISOString()
      });

      setSubmitStatus('success');
      setTitle('');
      setDescription('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border rounded"
            rows={4}
          ></textarea>
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block mb-1">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={submitStatus === 'submitting'}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors duration-300"
        >
          {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
      {submitStatus === 'success' && (
        <p className="mt-4 text-green-600">Your ticket has been submitted successfully!</p>
      )}
      {submitStatus === 'error' && (
        <p className="mt-4 text-red-600">There was an error submitting your ticket. Please try again.</p>
      )}
      
      <h2 className="text-xl font-bold mt-8 mb-4">Your Tickets</h2>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <FaTicketAlt className="text-orange-500 text-2xl" />
              <div>
                <h3 className="font-semibold">{ticket.title}</h3>
                <p className="text-sm text-gray-600">{ticket.description}</p>
                <span className={`text-sm ${ticket.status === 'open' ? 'text-green-500' : 'text-red-500'}`}>
                  {ticket.status === 'open' ? <FaCheckCircle className="inline mr-1" /> : <FaTimesCircle className="inline mr-1" />}
                  {ticket.status}
                </span>
              </div>
            </div>
            {ticket.status === 'open' && (
              <button
                onClick={() => handleCloseTicket(ticket.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors duration-300"
              >
                Close
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Support;
