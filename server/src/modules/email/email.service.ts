import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private adminEmail = process.env.ADMIN_EMAIL;
  private logger = new Logger('EmailService');
  private defaultFrom = 'EMV Global <noreply@easemyvacationsglobal.com>';
  private resend = new Resend(process.env.RESEND_API_KEY);

  async send({ to, subject, html, from = undefined }: { to: string; subject: string; html: string; from?: string }) {
    const { data, error } = await this.resend.emails.send({
      from: from || this.defaultFrom,
      to,
      subject,
      html,
    });
    if (error) {
      this.logger.error(`Resend error for ${to}: ${JSON.stringify(error)}`);
      throw new Error(error.message);
    }
    this.logger.log(`Email sent to ${to} — id: ${data?.id}`);
  }

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

  async sendCustomerWelcomeEmail(to: string, name: string) {
    const firstName = this.escapeHtml(name.split(' ')[0] || name);
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f7f8fa; margin: 0; padding: 0; }
          .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; }
          .header { background: linear-gradient(135deg, #E53935, #b71c1c); padding: 40px 36px; text-align: center; }
          .header h1 { color: #fff; margin: 0 0 6px; font-size: 26px; font-family: Georgia, serif; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.75); margin: 0; font-size: 14px; }
          .body { padding: 36px; }
          .greeting { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 12px; }
          p { color: #555; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
          .features { background: #f7f8fa; border-radius: 12px; padding: 20px 24px; margin: 24px 0; border: 1px solid #e5e7eb; }
          .feature { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
          .feature:last-child { margin-bottom: 0; }
          .feature-icon { font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 1px; }
          .feature-text { font-size: 13px; color: #374151; line-height: 1.5; }
          .feature-text strong { color: #111; }
          .cta { display: block; margin: 28px auto 0; background: #E53935; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; text-align: center; width: fit-content; }
          .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="header">
            <h1>Welcome to EMV Global ✈️</h1>
            <p>Your world of bespoke holidays begins here</p>
          </div>
          <div class="body">
            <p class="greeting">Hi ${firstName},</p>
            <p>
              Welcome aboard! Your <strong>EMV Global</strong> account is ready. We specialise in crafting extraordinary, personalised travel experiences — from luxury honeymoons to family adventures across the globe.
            </p>
            <div class="features">
              <div class="feature"><span class="feature-icon">🌍</span><div class="feature-text"><strong>Explore curated destinations</strong> — handpicked itineraries for every taste and budget</div></div>
              <div class="feature"><span class="feature-icon">📋</span><div class="feature-text"><strong>Track your trip quotes</strong> — request a quote and monitor it from your profile</div></div>
              <div class="feature"><span class="feature-icon">💬</span><div class="feature-text"><strong>Dedicated concierge support</strong> — our team is always a WhatsApp away</div></div>
            </div>
            <p>Ready to start planning? Browse our packages or use the Trip Planner to tell us your dream destination.</p>
            <a class="cta" href="https://easemyvacationsglobal.com/plan-trip">Plan My Trip →</a>
          </div>
          <div class="footer">
            EMV Global · Bespoke International Holidays<br>
            <a href="https://easemyvacationsglobal.com" style="color:#E53935">easemyvacationsglobal.com</a><br><br>
            You're receiving this because you created an account with us. Do not reply to this email.
          </div>
        </div>
      </body>
      </html>
    `;
    await this.send({ to, subject: 'Welcome to EMV Global — Your journey begins ✈️', html });
    this.logger.log(`Welcome email sent to ${to}`);
  }

  async sendCustomerOtpEmail(to: string, otp: string, name: string) {
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
            <p>Hi ${this.escapeHtml(name)},</p>
            <p>You requested a password reset for your EMV Global account. Use the OTP below to proceed:</p>
            <div class="otp-box"><span>${otp}</span></div>
            <p><strong>This OTP is valid for 10 minutes</strong> and can only be used once.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">EMV Global · Bespoke International Holidays · Do not reply to this email.</div>
        </div>
      </body>
      </html>
    `;
    await this.send({ to, subject: 'Your EMV Global password reset OTP', html });
  }

  async sendLeadNotification(lead) {
    const isQuizLead = lead.type === 'lead' && (lead.destination || lead.travellers || lead.travelDate);
    const subject = isQuizLead
      ? `✈️ New Trip Request: ${lead.name} → ${lead.destination || 'Any'}`
      : `New Lead: ${lead.name}`;
    const html = this.buildLeadNotificationTemplate(lead);
    await this.send({ to: this.adminEmail, subject, html });
    this.logger.log(`Lead notification sent for lead ID: ${lead.id}`);
  }

  async sendLeadConfirmation(lead) {
    if (!lead.email) return;
    const html = this.buildLeadConfirmationTemplate(lead);
    await this.send({
      to: lead.email,
      subject: '✈️ Your trip request has been received — EMV Global',
      html,
    });
    this.logger.log(`Confirmation email sent to ${lead.email} for lead ID: ${lead.id}`);
  }

  buildLeadNotificationTemplate(lead) {
    const tripRows = [
      lead.destination && `<tr><td><strong>🌍 Destination</strong></td><td>${this.escapeHtml(lead.destination)}</td></tr>`,
      lead.travelDate  && `<tr><td><strong>📅 Travel Date</strong></td><td>${this.escapeHtml(lead.travelDate)}</td></tr>`,
      lead.travellers  && `<tr><td><strong>👥 Travellers</strong></td><td>${this.escapeHtml(lead.travellers)}</td></tr>`,
    ].filter(Boolean).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f7f8fa; margin: 0; padding: 0; }
          .wrap { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
          .header { background: #E53935; padding: 28px 32px; }
          .header h1 { color: #fff; margin: 0; font-size: 20px; font-family: Georgia, serif; }
          .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px; }
          .body { padding: 28px 32px; }
          .section-label { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #9ca3af; margin: 20px 0 8px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
          td:first-child { width: 40%; color: #6b7280; }
          .badge { display: inline-block; background: #fef3f2; color: #E53935; border: 1px solid #fecaca; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 700; }
          .file-link { color: #3498db; text-decoration: none; }
          .footer { padding: 16px 32px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="header">
            <h1>New Lead Received</h1>
            <p>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' })} IST</p>
          </div>
          <div class="body">
            <p class="section-label">Contact Details</p>
            <table>
              <tr><td><strong>Name</strong></td><td>${this.escapeHtml(lead.name)}</td></tr>
              <tr><td><strong>Phone</strong></td><td>${this.escapeHtml(lead.phone)}</td></tr>
              <tr><td><strong>Email</strong></td><td>${lead.email ? this.escapeHtml(lead.email) : '—'}</td></tr>
              ${lead.city ? `<tr><td><strong>City</strong></td><td>${this.escapeHtml(lead.city)}</td></tr>` : ''}
            </table>

            ${tripRows ? `
            <p class="section-label">Trip Preferences</p>
            <table>${tripRows}</table>
            ` : ''}

            ${lead.message ? `
            <p class="section-label">Message / Budget</p>
            <p style="background:#f7f8fa;border-radius:8px;padding:12px 16px;font-size:14px;color:#374151;margin:0">${this.escapeHtml(lead.message)}</p>
            ` : ''}

            ${lead.file_url ? `
            <p class="section-label">Attachment</p>
            <p><a href="${lead.file_url}" class="file-link">View Uploaded File →</a></p>
            ` : ''}

            <p style="margin-top:24px">
              <span class="badge">Source: Trip Planner Quiz</span>
            </p>
          </div>
          <div class="footer">EMV Global · Lead Management System · Automated notification — do not reply.</div>
        </div>
      </body>
      </html>
    `;
  }

  buildLeadConfirmationTemplate(lead) {
    const tripRows = [
      lead.destination && `<tr><td>🌍 Destination</td><td><strong>${this.escapeHtml(lead.destination)}</strong></td></tr>`,
      lead.travelDate  && `<tr><td>📅 Travel Season</td><td><strong>${this.escapeHtml(lead.travelDate)}</strong></td></tr>`,
      lead.travellers  && `<tr><td>👥 Travelling As</td><td><strong>${this.escapeHtml(lead.travellers)}</strong></td></tr>`,
    ].filter(Boolean).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f7f8fa; margin: 0; padding: 0; }
          .wrap { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; }
          .header { background: linear-gradient(135deg, #E53935, #b71c1c); padding: 40px 36px; text-align: center; }
          .header h1 { color: #fff; margin: 0 0 6px; font-size: 26px; font-family: Georgia, serif; }
          .header p { color: rgba(255,255,255,0.75); margin: 0; font-size: 14px; }
          .body { padding: 36px; }
          .greeting { font-size: 18px; font-weight: 700; color: #111; margin-bottom: 10px; }
          .intro { color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 28px; }
          .card { background: #f7f8fa; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #e5e7eb; }
          .card-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #9ca3af; margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px 4px; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
          td:first-child { color: #6b7280; width: 45%; }
          .promise { color: #374151; font-size: 14px; line-height: 1.7; }
          .cta { display: block; margin: 28px auto 0; background: #E53935; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px; text-align: center; width: fit-content; }
          .footer { padding: 20px 36px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="header">
            <h1>Your Journey Awaits ✈️</h1>
            <p>We've received your trip request</p>
          </div>
          <div class="body">
            <p class="greeting">Hi ${this.escapeHtml(lead.name)},</p>
            <p class="intro">
              Thank you for planning with <strong>EMV Global</strong>. Our travel concierge has received your request and will craft a personalised itinerary tailored just for you. Expect a call or message within <strong>24 hours</strong>.
            </p>

            ${tripRows ? `
            <div class="card">
              <div class="card-title">Your Trip Profile</div>
              <table>${tripRows}</table>
            </div>
            ` : ''}

            <p class="promise">
              In the meantime, feel free to browse our <a href="https://easemyvacationsglobal.com/packages" style="color:#E53935;font-weight:700">featured packages</a> or <a href="https://easemyvacationsglobal.com/destinations" style="color:#E53935;font-weight:700">explore destinations</a> for inspiration.
            </p>

            <a class="cta" href="https://wa.me/917070595907?text=Hi%2C%20I%20just%20submitted%20a%20trip%20request%20on%20your%20website">
              💬 Chat with us on WhatsApp
            </a>
          </div>
          <div class="footer">
            EMV Global · Bespoke International Holidays<br>
            <a href="https://easemyvacationsglobal.com" style="color:#E53935">easemyvacationsglobal.com</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
