"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

type DuplicateRow = {
  line: number;
  name: string;
  balance: number;
  interestRate: number | null;
  minimumPayment: number | null;
  dueDay: number | null;
  type: string;
  reason: string;
};

export function DebtCsvImport() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [failures, setFailures] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatMaybeCurrency = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "—";
    return formatCurrency(value);
  };

  const rateLabel = (value: number | null) => {
    if (value === null || Number.isNaN(value)) return "—";
    return `${value}%`;
  };

  const runImport = async (skipDuplicates = false) => {
    setError(null);
    setMessage(null);

    const file = selectedFile || fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    setLoading(true);

    const res = await fetch(`/api/debts/import${skipDuplicates ? "?skipDuplicates=1" : ""}`, {
      method: "POST",
      body: data,
    });

    const body = await res.json().catch(() => ({}));

    if (res.status === 409) {
      setDuplicates(body.duplicates || []);
      setFailures(body.failures || []);
      setError(body.error || "We found possible duplicates. Review them below.");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setError(body.error || "Import failed. Check the file and try again.");
      setFailures(body.failures || []);
      setLoading(false);
      return;
    }

    const skipped = body.skippedDuplicates?.length
      ? ` (${body.skippedDuplicates.length} duplicate row(s) skipped)`
      : "";
    const extraFailures = body.failures?.length ? ` (${body.failures.length} row(s) skipped)` : "";
    setMessage(`Imported ${body.imported} debt(s)${skipped}${extraFailures}.`);
    setDuplicates([]);
    setSelectedFile(null);
    setFailures([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2 rounded-lg border border-border/70 bg-card/70 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">Import debts from CSV</p>
          <p className="text-xs text-muted-foreground">
            Use the template, then upload to add debts in bulk. We flag exact matches before importing.
          </p>
        </div>
        <a
          className="text-xs font-semibold text-primary underline underline-offset-4"
          href="/debts-template.csv"
          download
        >
          Download template
        </a>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          runImport(false);
        }}
      >
        <Input
          ref={fileInputRef}
          name="file"
          type="file"
          accept=".csv,text/csv"
          disabled={loading}
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] ?? null);
            setDuplicates([]);
            setError(null);
            setMessage(null);
            setFailures([]);
          }}
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Importing..." : "Upload CSV"}
        </Button>
      </form>
      {message && <p className="text-xs text-green-600">{message}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {duplicates.length > 0 && (
        <div className="space-y-2 rounded-md border border-amber-300/80 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">Possible duplicates found</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-100">
              Matches on name, balance, interest rate, monthly payment, and due day. Rename if it is a different
              debt, or import while skipping these rows.
            </p>
          </div>
          <div className="space-y-1.5">
            {duplicates.map((dup) => (
              <div
                key={`${dup.line}-${dup.name}-${dup.balance}`}
                className="flex flex-col gap-1 rounded border border-amber-200/80 bg-amber-100/60 px-2 py-1.5 text-[11px] dark:border-amber-900/60 dark:bg-amber-900/40"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{dup.name}</span>
                  <span className="text-amber-700 dark:text-amber-100">Line {dup.line}</span>
                  <span className="rounded bg-amber-200/70 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900 dark:text-amber-50">
                    {dup.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-amber-800 dark:text-amber-50">
                  <span>Balance {formatCurrency(dup.balance)}</span>
                  <span>Rate {rateLabel(dup.interestRate)}</span>
                  <span>Minimum {formatMaybeCurrency(dup.minimumPayment)}</span>
                  <span>Due day {dup.dueDay ?? "—"}</span>
                </div>
                <span className="text-amber-700 dark:text-amber-100">{dup.reason}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => runImport(true)}
              disabled={loading || !selectedFile}
            >
              {loading ? "Importing..." : "Import without duplicates"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setDuplicates([]);
                setError(null);
                setMessage(null);
              }}
            >
              Pick a different file
            </Button>
          </div>
        </div>
      )}

      {failures.length > 0 && (
        <div className="space-y-1 rounded-md border border-red-200/80 bg-red-50/60 p-3 text-xs text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-50">
          <p className="text-sm font-semibold">Rows to fix</p>
          <ul className="list-disc space-y-1 pl-4">
            {failures.map((fail, idx) => (
              <li key={`${fail}-${idx}`}>{fail}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Export your current debts anytime from{" "}
        <a href="/api/debts/export" className="text-primary underline">
          this link
        </a>
        .
      </p>
    </div>
  );
}
