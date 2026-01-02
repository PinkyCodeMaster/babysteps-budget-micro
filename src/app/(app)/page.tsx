import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            BabySteps – Budget Micro
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A simple, focused way to track your debts, payments,
            and progress using the debt snowball method.
          </p>

          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Add and manage your debts</li>
            <li>Record payments safely</li>
            <li>See your progress clearly</li>
          </ul>

          <div className="pt-4">
            <Link href="/dashboard">
              <Button size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
