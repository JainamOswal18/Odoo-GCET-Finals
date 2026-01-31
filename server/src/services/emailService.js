import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Create transporter based on EMAIL_SERVICE env variable
            const service = process.env.EMAIL_SERVICE || 'gmail';

            if (service === 'gmail') {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });
            } else {
                // Generic SMTP configuration
                this.transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT || '587'),
                    secure: process.env.EMAIL_SECURE === 'true',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });
            }

            console.log(`✅ Email service initialized (${service})`);
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
            this.transporter = null;
        }
    }

    async sendEmail({ to, subject, html, text }) {
        if (!this.transporter) {
            throw new Error('Email service not configured');
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || `"Shiv Furniture" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }

    async sendPortalCredentials({ to, name, loginId, email, password, portalUrl }) {
        const subject = 'Your Shiv Furniture Portal Access';

        const html = this.generateCredentialsEmailHTML({ name, loginId, email, password, portalUrl });
        const text = this.generateCredentialsEmailText({ name, loginId, email, password, portalUrl });

        return this.sendEmail({ to, subject, html, text });
    }

    generateCredentialsEmailHTML({ name, loginId, email, password, portalUrl }) {
        const loginUrl = `${portalUrl}/login`;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials-box { background: white; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #667eea; }
        .credential-value { background: #f0f0f0; padding: 8px 12px; border-radius: 4px; font-family: 'Courier New', monospace; display: inline-block; margin-left: 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .instructions { background: #e8f4fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .instructions ol { margin: 10px 0; padding-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Shiv Furniture Portal</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${name}</strong>,</p>
            
            <p>Your portal access has been successfully created for <strong>Shiv Furniture</strong>. You can now access your account to view invoices, orders, and manage your business with us.</p>
            
            <div class="credentials-box">
                <h3 style="margin-top: 0; color: #667eea;">🔐 Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">Login URL:</span>
                    <span class="credential-value">${loginUrl}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Login ID:</span>
                    <span class="credential-value">${loginId}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">${email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">${password}</span>
                </div>
            </div>

            <div class="instructions">
                <h3 style="margin-top: 0; color: #2196F3;">📋 Getting Started</h3>
                <ol>
                    <li>Click the login button below or visit: <a href="${loginUrl}">${loginUrl}</a></li>
                    <li>Enter your <strong>Login ID</strong> and <strong>Password</strong></li>
                    <li>You'll be prompted to change your password on first login (recommended)</li>
                    <li>Explore your dashboard to view invoices, orders, and payments</li>
                </ol>
            </div>

            <center>
                <a href="${loginUrl}" class="button">Access Portal Now →</a>
            </center>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
                <strong>⚠️ Security Note:</strong> Please keep your credentials confidential and change your password after first login.
            </p>

            <p>If you have any questions or need assistance, please contact our support team.</p>

            <p>Best regards,<br><strong>Shiv Furniture Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated message from Shiv Furniture Management System.<br>
            Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    generateCredentialsEmailText({ name, loginId, email, password, portalUrl }) {
        const loginUrl = `${portalUrl}/login`;

        return `
Welcome to Shiv Furniture Portal
================================

Dear ${name},

Your portal access has been successfully created for Shiv Furniture.

YOUR LOGIN CREDENTIALS
----------------------
Login URL: ${loginUrl}
Login ID: ${loginId}
Email: ${email}
Password: ${password}

GETTING STARTED
--------------
1. Visit: ${loginUrl}
2. Enter your Login ID and Password
3. Change your password on first login (recommended)
4. Explore your dashboard to view invoices, orders, and payments

SECURITY NOTE: Please keep your credentials confidential and change your password after first login.

If you have any questions or need assistance, please contact our support team.

Best regards,
Shiv Furniture Team

---
This is an automated message from Shiv Furniture Management System.
Please do not reply to this email.
        `;
    }

    // Verify email configuration
    async verifyConnection() {
        if (!this.transporter) {
            return { success: false, error: 'Email service not configured' };
        }

        try {
            await this.transporter.verify();
            return { success: true, message: 'Email service is ready' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new EmailService();
