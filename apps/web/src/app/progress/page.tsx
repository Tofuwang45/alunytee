import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">Progress dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The first MVP slice focuses on repository ingestion and codebase Q&A. The Prisma schema
            already includes onboarding path, module, quiz, attempt, and progress models so this page
            can be wired up in the next slice without changing the storage foundation.
          </p>
        </section>
      </div>
    </main>
  );
}
