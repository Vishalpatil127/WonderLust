const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("../config/logger");

const transporter = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

const buildBookingConfirmationEmail = ({ customerName, listingTitle, location, checkIn, checkOut, guests, totalPrice }) => {
  const subject = "Booking Confirmed - Wonderlust";
  const text = [
    `Hi ${customerName},`,
    "",
    `Your booking for ${listingTitle} in ${location} has been confirmed.`,
    `Check-in: ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Guests: ${guests}`,
    `Total Price: ${totalPrice}`,
    "",
    "Thank you for choosing Wonderlust.",
  ].join("\n");

  return { subject, text };
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter || !to) {
    logger.warn("Skipping email delivery because SMTP is not configured or recipient is missing");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Wonderlust" <${env.SMTP_USER}>`,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    });

    return true;
  } catch (error) {
    logger.error("Failed to send email", { error: error.message, to, subject });
    return false;
  }
};

module.exports = { sendEmail, buildBookingConfirmationEmail, sendAdminOtpEmail, sendHostOtpEmail };

function sendHostOtpEmail({ to, username, otp }) {
  const subject = "Wonderlust Host — Your sign-in OTP";

  const text = [
    `Hi ${username},`,
    "",
    "Someone is attempting to sign in to your Wonderlust Host account.",
    `Your one-time password is: ${otp}`,
    "It expires in 10 minutes.",
    "",
    "If this wasn't you, ignore this email.",
    "",
    "— Wonderlust Security",
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:#fffbeb;border:1px solid #fde68a;">
          <span style="font-size:28px;">🏠</span>
        </div>
      </div>
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#111827;text-align:center;">Host Sign-in OTP</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">Hi <strong>${username}</strong>, use the code below to complete your sign-in.</p>
      <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">Your OTP</p>
        <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:0.25em;color:#d97706;">${otp}</p>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-align:center;">⏱ Expires in <strong>10 minutes</strong>.</p>
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">If this wasn't you, your account may be at risk.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}


function sendAdminOtpEmail({ to, username, otp }) {
  const subject = "Wonderlust Admin — Your sign-in OTP";

  const text = [
    `Hi ${username},`,
    "",
    "Someone is attempting to sign in to the Wonderlust Admin panel.",
    `Your one-time password is: ${otp}`,
    "It expires in 10 minutes.",
    "",
    "If this wasn't you, ignore this email.",
    "",
    "— Wonderlust Security",
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:14px;background:#fff1f2;border:1px solid #fecdd3;">
          <span style="font-size:28px;">🔐</span>
        </div>
      </div>
      <h2 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#111827;text-align:center;">Admin Sign-in OTP</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">Hi <strong>${username}</strong>, use the code below to complete your sign-in.</p>
      <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;">Your OTP</p>
        <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:0.25em;color:#e11d48;">${otp}</p>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-align:center;">⏱ Expires in <strong>10 minutes</strong>.</p>
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">If this wasn't you, your account may be at risk.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}
