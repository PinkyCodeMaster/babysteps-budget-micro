import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema/auth";
import { nextCookies } from "better-auth/next-js";
import { buildResetPasswordEmail, buildVerifyEmail, buildWelcomeEmail, sendMail } from "@/lib/mail";
import { expo } from "@better-auth/expo";

const appUrl = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            account,
            session,
            user,
            verification
        }
    }),
    emailAndPassword: {
        autoSignIn: false,
        enabled: true,
        requireEmailVerification: true,
        onPasswordReset: async ({ user }) => {
            console.log(`Password reset for ${user.email}`);
        },
        sendResetPassword: async ({ user, url }) => {
            const email = await buildResetPasswordEmail(url);
            void sendMail({
                to: user.email,
                subject: email.subject,
                text: email.text,
                html: email.html,
            }).catch((err) => console.error("send reset email failed", err));
        },
    },
    emailVerification: {
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const email = await buildVerifyEmail(url);
            void sendMail({
                to: user.email,
                subject: email.subject,
                text: email.text,
                html: email.html,
            }).catch((err) => console.error("send verification email failed", err));
        },
        afterEmailVerification: async (user) => {
            const email = await buildWelcomeEmail(`${appUrl}/onboarding`);
            void sendMail({
                to: user.email,
                subject: email.subject,
                text: email.text,
                html: email.html,
            }).catch((err) => console.error("send welcome email failed", err));
        },
    },
    plugins: [
        expo(),
        nextCookies()
    ],
    trustedOrigins: ['http//localhost:3000', "http://192.168.0.27:3000", "native://"]
});

export type Session = typeof auth.$Infer.Session
