import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import ResetPasswordEmail from "@/emails/reset-password";
import VerifyEmailEmail from "@/emails/verify-email";
import WelcomeEmail from "@/emails/welcome";

type MailArgs = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const host = process.env.MAILPIT_HOST || "127.0.0.1";
const port = Number(process.env.MAILPIT_PORT || 1025);
const from = process.env.MAIL_FROM || "BabySteps <no-reply@babysteps.test>";
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || from;

const transporter = nodemailer.createTransport({
  host,
  port,
});

export async function sendMail({ to, subject, text, html }: MailArgs) {
  if (resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend failed: ${res.status} ${body}`);
    }
    return;
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

export async function buildResetPasswordEmail(resetUrl: string) {
  const component = ResetPasswordEmail({ resetUrl });
  return {
    html: await render(component),
    text: await render(component, { plainText: true }),
    subject: "Reset your BabySteps password",
  };
}

export async function buildVerifyEmail(verifyUrl: string) {
  const component = VerifyEmailEmail({ verifyUrl });
  return {
    html: await render(component),
    text: await render(component, { plainText: true }),
    subject: "Verify your email for BabySteps",
  };
}

export async function buildWelcomeEmail(dashboardUrl?: string) {
  const component = WelcomeEmail({ dashboardUrl });
  return {
    html: await render(component),
    text: await render(component, { plainText: true }),
    subject: "Welcome to BabySteps",
  };
}
