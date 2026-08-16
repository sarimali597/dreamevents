import { env } from '../config/env.js';

let warned = false;

export const sendEmail = async (to, subject, html) => {
  if (!env.RESEND_API_KEY) {
  if (!warned) {
  console.warn('[email] RESEND_API_KEY not configured — skipping email send');
  warned = true;
  }
  return false;
  }

  try {
  const { Resend } = await import('resend');
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
  from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`,
  to,
  subject,
  html,
  });

  if (error) {
  console.error('[email] Resend error:', error);
  return false;
  }
  return true;
  } catch (error) {
  console.error('[email] Failed to send email:', error);
  return false;
  }
};

export const sendBookingRequestEmail = (sellerName) =>
  `<p>You have received a new booking request on DreamEvents for ${sellerName}.</p><p>Log in to your <a href="${env.FRONTEND_URL}/seller-dashboard/requests">seller dashboard</a> to respond.</p>`;

export const sendEstimateEmail = (customerName) =>
  `<p>Hi ${customerName},</p><p>A seller has sent you a new estimate. View it in your <a href="${env.FRONTEND_URL}/messages">messages</a>.</p>`;

export const sendBookingConfirmedEmail = (customerName) =>
  `<p>Hi ${customerName},</p><p>Your booking has been confirmed. The seller has marked the deposit as received.</p>`;

export const sendSellerApprovedEmail = (businessName) =>
  `<p>Congratulations ${businessName}!</p><p>Your profile has been approved and is now live on DreamEvents. Customers can now find you and send booking requests.</p>`;

export const sendSellerRejectedEmail = (businessName, reason) =>
  `<p>Your profile "${businessName}" was not approved yet.</p><p>Reason: ${reason}</p><p>You can edit your profile and resubmit from your <a href="${env.FRONTEND_URL}/seller-dashboard">dashboard</a>.</p>`;
