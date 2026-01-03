import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg border border-border/70 bg-card/80 shadow-lg shadow-primary/10 backdrop-blur">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>We couldn&apos;t find that page. Check the URL or head back home.</p>
          <div className="flex gap-3">
            <Link href="/">
              <Button>Go to home</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
