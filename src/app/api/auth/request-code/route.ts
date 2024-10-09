import { NextRequest, NextResponse } from "next/server";
import { query } from '@/utils/db';
import transporter from '@/utils/emailTransporter';
import { User } from '@/types/type';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const users = await query<User[]>('SELECT * FROM Users WHERE email = ?', [email]);

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    const user = users[0];
    const verificationCode = Math.floor(10000 + Math.random() * 90000).toString();
    const expirationTime = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      'UPDATE Users SET verification_code = ?, verification_code_expires = ? WHERE email = ?',
      [verificationCode, expirationTime, email]
    );

    await transporter.sendMail({
      from: '"Reblium Cloud" <noreply@reblium.com>',
      to: email,
      subject: 'Your Verification Code for Reblium Cloud',
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
                    <h2 style="text-align: center;">Confirm your code for Reblium Cloud</h2>
                    <p>Hello ${user.name},</p>
                    <p>Enter the code ${verificationCode} to confirm your email.</p>
                    <p><strong>This code will expire in 15 minutes.</strong></p>
                    <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
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

    return NextResponse.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ error: 'Error sending verification code' }, { status: 500 });
  }
}