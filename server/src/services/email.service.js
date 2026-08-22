import nodemailer from 'nodemailer'
import { config } from '../config/environment.js'

let transporter = null
let verified = false

function getTransporter() {
  if (transporter) return transporter

  const { host, port, secure, user, pass } = config.email

  if (!host || !user || !pass) {
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })

  return transporter
}

async function ensureVerified() {
  if (verified) return
  const t = getTransporter()
  if (!t) return
  try {
    await t.verify()
    verified = true
    console.log('[email] SMTP transporter verified')
  } catch (err) {
    console.warn('[email] SMTP verification failed:', err.message)
  }
}

function wrapHtml(title, body) {
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:#14bf96;padding:24px 32px;">
      <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.02em;">skillsaarthi</div>
      <div style="color:#e3f9f1;font-size:13px;margin-top:4px;">One-Stop Personalized Career &amp; Education Advisor</div>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 12px;font-size:20px;color:#21242c;">${title}</h1>
      ${body}
      <p style="margin:24px 0 0;font-size:12px;color:#797d8a;">If you did not request this email, you can safely ignore it.</p>
    </div>
    <div style="background:#f7f8fa;padding:16px 32px;text-align:center;font-size:12px;color:#797d8a;">
      &copy; ${new Date().getFullYear()} skillsaarthi &mdash; All rights reserved
    </div>
  </div>
</body>
</html>`
}

export async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter()

  if (!t) {
    console.log(`[email:mock] To: ${to}\nSubject: ${subject}\n${text || html}`)
    return { mocked: true }
  }

  await ensureVerified()

  const from = config.email.from
  const info = await t.sendMail({ from, to, subject, html, text })
  console.log(`[email] Sent to ${to} — ${info.messageId}`)
  return { mocked: false, messageId: info.messageId }
}

export async function sendVerificationEmail({ to, name, token }) {
  const verifyUrl = `${config.frontendUrl.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`
  const subject = 'Verify your email — skillsaarthi'
  const body = `
    <p style="margin:0 0 12px;font-size:14px;color:#5b5e6b;">Hi ${escapeHtml(name || 'there')},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#5b5e6b;">Thanks for signing up for <strong>skillsaarthi</strong>. Please verify your email address to unlock all features.</p>
    <p style="margin:0 0 20px;">
      <a href="${verifyUrl}" style="display:inline-block;background:#14bf96;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">Verify email</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#5b5e6b;">Or copy and paste this link into your browser:</p>
    <p style="margin:0;word-break:break-all;"><a href="${verifyUrl}" style="color:#0a7d63;font-size:13px;">${verifyUrl}</a></p>
    <p style="margin:16px 0 0;font-size:12px;color:#797d8a;">This link expires in 24 hours. If you already verified, you can ignore this email.</p>
  `
  return sendEmail({
    to,
    subject,
    html: wrapHtml('Verify your email', body),
    text: `Hi ${name || 'there'},\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  })
}

export async function sendOtpEmail({ to, name, otp }) {
  const verifyUrl = `${config.frontendUrl.replace(/\/$/, '')}/verify-otp?email=${encodeURIComponent(to)}&otp=${encodeURIComponent(otp)}`
  const subject = `Your verification code is ${otp} — skillsaarthi`
  const body = `
    <p style="margin:0 0 12px;font-size:14px;color:#5b5e6b;">Hi ${escapeHtml(name || 'there')},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#5b5e6b;">Thanks for signing up for <strong>skillsaarthi</strong>. Use the code below to verify your email. It expires in 10 minutes.</p>
    <p style="margin:0 0 20px;text-align:center;">
      <span style="display:inline-block;background:#f0fdf9;border:1px solid #14bf96;color:#0a7d63;padding:16px 24px;border-radius:12px;font-weight:800;font-size:28px;letter-spacing:0.2em;">${escapeHtml(otp)}</span>
    </p>
    <p style="margin:0 0 12px;text-align:center;">
      <a href="${verifyUrl}" style="display:inline-block;background:#14bf96;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">Verify automatically</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#5b5e6b;">Or copy and paste this link:</p>
    <p style="margin:0;word-break:break-all;"><a href="${verifyUrl}" style="color:#0a7d63;font-size:13px;">${verifyUrl}</a></p>
    <p style="margin:16px 0 0;font-size:12px;color:#797d8a;">This code expires in 10 minutes and can only be used once. If you did not sign up, ignore this email.</p>
  `
  return sendEmail({
    to,
    subject,
    html: wrapHtml('Verify your email — OTP', body),
    text: `Hi ${name || 'there'},\n\nYour verification code is: ${otp}\nVerify link: ${verifyUrl}\nExpires in 10 minutes.`,
  })
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${config.frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`
  const subject = 'Reset your password — skillsaarthi'
  const body = `
    <p style="margin:0 0 12px;font-size:14px;color:#5b5e6b;">Hi ${escapeHtml(name || 'there')},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#5b5e6b;">We received a request to reset the password for your <strong>skillsaarthi</strong> account.</p>
    <p style="margin:0 0 20px;">
      <a href="${resetUrl}" style="display:inline-block;background:#14bf96;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">Reset password</a>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#5b5e6b;">Or copy and paste this link:</p>
    <p style="margin:0;word-break:break-all;"><a href="${resetUrl}" style="color:#0a7d63;font-size:13px;">${resetUrl}</a></p>
    <p style="margin:16px 0 0;font-size:12px;color:#797d8a;">This link expires in 60 minutes. If you did not request a reset, no action is needed.</p>
  `
  return sendEmail({
    to,
    subject,
    html: wrapHtml('Reset your password', body),
    text: `Hi ${name || 'there'},\n\nReset your password: ${resetUrl}\n\nThis link expires in 60 minutes.`,
  })
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function isEmailConfigured() {
  const { host, user, pass } = config.email
  return Boolean(host && user && pass)
}
