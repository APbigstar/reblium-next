import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '@/utils/db';
import transporter from '@/utils/emailTransporter';
import { User } from '@/types/type';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    const existingUsers = await query<User[]>('SELECT * FROM Users WHERE email = ? AND is_verified = ?', [email, 1]);

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    await query(
      'INSERT INTO Users (name, email, password, verification_token, is_verified, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, verificationToken, false, new Date().toISOString()]
    );

    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

    await transporter.sendMail({
      from: '"Reblium Cloud" <noreply@reblium.com>',
      to: email,
      subject: 'Verify Your Reblium Cloud Account',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email for Reblium Cloud</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <main>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://reblikabucket.s3.eu-west-2.amazonaws.com/reblium_logo_black.png" alt="Reblium Logo" style="max-width: 100px;">
                    </div>
                    <h2 style="text-align: center;">Verify your email for Reblium Cloud</h2>
                    <p>Hello ${name},</p>
                    <p>Thank you for signing up for Reblium Cloud. To complete your registration, please click the button below to verify your email address:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #00cdff; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-size: 16px;">Verify Email</a>
                    </div>
                    <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
                    <p>${verificationLink}</p>
                    <p>If you didn't create an account with Reblium Cloud, please ignore this email.</p>
                    <p>Thanks,<br>Reblium Cloud Team</p>
                </main>
                <footer style="text-align: center; margin-top: 30px; font-size: 0.9em;">
                    <p>We're here to help!</p>
                    <p>Visit our help center to learn more about our service and to leave feedback and suggestions.</p>
                </footer>
            </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ message: 'Signup successful. Please check your email for verification.' });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Error processing the request' }, { status: 500 });
  }
}