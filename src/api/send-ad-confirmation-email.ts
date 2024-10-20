import { Request, Response } from 'express';
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // You'll need to install this package

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, ad, title } = req.body;

    // Configure your email transporter here
    let transporter = nodemailer.createTransport({
      // Your email service configuration
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Karrots" <noreply@karrotsv1.netlify.app>',
      to: email,
      subject: `Ad Posted: ${title}`,
      text: `Your ad "${title}" has been successfully posted.`,
      html: `<b>Your ad "${title}" has been successfully posted.</b>`,
    });

    console.log('Message sent: %s', info.messageId);
    res.status(200).json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

module.exports = router;
