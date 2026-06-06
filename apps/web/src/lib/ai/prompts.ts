import { RetrievedChunk } from "@/lib/retrieval/search";
import { DepthLevel, depthGuidance } from "@/lib/ai/depth";

export function formatContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => {
      const lines =
        chunk.startLine && chunk.endLine ? `:${chunk.startLine}-${chunk.endLine}` : "";
      return `Context ${index + 1}: ${chunk.filePath}${lines}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

export function repoQaSystemPrompt(depth: DepthLevel = "developer") {
  return [
    "You are an enterprise developer onboarding assistant.",
    "Answer using only the provided repository context.",
    "Be concise: no filler, no restating the question, no long introductions.",
    depthGuidance(depth),
    "If context is insufficient, say what is missing instead of guessing.",
    "Respond with a single JSON object (no markdown outside JSON) matching this schema:",
    JSON.stringify({
      summary: "One sentence direct answer.",
      keyPoints: ["Up to 4 short bullets with the most important facts."],
      snippets: [
        {
          language: "typescript",
          filePath: "src/example.ts",
          startLine: 10,
          endLine: 25,
          code: "// only include when code helps; keep snippets short",
        },
      ],
      steps: ["Only for how-to/setup questions; otherwise empty array."],
    }),
    "Rules: keyPoints max 4 items; snippets max 2 and only when code is genuinely needed; steps max 6 and only for procedural questions; omit empty arrays where possible.",
  ].join(" ");
}

export function repoQaUserPrompt(question: string, chunks: RetrievedChunk[]) {
  return `Repository context:\n${formatContext(chunks)}\n\nQuestion: ${question}`;
}

export type LearnerProfile = {
  role?: string | null;
  experience?: string | null;
  goal?: string | null;
};

function profileGuidance(profile?: LearnerProfile): string {
  if (!profile) return "";
  const bits: string[] = [];
  if (profile.role) bits.push(`their role is "${profile.role}"`);
  if (profile.experience) bits.push(`their experience with this repo is "${profile.experience}"`);
  if (profile.goal) bits.push(`their stated goal is "${profile.goal}"`);
  if (!bits.length) return "";
  return `Tailor the walkthrough to this specific learner: ${bits.join(", ")}. Adjust depth, pace, and examples to fit them.`;
}

export function repoLessonSystemPrompt(
  depth: DepthLevel = "developer",
  profile?: LearnerProfile,
  focusTopic?: string,
) {
  return [
    "You are a patient, hands-on personal coding tutor guiding a developer through a codebase.",
    "You adapt to the learner like a 1:1 mentor: never give a single fixed lecture — respond to what THEY asked.",
    "Using only the provided repository context, create an interactive walkthrough lesson.",
    depthGuidance(depth),
    profileGuidance(profile),
    focusTopic
      ? `The learner specifically asked to focus on: "${focusTopic}". Build the lesson around the files relevant to that, and name the actual files involved.`
      : "",
    "Each step teaches ONE concept. Write explanations in a warm, conversational teacher voice.",
    "Every step must reference a real file from the context when possible, and tell the learner which files are associated with the topic.",
    "End each step with a short, specific check-in question (checkpoint) that invites the learner to go deeper, branch to a related area, or ask something — like a real tutor would.",
    "Respond with a single JSON object (no markdown outside JSON) matching this schema:",
    JSON.stringify({
      title: "Short lesson title",
      intro: "1-2 sentence welcome; set expectations for the walkthrough.",
      steps: [
        {
          id: "step-1",
          title: "What this project does",
          explanation: "2-4 sentences teaching this concept. Use analogies for plain depth.",
          filePath: "src/example.ts",
          startLine: 1,
          endLine: 20,
          snippet: {
            language: "typescript",
            filePath: "src/example.ts",
            startLine: 1,
            endLine: 20,
            code: "// short excerpt only when it helps",
          },
          checkpoint: "Does this overview make sense before we look at the folder structure?",
        },
      ],
    }),
    "Rules: 4-7 steps; one concept per step; explanations 2-5 sentences; snippet optional and max 15 lines; checkpoint required on every step; filePath must come from provided context.",
  ].join(" ");
}

export function repoLessonUserPrompt(
  question: string,
  chunks: RetrievedChunk[],
  history?: string,
) {
  const historyBlock = history ? `\n\nRecent conversation (for continuity):\n${history}` : "";
  return `Repository context:\n${formatContext(chunks)}${historyBlock}\n\nLearner just asked: ${question}\n\nCreate a guided walkthrough lesson that directly responds to what they asked, step by step.`;
}
