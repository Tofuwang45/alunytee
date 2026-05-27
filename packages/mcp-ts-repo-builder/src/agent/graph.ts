import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { listTypeScriptFiles, readRepoFile } from "./tools";
import type { AgentRole, AgentState } from "./state";

const GraphState = Annotation.Root({
  question: Annotation<string>,
  role: Annotation<AgentRole>,
  repoPath: Annotation<string>,
  answer: Annotation<string>,
  fetchedCode: Annotation<string[]>,
  navigationHistory: Annotation<string[]>,
  compressedNotes: Annotation<string>,
  needsTool: Annotation<boolean>,
});

function roleGuidance(role: AgentRole): string {
  switch (role) {
    case "junior":
      return "Explain with step-by-step guidance and point to concrete files.";
    case "pm":
      return "Summarize flows and risks without deep implementation detail.";
    default:
      return "Trace dependencies precisely and cite the files involved.";
  }
}

async function reasoningNode(state: typeof GraphState.State) {
  if (!state.needsTool) {
    return state;
  }

  const guidance = roleGuidance(state.role);
  const context = state.compressedNotes || "No compressed notes yet.";
  const answer = [
    `Question: ${state.question}`,
    guidance,
    `Context: ${context}`,
    state.fetchedCode.length
      ? `Reviewed ${state.fetchedCode.length} sanitized snippet(s).`
      : "No code fetched yet; tool node will gather files.",
  ].join("\n");

  return {
    ...state,
    answer,
    needsTool: state.fetchedCode.length === 0,
  };
}

async function toolNode(state: typeof GraphState.State) {
  const files = listTypeScriptFiles(state.repoPath);
  const prioritized = files.filter((file) => file.includes("product") || file.includes("auth"));
  const selected = (prioritized.length ? prioritized : files).slice(0, 3);
  const snippets = selected.map((file) => readRepoFile(state.repoPath, file));

  return {
    ...state,
    fetchedCode: [...state.fetchedCode, ...snippets],
    navigationHistory: [...state.navigationHistory, ...selected],
    needsTool: false,
  };
}

async function securityNode(state: typeof GraphState.State) {
  return {
    ...state,
    fetchedCode: state.fetchedCode.map((snippet) => snippet.replace(/\[SYSTEM OVERRIDE:[^\]]*\]/gi, "")),
  };
}

async function compressionNode(state: typeof GraphState.State) {
  const summary = state.navigationHistory.length
    ? `Visited: ${state.navigationHistory.join(", ")}`
    : "No navigation history recorded.";

  return {
    ...state,
    compressedNotes: summary,
    needsTool: false,
    answer: `${state.answer}\n\n${summary}`,
  };
}

export function buildAgentGraph() {
  const graph = new StateGraph(GraphState)
    .addNode("reasoning_node", reasoningNode)
    .addNode("tool_node", toolNode)
    .addNode("security_node", securityNode)
    .addNode("compression_node", compressionNode)
    .addEdge(START, "reasoning_node")
    .addConditionalEdges("reasoning_node", (state) => (state.needsTool ? "tool_node" : END))
    .addEdge("tool_node", "security_node")
    .addEdge("security_node", "compression_node")
    .addEdge("compression_node", "reasoning_node");

  return graph.compile();
}

export async function runAgent(input: AgentState) {
  const app = buildAgentGraph();
  const result = await app.invoke(input);
  return result as AgentState;
}
