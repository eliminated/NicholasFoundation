/**
 * The Nicholas Foundation — Local Development Server
 * ====================================================
 * Express server that:
 *   - Serves all static files (HTML, CSS, JS, assets)
 *   - Handles contact form submissions (POST /api/contact) → Nodemailer SMTP
 *   - Handles newsletter subscriptions (POST /api/newsletter) → console log
 *
 * In PRODUCTION, Netlify Forms handles contact and EmailJS handles newsletter.
 * This server is for LOCAL DEVELOPMENT only.
 *
 * Usage:
 *   1. cp .env.example .env  (then fill in your SMTP credentials)
 *   2. npm install
 *   3. npm run dev   (or npm start)
 *   4. Open http://localhost:3000
 */

'use strict';

require('dotenv').config();

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: `http://localhost:${PORT}` }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all static files from project root
app.use(express.static(path.join(__dirname)));

// ─── Nodemailer Transport ─────────────────────────────────────────────────────
function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('⚠️  SMTP not configured — emails will be logged to console instead.');
    return null;
  }
  return nodemailer.createTransport({
    host:   SMTP_HOST,
    port:   parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_SECURE === 'true',
    auth:   { user: SMTP_USER, pass: SMTP_PASS },
  });
}

// ─── Input Validation ─────────────────────────────────────────────────────────
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// ─── POST /api/contact ────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, org, type, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email address.' });
    }

    const safe = {
      name:    sanitize(name, 100),
      email:   sanitize(email, 200),
      org:     sanitize(org, 200),
      type:    sanitize(type, 100),
      subject: sanitize(subject, 200),
      message: sanitize(message, 2000),
    };

    const transport = createTransport();
    const toAddress = process.env.CONTACT_TO || 'hello@nicholasfoundation.org';
    const fromName  = process.env.CONTACT_FROM_NAME || 'TNF Website';

    const mailOptions = {
      from:     `"${fromName}" <${process.env.SMTP_USER}>`,
      to:       toAddress,
      replyTo:  `"${safe.name}" <${safe.email}>`,
      subject:  `[TNF Contact] ${safe.subject}`,
      text: [
        `Name:         ${safe.name}`,
        `Email:        ${safe.email}`,
        `Organization: ${safe.org || '—'}`,
        `Inquiry Type: ${safe.type || '—'}`,
        `Subject:      ${safe.subject}`,
        '',
        'Message:',
        safe.message,
      ].join('\n'),
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#060B18;color:#E2E8F0;padding:32px;border-radius:12px;">
          <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #1E2A3B;">
            <span style="background:linear-gradient(90deg,#7C3AED,#4F8EF7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:18px;font-weight:800;">The Nicholas Foundation</span>
            <p style="color:#64748B;font-size:12px;margin:4px 0 0;">New contact form submission</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:8px 0;color:#64748B;font-size:13px;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${safe.name}</td></tr>
            <tr><td style="padding:8px 0;color:#64748B;font-size:13px;">Email</td><td style="padding:8px 0;"><a href="mailto:${safe.email}" style="color:#4F8EF7;">${safe.email}</a></td></tr>
            ${safe.org ? `<tr><td style="padding:8px 0;color:#64748B;font-size:13px;">Organization</td><td style="padding:8px 0;">${safe.org}</td></tr>` : ''}
            ${safe.type ? `<tr><td style="padding:8px 0;color:#64748B;font-size:13px;">Inquiry Type</td><td style="padding:8px 0;">${safe.type}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#64748B;font-size:13px;">Subject</td><td style="padding:8px 0;font-weight:600;">${safe.subject}</td></tr>
          </table>
          <div style="background:#0D1526;border-radius:8px;padding:20px;border-left:3px solid #4F8EF7;">
            <p style="color:#64748B;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
            <p style="margin:0;line-height:1.7;white-space:pre-wrap;">${safe.message}</p>
          </div>
          <p style="color:#64748B;font-size:11px;margin-top:24px;">Sent from nicholasfoundation.org contact form</p>
        </div>
      `,
    };

    if (transport) {
      await transport.sendMail(mailOptions);
      console.log(`📧 Contact email sent → ${toAddress} from ${safe.email}`);
    } else {
      // No SMTP — log to console for dev inspection
      console.log('\n📧 [DEV MODE — No SMTP] Contact form submission:');
      console.log(mailOptions.text);
    }

    return res.json({ ok: true, message: 'Message sent successfully.' });

  } catch (err) {
    console.error('Contact form error:', err.message);
    return res.status(500).json({ ok: false, error: 'Failed to send message. Please try again.' });
  }
});

// ─── POST /api/newsletter ─────────────────────────────────────────────────────
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Valid email required.' });
    }

    const safeEmail = sanitize(email, 200);
    console.log(`📬 Newsletter subscription: ${safeEmail}`);

    // In local dev: just log. In production, use EmailJS on client side.
    // Future: integrate with Mailchimp / ConvertKit / Resend API here.

    return res.json({ ok: true, message: 'Subscribed! Check your inbox for confirmation.' });

  } catch (err) {
    console.error('Newsletter error:', err.message);
    return res.status(500).json({ ok: false, error: 'Subscription failed. Please try again.' });
  }
});

// ─── SPA-style fallback — serve index for unknown routes ─────────────────────
app.use((req, res) => {
  // Check if it's an HTML page request
  if (!req.path.includes('.')) {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
  } else {
    res.status(404).send('Not found');
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 TNF local server running at http://localhost:${PORT}`);
  console.log(`   Contact API: POST http://localhost:${PORT}/api/contact`);
  console.log(`   Newsletter:  POST http://localhost:${PORT}/api/newsletter`);
  const smtpConfigured = !!process.env.SMTP_HOST;
  console.log(`   SMTP email:  ${smtpConfigured ? '✅ configured' : '⚠️  not configured (logging to console)'}`);
  console.log('');
});

module.exports = app;
