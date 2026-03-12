import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  try {
    await transporter.sendMail({
      from: `"ShareMate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your ShareMate Account',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #0F0E0D; color: #F5F0E8;">
          <h1 style="font-family: 'Playfair Display', serif; color: #E8C547; margin-bottom: 16px;">Welcome to ShareMate</h1>
          <p style="color: #A09880; line-height: 1.6;">Click the button below to verify your email and start making an impact in your community.</p>
          <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: linear-gradient(135deg, #E8C547, #d4a83a); color: #0F0E0D; font-weight: 600; text-decoration: none; border-radius: 8px;">Verify Email</a>
          <p style="color: #5C5648; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

export const sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  try {
    await transporter.sendMail({
      from: `"ShareMate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your ShareMate Password',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #0F0E0D; color: #F5F0E8;">
          <h1 style="font-family: 'Playfair Display', serif; color: #E8C547; margin-bottom: 16px;">Password Reset</h1>
          <p style="color: #A09880; line-height: 1.6;">You requested a password reset. Click the button below to set a new password.</p>
          <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: linear-gradient(135deg, #E8C547, #d4a83a); color: #0F0E0D; font-weight: 600; text-decoration: none; border-radius: 8px;">Reset Password</a>
          <p style="color: #5C5648; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    console.log(`Reset email sent to ${email}`);
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};

export const sendEventReminder = async (email, eventTitle, dateTime) => {
  try {
    await transporter.sendMail({
      from: `"ShareMate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Reminder: ${eventTitle} is coming up!`,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #0F0E0D; color: #F5F0E8;">
          <h1 style="font-family: 'Playfair Display', serif; color: #E8C547; margin-bottom: 16px;">${eventTitle}</h1>
          <p style="color: #A09880; line-height: 1.6;">This event is happening on <strong style="color: #F5F0E8;">${new Date(dateTime).toLocaleDateString()}</strong>. Don't forget to attend!</p>
          <a href="${process.env.CLIENT_URL}/events" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: linear-gradient(135deg, #E8C547, #d4a83a); color: #0F0E0D; font-weight: 600; text-decoration: none; border-radius: 8px;">View Event</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error.message);
  }
};
