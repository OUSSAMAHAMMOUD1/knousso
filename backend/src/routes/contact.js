const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// POST /api/contact
router.post('/', [
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('message').trim().isLength({ min: 5 }).withMessage('Message trop court'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"KnOusso Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `📩 Nouveau message de ${name} — KnOusso`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border:1px solid #333">
          <h2 style="color:#C9A84C;font-size:22px;margin-bottom:24px">Nouveau message — KnOusso</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#999;width:100px">Nom</td><td style="padding:8px 0;color:#fff">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#999">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#C9A84C">${email}</a></td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#1a1a1a;border-left:3px solid #C9A84C">
            <p style="color:#ccc;white-space:pre-wrap;margin:0">${message}</p>
          </div>
        </div>
      `,
    });

    res.json({ message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ message: 'Erreur d\'envoi. Réessayez.' });
  }
});

module.exports = router;
