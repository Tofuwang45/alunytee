export type AgentRole = "junior" | "senior" | "pm";

export type AgentState = {
  question: string;
  role: AgentRole;
  repoPath: string;
  answer: string;
  fetchedCode: string[];
  navigationHistory: string[];
  compressedNotes: string;
  needsTool: boolean;
};

export function createInitialState(input: {
  question: string;
  role: AgentRole;
  repoPath: string;
}): AgentState {
  return {
    question: input.question,
    role: input.role,
    repoPath: input.repoPath,
    answer: "",
    fetchedCode: [],
    navigationHistory: [],
    compressedNotes: "",
    needsTool: true,
  };
}
