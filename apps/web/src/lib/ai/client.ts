import OpenAI from "openai";
import {
  LearnerProfile,
  repoLessonSystemPrompt,
  repoLessonUserPrompt,
  repoQaSystemPrompt,
  repoQaUserPrompt,
} from "@/lib/ai/prompts";
import { DepthLevel } from "@/lib/ai/depth";
import {
  Lesson,
  StructuredAnswer,
  buildFallbackStructured,
  lessonToMarkdown,
  parseLesson,
  parseStructuredAnswer,
  structuredToMarkdown,
} from "@/lib/ai/structured";
import { buildRepoTour } from "@/lib/repo/tour";
import {
  buildAreaLesson,
  buildFollowUps,
  getConceptAreas,
  matchConceptArea,
} from "@/lib/repo/lesson";
import { RetrievedChunk } from "@/lib/retrieval/search";

export type AnswerMode = "lesson" | "answer";

export type AnswerOptions = {
  repositoryId?: string;
  profile?: LearnerProfile;
  focusTopic?: string;
  history?: string;
};

export type RepoAnswer = {
  answer: string;
  structured: StructuredAnswer | null;
  lesson: Lesson | null;
  references: {
    filePath: string;
    startLine: number | null;
    endLine: number | null;
    score: number;
  }[];
  usedModel: string;
  mode: AnswerMode;
  followUps: string[];
};

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildReferences(chunks: RetrievedChunk[]) {
  const seen = new Set<string>();
  return chunks
    .map((chunk) => ({
      filePath: chunk.filePath,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      score: chunk.score,
    }))
    .sort((a, b) => b.score - a.score)
    .filter((ref) => {
      const key = `${ref.filePath}:${ref.startLine ?? ""}:${ref.endLine ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

async function followUpsFor(
  repositoryId: string | undefined,
  currentAreaId?: string,
): Promise<string[]> {
  if (!repositoryId) return [];
  try {
    const areas = await getConceptAreas(repositoryId);
    return buildFollowUps(areas, currentAreaId);
  } catch {
    return [];
  }
}

function tourToLesson(
  question: string,
  chunks: RetrievedChunk[],
  tourTitle: string,
  tourIntro: string,
  tourSteps: { id: string; title: string; body: string; files: string[] }[],
): Lesson {
  return {
    title: tourTitle,
    intro: `${tourIntro} Add OPENAI_API_KEY for richer, tailored explanations.`,
    steps: tourSteps.map((step) => {
      const filePath = step.files[0] ?? null;
      const chunk = filePath ? chunks.find((c) => c.filePath === filePath) : undefined;
      const codeLines = chunk?.content.split(/\r?\n/).slice(0, 12).join("\n") ?? "";
      return {
        id: step.id,
        title: step.title,
        explanation: step.body,
        filePath,
        startLine: chunk?.startLine ?? null,
        endLine: chunk?.endLine ?? null,
        snippet:
          chunk && codeLines
            ? {
                language: filePath?.split(".").pop() ?? "text",
                filePath,
                startLine: chunk.startLine,
                endLine: chunk.endLine,
                code: codeLines,
              }
            : null,
        checkpoint: "Does this make sense? Ask me anything, or tell me where to go next.",
      };
    }),
  };
}

async function fallbackLesson(
  question: string,
  chunks: RetrievedChunk[],
  repositoryId: string,
  depth: DepthLevel,
  focusTopic?: string,
): Promise<RepoAnswer> {
  const references = buildReferences(chunks);

  // 1) If the learner asked about a specific area, build a focused walkthrough into it.
  try {
    const areas = await getConceptAreas(repositoryId);
    const area = matchConceptArea(focusTopic || question, areas);
    if (area) {
      const lesson = await buildAreaLesson(repositoryId, area);
      return {
        usedModel: "local-area-walkthrough",
        references,
        structured: null,
        lesson,
        answer: lessonToMarkdown(lesson),
        mode: "lesson",
        followUps: buildFollowUps(areas, area.id),
      };
    }
  } catch {
    // fall through to overview tour
  }

  // 2) Otherwise, an overview tour of the whole repo.
  try {
    const tour = await buildRepoTour(repositoryId, depth);
    const lesson = tourToLesson(question, chunks, tour.title, tour.intro, tour.steps);
    return {
      usedModel: "local-tour-fallback",
      references,
      structured: null,
      lesson,
      answer: lessonToMarkdown(lesson),
      mode: "lesson",
      followUps: await followUpsFor(repositoryId),
    };
  } catch {
    const lesson: Lesson = {
      title: "Repository walkthrough",
      intro: `Let's explore what we know about "${question.slice(0, 80)}". Add OPENAI_API_KEY for a tailored lesson.`,
      steps: references.slice(0, 5).map((ref, i) => {
        const chunk = chunks.find((c) => c.filePath === ref.filePath);
        const codeLines = chunk?.content.split(/\r?\n/).slice(0, 12).join("\n") ?? "";
        return {
          id: `step-${i + 1}`,
          title: `Explore ${ref.filePath.split("/").pop() ?? ref.filePath}`,
          explanation: `This file is relevant to your question. Open it in the Sources panel and skim the highlighted section.`,
          filePath: ref.filePath,
          startLine: ref.startLine,
          endLine: ref.endLine,
          snippet: codeLines
            ? {
                language: ref.filePath.split(".").pop() ?? "text",
                filePath: ref.filePath,
                startLine: ref.startLine,
                endLine: ref.endLine,
                code: codeLines,
              }
            : null,
          checkpoint: "Any questions about this file before we continue?",
        };
      }),
    };
    return {
      usedModel: "local-tour-fallback",
      references,
      structured: null,
      lesson,
      answer: lessonToMarkdown(lesson),
      mode: "lesson",
      followUps: await followUpsFor(repositoryId),
    };
  }
}

async function fallbackAnswer(
  question: string,
  chunks: RetrievedChunk[],
  repositoryId?: string,
): Promise<RepoAnswer> {
  const references = buildReferences(chunks);
  const structured = buildFallbackStructured(question, chunks);
  return {
    usedModel: "local-retrieval-fallback",
    references,
    structured,
    lesson: null,
    answer: structuredToMarkdown(structured),
    mode: "answer",
    followUps: await followUpsFor(repositoryId),
  };
}

async function answerWithLesson(
  client: OpenAI,
  question: string,
  chunks: RetrievedChunk[],
  depth: DepthLevel,
  opts: AnswerOptions,
): Promise<RepoAnswer> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: repoLessonSystemPrompt(depth, opts.profile, opts.focusTopic),
      },
      { role: "user", content: repoLessonUserPrompt(question, chunks, opts.history) },
    ],
  });

  const raw = completion.choices[0]?.message.content ?? "";
  let lesson: Lesson | null = null;

  if (raw) {
    try {
      lesson = parseLesson(JSON.parse(raw));
    } catch {
      lesson = null;
    }
  }

  if (!lesson) {
    lesson = {
      title: "Walkthrough",
      intro: raw.slice(0, 300) || "Here is a guided tour based on the repository context.",
      steps: [
        {
          id: "step-1",
          title: "Overview",
          explanation: raw.slice(0, 500) || "Review the sources panel for relevant files.",
          filePath: chunks[0]?.filePath ?? null,
          startLine: chunks[0]?.startLine ?? null,
          endLine: chunks[0]?.endLine ?? null,
          snippet: null,
          checkpoint: "What would you like to explore next?",
        },
      ],
    };
  }

  let currentAreaId: string | undefined;
  if (opts.repositoryId) {
    try {
      const areas = await getConceptAreas(opts.repositoryId);
      currentAreaId = matchConceptArea(opts.focusTopic || question, areas)?.id;
    } catch {
      currentAreaId = undefined;
    }
  }

  return {
    usedModel: model,
    lesson,
    structured: null,
    answer: lessonToMarkdown(lesson),
    references: buildReferences(chunks),
    mode: "lesson",
    followUps: await followUpsFor(opts.repositoryId, currentAreaId),
  };
}

async function answerWithStructured(
  client: OpenAI,
  question: string,
  chunks: RetrievedChunk[],
  depth: DepthLevel,
  opts: AnswerOptions,
): Promise<RepoAnswer> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: repoQaSystemPrompt(depth) },
      { role: "user", content: repoQaUserPrompt(question, chunks) },
    ],
  });

  const raw = completion.choices[0]?.message.content ?? "";
  let structured: StructuredAnswer | null = null;

  if (raw) {
    try {
      structured = parseStructuredAnswer(JSON.parse(raw));
    } catch {
      structured = {
        summary: raw.slice(0, 500),
        keyPoints: [],
        snippets: [],
        steps: [],
      };
    }
  }

  if (!structured) {
    structured = {
      summary: "I could not generate an answer from the retrieved repository context.",
      keyPoints: [],
      snippets: [],
      steps: [],
    };
  }

  return {
    usedModel: model,
    structured,
    lesson: null,
    answer: structuredToMarkdown(structured),
    references: buildReferences(chunks),
    mode: "answer",
    followUps: await followUpsFor(opts.repositoryId),
  };
}

export async function answerRepoQuestion(
  question: string,
  chunks: RetrievedChunk[],
  depth: DepthLevel = "developer",
  mode: AnswerMode = "answer",
  opts: AnswerOptions = {},
): Promise<RepoAnswer> {
  const client = getOpenAIClient();

  if (mode === "lesson") {
    if (!client) {
      if (!opts.repositoryId) return fallbackAnswer(question, chunks, opts.repositoryId);
      return fallbackLesson(question, chunks, opts.repositoryId, depth, opts.focusTopic);
    }
    return answerWithLesson(client, question, chunks, depth, opts);
  }

  if (!client) {
    return fallbackAnswer(question, chunks, opts.repositoryId);
  }

  return answerWithStructured(client, question, chunks, depth, opts);
}
