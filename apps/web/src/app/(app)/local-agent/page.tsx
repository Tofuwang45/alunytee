import type { ReactNode } from "react";
import { BrainCircuit, DatabaseZap, ShieldCheck, TerminalSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Local agent"
        subtitle="LangGraph CLI for secure local codebase exploration with sanitized tool output."
      />

      <Card>
        <CardContent className="pt-4">
          <Badge variant="primary">
            <TerminalSquare className="mr-1 inline h-3.5 w-3.5" />
            CLI workflow
          </Badge>
          <p className="mt-4 max-w-3xl text-sm text-muted">
            The CLI lives in{" "}
            <code className="glass-subtle rounded-lg px-1.5 py-0.5 font-mono text-xs text-sky-300">
              packages/mcp-ts-repo-builder
            </code>
            . It runs on a local repo path with role-aware answers and strips adversarial comment patterns
            before they reach agent memory.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={<BrainCircuit className="h-5 w-5 text-accent-fg" />}
          title="Role-aware answers"
          body="Choose junior, senior, or pm to change explanation depth."
        />
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5 text-[#3fb950]" />}
          title="Sanitized context"
          body="Fake system overrides in comments are removed before state updates."
        />
        <InfoCard
          icon={<DatabaseZap className="h-5 w-5 text-muted" />}
          title="Memory separation"
          body="Chat, code, navigation, and compressed notes stay in distinct graph state."
        />
      </div>

      <Card>
        <CardContent className="pt-4">
          <h2 className="text-base font-semibold text-fg">Run locally</h2>
          <pre className="glass mt-4 overflow-auto rounded-xl p-4 text-sm text-fg">
            <code>{`cd packages/mcp-ts-repo-builder
npm run build
node dist/index.js --role senior --repo . --question "Trace POST /products"`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h2 className="text-base font-semibold text-fg">Graph loop</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {graphSteps.map((step, index) => (
              <div key={`${step}-${index}`} className="flex items-center gap-2">
                <span className="glass-subtle rounded-lg px-3 py-2 font-mono text-xs text-muted">
                  {step}
                </span>
                {index < graphSteps.length - 1 ? <span className="text-muted">→</span> : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
        </div>
        <p className="mt-3 text-sm text-muted">{body}</p>
      </CardContent>
    </Card>
  );
}
