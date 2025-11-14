import express from 'express';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/contact',
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, message, subject } = req.body;
      const contactEntry = {
        name,
        email,
        message,
        subject: subject || 'Contact Form Submission',
        timestamp: new Date().toISOString()
      };

      const dataDir = path.join(__dirname, '..', 'data');
      const contactsFile = path.join(dataDir, 'contacts.json');

      try {
        await fs.mkdir(dataDir, { recursive: true });
      } catch (err) {}

      let contacts = [];
      try {
        const data = await fs.readFile(contactsFile, 'utf8');
        contacts = JSON.parse(data);
      } catch (err) {}

      contacts.push(contactEntry);
      await fs.writeFile(contactsFile, JSON.stringify(contacts, null, 2));

      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });

          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: `Contact Form: ${subject || 'New Message'}`,
            text: `From: ${name} (${email})\n\n${message}`
          });
        } catch (emailError) {
          console.error('Email send error:', emailError);
        }
      } else {
        console.log('Contact form submission (email not configured):', contactEntry);
      }

      res.json({ message: 'Contact form submitted successfully' });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ error: 'Failed to submit contact form' });
    }
  }
);

export default router;
