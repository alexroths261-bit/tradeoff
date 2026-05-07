import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { sql } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const users = await sql`
          SELECT id, email, password_hash, name, role, rating, total_reviews
          FROM users WHERE email = ${credentials.email}
        `;

        if (users.length === 0) return null;

        const user = users[0];
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          rating: Number(user.rating),
          totalReviews: user.total_reviews,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.rating = (user as any).rating;
        token.totalReviews = (user as any).totalReviews;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).rating = token.rating;
        (session.user as any).totalReviews = token.totalReviews;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
