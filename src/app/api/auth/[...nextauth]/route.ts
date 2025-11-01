import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { generateToken } from '@/lib/auth';
import { verifyTelegramAuth, extractTelegramUser, TelegramAuthData } from '@/lib/telegramAuth';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Telegram Login Widget using Credentials Provider
    CredentialsProvider({
      id: 'telegram',
      name: 'Telegram',
      credentials: {
        id: { label: 'ID', type: 'text' },
        first_name: { label: 'First Name', type: 'text' },
        last_name: { label: 'Last Name', type: 'text' },
        username: { label: 'Username', type: 'text' },
        photo_url: { label: 'Photo URL', type: 'text' },
        auth_date: { label: 'Auth Date', type: 'text' },
        hash: { label: 'Hash', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          console.error('TELEGRAM_BOT_TOKEN not configured');
          return null;
        }

        // Construct auth data from credentials
        const authData: TelegramAuthData = {
          id: parseInt(credentials.id),
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          username: credentials.username,
          photo_url: credentials.photo_url,
          auth_date: parseInt(credentials.auth_date),
          hash: credentials.hash,
        };

        // Verify the Telegram data
        if (!verifyTelegramAuth(authData, botToken)) {
          console.error('Telegram auth verification failed');
          return null;
        }

        // Extract user info
        const telegramUser = extractTelegramUser(authData);

        // Return user object for NextAuth
        return {
          id: telegramUser.id,
          name: `${telegramUser.firstName} ${telegramUser.lastName}`.trim(),
          email: telegramUser.email,
          image: telegramUser.profilePhoto,
          // Store additional data for the signIn callback
          telegramId: telegramUser.id,
          username: telegramUser.username,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        // Determine provider and provider ID
        let provider: string;
        let providerId: string | undefined;

        if (account?.provider === 'telegram') {
          // For Telegram credentials provider
          provider = 'telegram';
          providerId = (user as any).telegramId || user.id;
        } else if (account?.provider) {
          // For OAuth providers (Google, etc.)
          provider = account.provider;
          providerId = account.providerAccountId;
        } else {
          // Fallback
          provider = 'local';
          providerId = undefined;
        }

        // Find or create user
        let dbUser = await User.findOne({
          $or: [
            { email: user.email },
            {
              providerId: providerId,
              provider: provider,
            },
          ],
        });

        if (!dbUser) {
          // Create new user
          const names = (user.name || '').split(' ');
          const firstName = names[0] || 'User';
          const lastName = names.slice(1).join(' ') || 'User';

          dbUser = await User.create({
            email: user.email,
            firstName,
            lastName,
            provider: provider,
            providerId: providerId,
            emailVerified: true,
            profilePhoto: user.image,
            role: 'user',
          });
        } else if (!dbUser.provider || dbUser.provider === 'local') {
          // Link OAuth to existing local account
          dbUser.provider = provider as any;
          dbUser.providerId = providerId;
          dbUser.emailVerified = true;
          if (user.image && !dbUser.profilePhoto) {
            dbUser.profilePhoto = user.image;
          }
          await dbUser.save();
        }

        // Store user ID in the session
        user.id = dbUser._id.toString();

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;

        // Fetch role from database

        const dbUser = await User.findById(user.id);
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).email = token.email as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/en/login',
    error: '/en/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
