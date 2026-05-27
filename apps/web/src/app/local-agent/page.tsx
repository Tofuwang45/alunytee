import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BrainCircuit, DatabaseZap, ShieldCheck, TerminalSquare } from "lucide-react";

const graphSteps = [
  "START",
  "reasoning_node",
  "tool_node",
  "security_node",
  "compression_node",
  "reasoning_node",
  "END",
];

export default function LocalAgentPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-800">
            <TerminalSquare className="h-3.5 w-3.5" />
            Synced local CLI workflow
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950">
            LangGraph Onboarding Agent
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            The CLI lives in <code className="font-mono">packages/mcp-ts-repo-builder</code>. It prompts for a local
            repository path and response role, then routes every fetched code snippet through a sanitizer
            before the reasoning model can use it.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<BrainCircuit className="h-5 w-5 text-cyan-700" />}
            title="Role-aware answers"
            body="Choose junior, senior, or pm to change the amount of implementation detail and prioritization in responses."
          />
          <InfoCard
            icon={<ShieldCheck className="h-5 w-5 text-emerald-700" />}
            title="Sanitized context"
            body="Patterns such as [SYSTEM OVERRIDE:], [IGNORE:], and @agent_instructions are removed before state updates."
          />
          <InfoCard
            icon={<DatabaseZap className="h-5 w-5 text-violet-700" />}
            title="Memory separation"
            body="Chat history, fetched code, navigation history, and compressed architecture notes remain distinct in graph state."
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Run locally</h2>
          <pre className="mt-4 overflow-auto rounded-md bg-slate-950 p-4 text-sm leading-6 text-slate-100">
            <code>{`cd packages/mcp-ts-repo-builder
npm run build
node dist/index.js --role senior --repo . --question "Trace POST /products"`}</code>
          </pre>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The web app documents the workflow but does not execute the local CLI directly. That keeps local
            filesystem access explicit and confined to the terminal session where the repository path is chosen.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Graph loop</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {graphSteps.map((step, index) => (
              <div key={`${step}-${index}`} className="flex items-center gap-2">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                  {step}
                </span>
                {index < graphSteps.length - 1 ? <span className="text-slate-400">-&gt;</span> : null}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            When tools are needed, the agent loops through tool execution, security filtering, and context
            compression before returning to reasoning. When no tool is needed, the final answer ends the graph.
          </p>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
