import { sendMail } from "@/lib/mail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock3, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Support | BabySteps",
};

async function submitContact(formData: FormData) {
  "use server";

  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const message = (formData.get("message") as string) || "";

  if (!name || !email || !message) {
    return;
  }

  const body = `From: ${name} <${email}>\n\n${message}`;

  await sendMail({
    to: process.env.CONTACT_TO || "support@babysteps.app",
    subject: "New BabySteps contact form message",
    text: body,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
  });

  revalidatePath("/contact");
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 space-y-3">
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
            Production support, not just a contact form
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Talk to a person who can help</h1>
          <p className="text-muted-foreground">
            Ask about the product, billing, or data requests. We reply quickly and never ask for bank logins.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr,1fr] lg:items-start">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Prefer a quick note?</CardTitle>
              <p className="text-sm text-muted-foreground">
                Email us anytime at <span className="font-medium text-foreground">support@babysteps.app</span>. We use
                Mailpit in development and Resend in production so messages land.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                <span className="font-medium">Response time</span>
              </div>
              <p className="pl-6">We aim to reply within one business day, sooner if something is blocking you.</p>
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">Security first</span>
              </div>
              <p className="pl-6">
                Never send bank logins or card details. We handle data changes and deletions via your account email.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Useful context</span>
              </div>
              <p className="pl-6">
                Tell us what you are trying to do, where you are stuck, and any error text. Screenshots are welcome.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">Data rights</span>
              </div>
              <p className="pl-6">Request exports or deletion of your account and we will confirm by email.</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/80 shadow-lg shadow-primary/10 backdrop-blur">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={submitContact} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="name">
                    Name
                  </label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="email">
                    Email
                  </label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="message">
                    Message
                  </label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>
                <Button type="submit" className="w-full">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
