import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { amount, phoneNumber, provider, action, userId } = req.body;

    // Create a new transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        phoneNumber,
        provider,
        action,
        status: 'pending',
        userId,
      },
    });

    // Update user's balance
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: parseFloat(amount),
        },
      },
    });

    return res.status(200).json({ success: true, transaction, balance: user.balance });
  } catch (error) {
    console.error('Top-up error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}