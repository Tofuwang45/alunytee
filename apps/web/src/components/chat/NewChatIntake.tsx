"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import RepoIngestForm from "@/components/RepoIngestForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { goalToFirstQuestion } from "@/lib/ai/depth";
import { fetchJson } from "@/lib/utils/fetch-json";
import { cn } from "@/lib/utils/cn";

type RepoOption = { id: string; name: string; url: string };

const ROLES = [
  { id: "developer", label: "Developer" },
  { id: "product", label: "Product / PM" },
  { id: "designer", label: "Designer" },
  { id: "non_technical", label: "Non-technical" },
  { id: "other", label: "Other" },
] as const;

const EXPERIENCE = [
  { id: "new", label: "New to this repo" },
  { id: "some", label: "Some familiarity" },
  { id: "experienced", label: "Experienced" },
] as const;

const GOALS = [
  { id: "understand", label: "Understand the project" },
  { id: "setup", label: "Set it up locally" },
  { id: "find", label: "Find where something happens" },
  { id: "contribute", label: "Prepare to contribute" },
  { id: "explain", label: "Explain to others" },
] as const;

export default function NewChatIntake({ repos }: { repos: RepoOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [repositoryId, setRepositoryId] = useState(repos.length === 1 ? repos[0].id : "");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [goal, setGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [showIngest, setShowIngest] = useState(repos.length === 0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resolvedGoal = customGoal.trim() || goal;

  async function finish() {
    if (!repositoryId || !role || !experience || !resolvedGoal) return;
    setError("");
    setIsLoading(true);
    try {
      const { ok, data, error } = await fetchJson<{ id?: string; error?: string }>(
        "/api/sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repositoryId, role, experience, goal: resolvedGoal }),
        },
      );
      if (!ok || !data?.id) {
        throw new Error(
          error.includes("Internal Server") || error.includes("ENOENT")
            ? "Server error — run npm run dev:clean from the repo root, then retry."
            : error || "Failed to create session.",
        );
      }
      const firstQuestion = goalToFirstQuestion(resolvedGoal);
      const chat = await fetchJson<{ error?: string }>("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.id, question: firstQuestion, mode: "lesson" }),
      });
      if (!chat.ok) {
        throw new Error(chat.error || "Failed to send the first question.");
      }
      router.push(`/c/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start chat.");
      setIsLoading(false);
    }
  }

  function OptionGrid<T extends { id: string; label: string }>({
    options,
    value,
    onChange,
  }: {
    options: readonly T[];
    value: string;
    onChange: (id: string) => void;
  }) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "glass-subtle rounded-xl border px-4 py-3 text-left text-sm transition",
              value === opt.id
                ? "glass-glow-ring border-sky-400/40 bg-white/10 text-fg"
                : "border-glass-border text-muted hover:border-glass-highlight hover:bg-white/5 hover:text-fg",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-fg">Start a conversation</h1>
        <p className="mt-2 text-sm text-muted">
          A few quick questions so we can tailor onboarding to you.
        </p>
      </div>

      {showIngest || repos.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-muted">Add a public GitHub repository to get started.</p>
            <RepoIngestForm redirectTo="/" />
            {repos.length > 0 ? (
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowIngest(false)}>
                Back to repository list
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!showIngest && repos.length > 0 ? (
        <Card>
          <CardContent className="space-y-6 pt-6">
            {step === 0 ? (
              <div>
                <h2 className="text-sm font-semibold text-fg">Which repository?</h2>
                <div className="mt-3 space-y-2">
                  {repos.map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => setRepositoryId(repo.id)}
                      className={cn(
                        "glass-subtle flex w-full flex-col rounded-xl border px-4 py-3 text-left transition",
                        repositoryId === repo.id
                          ? "glass-glow-ring border-sky-400/40 bg-white/10"
                          : "border-glass-border hover:border-glass-highlight hover:bg-white/5",
                      )}
                    >
                      <span className="text-sm font-medium text-fg">{repo.name}</span>
                      <span className="truncate text-xs text-muted">{repo.url}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => setShowIngest(true)}>
                  Add another repository
                </Button>
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <h2 className="text-sm font-semibold text-fg">Who are you?</h2>
                <div className="mt-3">
                  <OptionGrid options={ROLES} value={role} onChange={setRole} />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 className="text-sm font-semibold text-fg">How familiar are you with this codebase?</h2>
                <div className="mt-3">
                  <OptionGrid options={EXPERIENCE} value={experience} onChange={setExperience} />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-fg">What&apos;s your goal?</h2>
                <div>
                  <OptionGrid
                    options={GOALS}
                    value={goal}
                    onChange={(id) => {
                      setGoal(id);
                      setCustomGoal("");
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="custom-goal" className="block text-xs font-medium text-muted">
                    Or describe in your own words
                  </label>
                  <textarea
                    id="custom-goal"
                    value={customGoal}
                    onChange={(e) => {
                      setCustomGoal(e.target.value);
                      if (e.target.value.trim()) setGoal("");
                    }}
                    placeholder="e.g. I need to understand how authentication works before my sprint review"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-glass-border bg-white/5 px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/30"
                  />
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="ghost"
                disabled={step === 0 || isLoading}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
              {step < 3 ? (
                <Button
                  disabled={
                    (step === 0 && !repositoryId) ||
                    (step === 1 && !role) ||
                    (step === 2 && !experience)
                  }
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button disabled={!resolvedGoal || isLoading} onClick={() => void finish()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Start chat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
