import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Debt = {
    id: number;
    name: string;
    remainingBalance: number;
};

export default async function DashboardPage() {

    const res = await fetch("http://localhost:3000/api/debts", {
        cache: "no-store",
    });

    const data = await res.json();

    const { summary, debts } = data;

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Debt</CardTitle>
                    </CardHeader>
                    <CardContent>£{summary.totalDebt}</CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Paid</CardTitle>
                    </CardHeader>
                    <CardContent>£{summary.totalPaid}</CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Progress</CardTitle>
                    </CardHeader>
                    <CardContent>{summary.progressPercent}%</CardContent>
                </Card>
            </div>

            {/* Debt List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Debts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {debts.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                            No debts yet. Add one to get started.
                        </p>
                    )}

                    {debts.map((debt: Debt) => (
                        <div
                            key={debt.id}
                            className="flex justify-between border-b py-2 text-sm"
                        >
                            <span>{debt.name}</span>
                            <span>£{debt.remainingBalance}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </main>
    );
}
