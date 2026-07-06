const express   = require('express');
const nodemailer = require('nodemailer');
const cors      = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ─── Nodemailer transporter ──────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection at startup
transporter.verify((error) => {
  if (error) {
    console.error('⚠️  Mail transporter error:', error.message);
  } else {
    console.log('✅  Mail transporter ready');
  }
});

// ─── POST /api/contact ───────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic server-side validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL}>`,
    to:   process.env.EMAIL,
    replyTo: email,
    subject: `Portfolio Inquiry: ${subject}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1C1B1B;">
        <div style="border-bottom: 2px solid #006C4B; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 500; color: #006C4B;">Portfolio Inquiry</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #71717A; font-size: 11px; letter-spacing: 0.08em; width: 120px;">FROM</td>
            <td style="padding: 8px 0; font-size: 15px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717A; font-size: 11px; letter-spacing: 0.08em;">REPLY TO</td>
            <td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #006C4B;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717A; font-size: 11px; letter-spacing: 0.08em;">SUBJECT</td>
            <td style="padding: 8px 0; font-size: 15px;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; padding: 20px; background: #F6F3F2; border-left: 3px solid #006C4B;">
          <p style="margin: 0; font-size: 11px; letter-spacing: 0.08em; color: #71717A; margin-bottom: 12px;">MESSAGE</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="margin-top: 24px; font-size: 11px; color: #858383;">
          Sent from your portfolio contact form at lekantheboy.github.io
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
});

// ─── Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});