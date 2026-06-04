export type DepthLevel = "plain" | "product" | "developer" | "deep";

export const DEPTH_LEVELS: { id: DepthLevel; label: string; hint: string }[] = [
  { id: "plain", label: "Plain English", hint: "No jargon, for anyone" },
  { id: "product", label: "Product / PM", hint: "Features and flows" },
  { id: "developer", label: "Developer", hint: "Implementation detail" },
  { id: "deep", label: "Deep technical", hint: "Architecture and trade-offs" },
];

export function isDepthLevel(value: unknown): value is DepthLevel {
  return value === "plain" || value === "product" || value === "developer" || value === "deep";
}

export function depthGuidance(depth: DepthLevel): string {
  switch (depth) {
    case "plain":
      return "Audience: a non-technical person. Avoid jargon and code unless asked. Use everyday analogies, short sentences, and explain what the project does in human terms. Do not show code blocks unless explicitly requested.";
    case "product":
      return "Audience: a product manager. Focus on features, user flows, capabilities, and limitations. Mention technical concepts only at a high level. Keep code minimal.";
    case "deep":
      return "Audience: a senior engineer. Go deep on architecture, data flow, design trade-offs, edge cases, and performance. Include precise file and symbol references and code where useful.";
    case "developer":
    default:
      return "Audience: a working developer. Give practical implementation detail, key files, and short code snippets where helpful.";
  }
}
