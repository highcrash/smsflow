import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private resend: Resend | null;

  constructor() {
    const key = process.env.RESEND_API_KEY;
    this.resend = key ? new Resend(key) : null;
  }

  async sendWelcomeEmail(email: string, name: string) {
    if (!this.resend) return;
    await this.resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'SMSFlow <noreply@smsflow.io>',
      to: email,
      subject: 'Welcome to SMSFlow',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            </div>
            <span style="font-size: 22px; font-weight: 800; color: #111827;">SMS<span style="color: #059669;">Flow</span></span>
          </div>
          <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 12px;">Welcome, ${name}!</h2>
          <p style="color: #6B7280; font-size: 16px; line-height: 1.6;">Your 14-day free trial is active. Connect your first Android device to start sending SMS.</p>
          <a href="${process.env.NEXTAUTH_URL}/devices" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 10px; font-weight: 600;">Add Your First Device</a>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    if (!this.resend) return;
    await this.resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'SMSFlow <noreply@smsflow.io>',
      to: email,
      subject: 'Reset your SMSFlow password',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px;">
          <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 12px;">Reset your password</h2>
          <p style="color: #6B7280; font-size: 16px; line-height: 1.6;">Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 10px; font-weight: 600;">Reset Password</a>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  }
}
