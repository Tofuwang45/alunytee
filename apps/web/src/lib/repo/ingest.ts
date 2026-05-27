import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { chunkFile } from "@/lib/repo/chunk";
import { containsSecrets, languageFromPath, shouldIndexPath } from "@/lib/repo/filters";
import { fetchGitHubFile, fetchGitHubRepository, fetchGitHubTree, parseGitHubUrl } from "@/lib/repo/github";

export type IngestResult = {
  repositoryId: string;
  fileCount: number;
  chunkCount: number;
  skippedCount: number;
};

export async function ingestGitHubRepository(url: string): Promise<IngestResult> {
  const parsed = parseGitHubUrl(url);
  const remote = await fetchGitHubRepository(url);
  const tree = await fetchGitHubTree(parsed.owner, parsed.repo, remote.defaultBranch);
  const candidates = tree.filter((item) => shouldIndexPath(item.path, item.size ?? 0));

  const repository = await prisma.repository.upsert({
    where: { url: remote.url },
    update: {
      name: remote.name,
      owner: remote.owner,
      defaultBranch: remote.defaultBranch,
      indexedAt: null,
    },
    create: {
      name: remote.name,
      owner: remote.owner,
      url: remote.url,
      defaultBranch: remote.defaultBranch,
    },
  });

  await prisma.repoChunk.deleteMany({ where: { repositoryId: repository.id } });
  await prisma.repoFile.deleteMany({ where: { repositoryId: repository.id } });

  let fileCount = 0;
  let chunkCount = 0;
  let skippedCount = tree.length - candidates.length;

  for (const file of candidates.slice(0, Number(process.env.MAX_INGEST_FILES ?? 250))) {
    try {
      const content = await fetchGitHubFile(parsed.owner, parsed.repo, remote.defaultBranch, file.path);

      if (containsSecrets(content)) {
        skippedCount += 1;
        console.warn(`Skipped ${file.path}: possible secret detected`);
        continue;
      }

      const contentHash = crypto.createHash("sha256").update(content).digest("hex");
      await prisma.repoFile.create({
        data: {
          repositoryId: repository.id,
          path: file.path,
          language: languageFromPath(file.path),
          contentHash,
          content,
        },
      });

      const chunks = chunkFile(file.path, content);
      if (chunks.length > 0) {
        await prisma.repoChunk.createMany({
          data: chunks.map((chunk) => ({
            repositoryId: repository.id,
            filePath: chunk.filePath,
            content: chunk.content,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            metadata: { language: languageFromPath(file.path) },
          })),
        });
      }

      fileCount += 1;
      chunkCount += chunks.length;
    } catch (error) {
      skippedCount += 1;
      console.warn(`Skipped ${file.path}:`, error);
    }
  }

  await prisma.repository.update({
    where: { id: repository.id },
    data: { indexedAt: new Date() },
  });

  return { repositoryId: repository.id, fileCount, chunkCount, skippedCount };
}
