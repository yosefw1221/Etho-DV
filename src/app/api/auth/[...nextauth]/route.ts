import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { generateToken } from '@/lib/auth';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Telegram Login Widget
    {
      id: 'telegram',
      name: 'Telegram',
      type: 'oauth',
      authorization: {
        url: 'https://oauth.telegram.org/auth',
        params: {
          bot_id: process.env.TELEGRAM_BOT_ID,
          origin: process.env.NEXTAUTH_URL,
          request_access: 'write',
        },
      },
      token: {
        url: 'https://oauth.telegram.org/auth',
      },
      userinfo: {
        url:
          'https://api.telegram.org/bot' +
          process.env.TELEGRAM_BOT_TOKEN +
          '/getMe',
      },
      profile(profile: any) {
        return {
          id: profile.id.toString(),
          name: `${profile.first_name} ${profile.last_name || ''}`.trim(),
          email: profile.username
            ? `${profile.username}@telegram.user`
            : `${profile.id}@telegram.user`,
          image: profile.photo_url,
        };
      },
    },
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        // Find or create user
        let dbUser = await User.findOne({
          $or: [
            { email: user.email },
            {
              providerId: account?.providerAccountId,
              provider: account?.provider,
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
            provider: account?.provider || 'local',
            providerId: account?.providerAccountId,
            emailVerified: true,
            profilePhoto: user.image,
            role: 'user',
          });
        } else if (!dbUser.provider || dbUser.provider === 'local') {
          // Link OAuth to existing local account
          dbUser.provider = account?.provider as any;
          dbUser.providerId = account?.providerAccountId;
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
