import nodemailer from 'nodemailer';

const DEFAULT_MAIL_TO = 'neha.sawant@caledordmc.co.uk';

function env(name, fallback = '') {
  return String(process.env[name] ?? fallback).trim();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export function isMailConfigured() {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));
}

function createTransport() {
  const port = Number(env('SMTP_PORT', '465')) || 465;
  const secure = env('SMTP_SECURE', port === 465 ? 'true' : 'false') !== 'false';

  return nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure,
    auth: {
      user: env('SMTP_USER'),
      pass: env('SMTP_PASS'),
    },
  });
}

export async function sendProposalEmail({ name, company, email, phone, message }) {
  if (!isMailConfigured()) {
    console.warn('SMTP is not configured. Proposal was saved, but no email was sent.');
    return { sent: false, skipped: true };
  }

  const to = env('MAIL_TO', DEFAULT_MAIL_TO);
  const fromAddress = env('MAIL_FROM', env('SMTP_USER'));
  const fromName = env('MAIL_FROM_NAME', 'Caledor DMC Website');

  const text = [
    'A new Request Proposal form was submitted on the website.',
    '',
    `Name: ${name || '-'}`,
    `Company: ${company || '-'}`,
    `Email: ${email || '-'}`,
    `Phone: ${phone || '-'}`,
    '',
    'Message:',
    message || '-',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#12203a">
      <h2 style="margin:0 0 12px">New proposal request</h2>
      <p style="margin:0 0 16px">A visitor submitted the Request Proposal form on caledordmc.co.uk.</p>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        <tr><td style="padding:6px 0;font-weight:700;width:120px">Name</td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:700">Company</td><td>${escapeHtml(company || '-')}</td></tr>
        <tr><td style="padding:6px 0;font-weight:700">Email</td><td>${escapeHtml(email)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:700">Phone</td><td>${escapeHtml(phone || '-')}</td></tr>
      </table>
      <p style="margin:16px 0 6px;font-weight:700">Message</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(message || '-')}</p>
    </div>
  `;

  const transporter = createTransport();
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    replyTo: email,
    subject: `New proposal request from ${name || 'website visitor'}`,
    text,
    html,
  });

  return { sent: true, to };
}
