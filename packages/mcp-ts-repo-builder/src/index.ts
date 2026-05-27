#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import { runAgent } from "./agent/graph";
import { createInitialState, type AgentRole } from "./agent/state";

const program = new Command();

program
  .name("mcp-ts-repo-builder")
  .description("LangGraph onboarding agent for local repository analysis")
  .requiredOption("--repo <path>", "Local repository path to analyze")
  .requiredOption("--question <text>", "Question to answer about the repository")
  .option("--role <role>", "Response style: junior, senior, or pm", "senior")
  .action(async (options: { repo: string; question: string; role: string }) => {
    const role = options.role as AgentRole;
    if (!["junior", "senior", "pm"].includes(role)) {
      throw new Error("role must be one of: junior, senior, pm");
    }

    const repoPath = path.resolve(options.repo);
    const state = createInitialState({
      question: options.question,
      role,
      repoPath,
    });

    const result = await runAgent(state);
    console.log(result.answer);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
