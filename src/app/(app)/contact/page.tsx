import { sendMail } from "@/lib/mail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Contact Us | BabySteps",
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
    to: process.env.CONTACT_TO || "support@babysteps.test",
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
            Support that replies
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tell us what you need</h1>
          <p className="text-muted-foreground">
            Questions, feedback, or ideas? Send us a note and we will reply soon.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr,1fr] lg:items-start">
          <Card className="border border-border/60 bg-card/80 shadow-sm shadow-primary/10 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Prefer a quick note?</CardTitle>
              <p className="text-sm text-muted-foreground">
                Email us anytime at <span className="font-medium text-foreground">support@babysteps.test</span>.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">We read every message</span>
              </div>
              <p className="pl-6">Product, billing, or accessibility questions all go to the same inbox.</p>
              <div className="flex items-center gap-2 text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Human replies</span>
              </div>
              <p className="pl-6">You will hear from us within one business day.</p>
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-medium">Keep it simple</span>
              </div>
              <p className="pl-6">Share your context and what you are trying to accomplish. We will take it from there.</p>
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
