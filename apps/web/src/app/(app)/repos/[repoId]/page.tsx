import { redirect } from "next/navigation";

export default async function RepoIndexPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  redirect(`/repos/${repoId}/explore`);
}
