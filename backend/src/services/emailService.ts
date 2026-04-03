import nodemailer from 'nodemailer';
import logger from '../middlewares/logger';

// Create transporter lazily to ensure environment variables are loaded
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD?.replace(/\s/g, ''); // Remove all spaces from App Password

  if (!emailUser || !emailPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

// Initial verification
const initEmailService = () => {
  const mailer = getTransporter();
  if (mailer) {
    mailer.verify((error) => {
      if (error) {
        logger.error('Email service error during init:', error);
      } else {
        logger.info('Email service is ready and verified');
      }
    });
  } else {
    logger.warn('Email service: Missing credentials during init. Email sending will be skipped.');
  }
};

// Run init
initEmailService();

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  const mailer = getTransporter();
  const emailUser = process.env.EMAIL_USER;

  if (!mailer || !emailUser) {
    logger.warn(`Email simulation (missing credentials in ENV): To=${options.to}, Subject=${options.subject}`);
    return false; // Return false if credentials are missing
  }

  try {
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || `"Employee Management" <${emailUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  name: string
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7CB8E8 0%, #A8D5F2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #7CB8E8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>You requested to reset your password for your Employee Management System account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #7CB8E8;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          <p>Best regards,<br>Employee Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hi ${name},

    You requested to reset your password for your Employee Management System account.

    Click this link to reset your password: ${resetUrl}

    This link will expire in 1 hour.

    If you didn't request this, please ignore this email.

    Best regards,
    Employee Management Team
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - Employee Management System',
    html,
    text,
  });
};

/**
 * Send password reset confirmation email
 */
export const sendPasswordResetConfirmation = async (
  email: string,
  name: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7CB8E8 0%, #A8D5F2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed Successfully</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <div class="success">
            <strong>✓ Your password has been changed successfully!</strong>
          </div>
          <p>Your password was recently changed. You can now log in with your new password.</p>
          <p>If you didn't make this change, please contact your administrator immediately.</p>
          <p>Best regards,<br>Employee Management Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Changed - Employee Management System',
    html,
    text: `Hi ${name}, Your password has been changed successfully. If you didn't make this change, please contact your administrator immediately.`,
  });
};

/**
 * Send leave status email
 */
export const sendLeaveStatusEmail = async (
  email: string,
  name: string,
  status: string,
  type: string,
  startDate: Date,
  endDate: Date,
  approvedBy?: string
): Promise<boolean> => {
  const isApproved = status === 'APPROVED';
  const color = isApproved ? '#28a745' : '#dc3545';
  const title = isApproved ? 'Leave Approved' : 'Leave Rejected';
  const statusText = isApproved ? 'approved' : 'rejected';

  // Format dates
  const start = new Date(startDate).toLocaleDateString();
  const end = new Date(endDate).toLocaleDateString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${isApproved ? '#28a745' : '#dc3545'} 0%, ${isApproved ? '#5cd677' : '#ff6b7d'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 8px 15px; background: ${color}; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid ${color}; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your ${type.toLowerCase()} leave request has been <strong>${statusText}</strong>.</p>
          
          <div class="details">
            <p><strong>Leave Type:</strong> ${type}</p>
            <p><strong>Duration:</strong> ${start} to ${end}</p>
            <p><strong>Status:</strong> <span style="color: ${color}; font-weight: bold;">${status}</span></p>
          </div>
          
          <p>Please log in to your dashboard to view full details.</p>
          
          <p>Best regards,<br>Employee Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Leave Request ${status} - Employee Management System`,
    html,
    text: `Hi ${name}, Your ${type} leave request from ${start} to ${end} has been ${statusText}.`,
  });
};

/**
 * Send welcome email with credentials
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  password: string,
  employeeId: string,
  loginUrl: string = `${process.env.FRONTEND_URL}/login`
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%); color: #000; padding: 40px; text-align: center; } // FAST Group Yellow
        .content { padding: 40px; }
        .credentials-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .credential-item { margin: 10px 0; font-size: 16px; }
        .label { color: #6c757d; font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { color: #212529; font-weight: 600; font-family: monospace; font-size: 18px; margin-left: 10px; }
        .button { display: inline-block; padding: 14px 32px; background: #000; color: #FFD700; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; transition: all 0.2s; }
        .button:hover { background: #333; transform: translateY(-1px); }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; font-size: 13px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">FAST GROUP</h1>
          <div style="width: 40px; height: 3px; background: #000; margin: 15px auto;"></div>
          <h2 style="margin:0; font-size: 18px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Welcome to the Team</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account has been successfully created. Here are your login credentials to access the Employee Management Portal:</p>
          
          <div class="credentials-box">
            <div class="credential-item">
              <span class="label">Employee ID</span>
              <span class="value">${employeeId}</span>
            </div>
            <div class="credential-item">
              <span class="label">Email</span>
              <span class="value">${email}</span>
            </div>
            <div class="credential-item">
              <span class="label">Password</span>
              <span class="value">${password}</span>
            </div>
          </div>
          
          <p>Please log in and authorize yourself. We recommend changing your password after your first login for better security.</p>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to Portal</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
            Note: If you have any trouble logging in, please contact the IT support team.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Fast Group. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Fast Group - Your Login Credentials',
    html,
    text: `Hi ${name},\n\nWelcome to Fast Group! Your account has been created.\n\nLogin URL: ${loginUrl}\nEmail: ${email}\nPassword: ${password}\nEmployee ID: ${employeeId}\n\nPlease login and change your password.`,
  });
};

export default { sendEmail, sendPasswordResetEmail, sendPasswordResetConfirmation, sendLeaveStatusEmail, sendWelcomeEmail };
