import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import DiscordProvider from 'next-auth/providers/discord';
import { query } from '@/utils/db';

interface Profile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback - User:', user);
      console.log('SignIn callback - Account:', account);
      console.log('SignIn callback - Profile:', profile);
      
      if (account?.provider === "google" || account?.provider === "discord") {
        try {
          const { id, email, name, image } = user;
          await socialLoginHandler({ id, email: email!, name: name!, picture: image! }, account.provider);
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/error',
  },
});

export const GET = handler;
export const POST = handler;

async function socialLoginHandler(profile: any, provider: string) {
  console.log('socialLoginHandler - Profile:', profile);
  console.log('socialLoginHandler - Provider:', provider);
  
  try {
    const result = await query<any[]>('SELECT * FROM Users WHERE email = ?', [profile.email]);
    console.log('Database query result:', result);

    if (!Array.isArray(result)) {
      console.error('Expected an array from database query, got:', typeof result);
      throw new Error('Unexpected database query result');
    }

    const [existingUsers] = result;
    console.log('Existing users:', existingUsers);

    let user;
    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0];
      // Update user logic...
      await query(
        `UPDATE Users SET ${provider}_id = ?, name = ?, profile_picture = ?, is_verified = 1 WHERE id = ?`,
        [profile.id, profile.name, profile.picture, user.id]
      );
    } else {
      // Insert new user logic...
      const [insertResult] = await query<any>(
        `INSERT INTO Users (email, name, ${provider}_id, profile_picture, is_verified) VALUES (?, ?, ?, ?, 1)`,
        [profile.email, profile.name, profile.id, profile.picture]
      );
      user = {
        id: insertResult.insertId,
        email: profile.email,
        name: profile.name,
      };
    }

    console.log('Processed user:', user);
    return user;
  } catch (error) {
    console.error('Error in socialLoginHandler:', error);
    throw error;
  }
}