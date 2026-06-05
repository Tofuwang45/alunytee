import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ProgressPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Progress"
        subtitle="Team onboarding progress and quiz analytics — coming soon."
      />

      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="glass flex h-14 w-14 items-center justify-center rounded-2xl">
            <BarChart3 className="h-7 w-7 text-muted" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-fg">Not yet available</h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            Onboarding paths, modules, quizzes, and progress tracking are modeled in the database and
            will surface here in a future release.
          </p>
          <Link href="/" className="mt-6">
            <Button variant="outline">
              Back to dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
