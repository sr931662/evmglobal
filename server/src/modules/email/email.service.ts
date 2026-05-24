import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);
  private adminEmail = process.env.ADMIN_EMAIL;
  private logger = new Logger('EmailService');
  private defaultFrom = 'Lead Manager <noreply@yourdomain.com>';
  private maxRetries = 3;

  constructor() {}

  /**
   * Sends an email using Resend with automatic retry on failure.
   *
   * @param {Object} options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML body content
   * @param {string} [options.from] - Sender email (defaults to configured from)
   * @param {string} [options.text] - Plain text fallback
   * @returns {Promise<Object>} Resend API response
   */
  async send({ to, subject, html, from = undefined, text = undefined }: { to: string; subject: string; html: string; from?: string; text?: string }) {
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.resend.emails.send({
          from: from || this.defaultFrom,
          to,
          subject,
          html,
          text,
        });
        this.logger.log(`Email sent to ${to} (attempt ${attempt})`);
        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Email send attempt ${attempt} failed for ${to}: ${error.message}`
        );
        if (attempt < this.maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((res) =>
            setTimeout(res, 1000 * Math.pow(2, attempt - 1))
          );
        }
      }
    }
    this.logger.error(`Failed to send email to ${to} after ${this.maxRetries} attempts`);
    throw lastError;
  }

  /**
   * Sends a new lead notification to the admin email.
   * Uses a built-in HTML template.
   *
   * @param {Object} lead - Lead object from database
   * @param {string} lead.name
   * @param {string} lead.phone
   * @param {string} [lead.email]
   * @param {string} [lead.message]
   * @param {string} [lead.file_url]
   * @returns {Promise<void>}
   */
  async sendOtpEmail(to: string, otp: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f7f8fa; margin: 0; padding: 0; }
          .wrap { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; }
          .header { background: #E53935; padding: 32px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 22px; font-family: Georgia, serif; }
          .body { padding: 40px 36px; }
          .otp-box { background: #f7f8fa; border: 2px dashed #e5e7eb; border-radius: 12px; text-align: center; padding: 28px; margin: 24px 0; }
          .otp-box span { font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #0a0a0a; font-family: monospace; }
          p { color: #555; font-size: 14px; line-height: 1.6; }
          .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="header"><h1>EMV Global — Password Reset</h1></div>
          <div class="body">
            <p>You requested a password reset for your EMV Global admin account. Use the OTP below to proceed:</p>
            <div class="otp-box"><span>${otp}</span></div>
            <p><strong>This OTP is valid for 10 minutes</strong> and can only be used once.</p>
            <p>If you did not request this, please ignore this email. Your password will not change.</p>
          </div>
          <div class="footer">EMV Global · Admin Workspace · This is an automated message, do not reply.</div>
        </div>
      </body>
      </html>
    `;
    await this.send({ to, subject: 'Your EMV Global password reset OTP', html });
    this.logger.log(`OTP email sent to ${to}`);
  }

  async sendLeadNotification(lead) {
    const html = this.buildLeadNotificationTemplate(lead);
    await this.send({
      to: this.adminEmail,
      subject: `New Lead: ${lead.name}`,
      html,
    });
    this.logger.log(`Lead notification sent for lead ID: ${lead.id}`);
  }

  /**
   * Builds HTML email template for lead notification.
   * You can replace this with a templating engine (Handlebars, etc.).
   *
   * @param {Object} lead
   * @returns {string} HTML string
   */
  buildLeadNotificationTemplate(lead) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          h2 { color: #2c3e50; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
          th { background-color: #f8f9fa; }
          .file-link { color: #3498db; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Lead Received</h2>
          <table>
            <tr><th>Field</th><th>Details</th></tr>
            <tr><td><strong>Name</strong></td><td>${this.escapeHtml(lead.name)}</td></tr>
            <tr><td><strong>Phone</strong></td><td>${this.escapeHtml(lead.phone)}</td></tr>
            <tr><td><strong>Email</strong></td><td>${lead.email ? this.escapeHtml(lead.email) : 'N/A'}</td></tr>
            <tr><td><strong>Message</strong></td><td>${lead.message ? this.escapeHtml(lead.message) : 'N/A'}</td></tr>
            ${lead.file_url ? `<tr><td><strong>Attachment</strong></td><td><a href="${lead.file_url}" class="file-link">View File</a></td></tr>` : ''}
          </table>
          <p style="color: #888; font-size: 12px;">This is an automated notification from your Lead Management System.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Basic HTML escaping to prevent XSS in emails.
   * @param {string} unsafe
   * @returns {string}
   */
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}