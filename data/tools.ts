export type ToolDefinition = {
  slug:
    | "json-formatter"
    | "password-generator"
    | "word-counter"
    | "base64"
    | "case-converter"
    | "qr-code-generator"
    | "lorem-ipsum-generator"
    | "markdown-preview"
    | "url-encoder";
  title: string;
  description: string;
};

export const tools: ToolDefinition[] = [
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Format and validate JSON instantly.",
  },
  {
    slug: "password-generator",
    title: "Password Generator",
    description: "Generate strong passwords with custom options.",
  },
  {
    slug: "word-counter",
    title: "Word Counter",
    description: "Count words, characters, and lines quickly.",
  },
  {
    slug: "base64",
    title: "Base64 Encode/Decode",
    description: "Encode text to Base64 or decode Base64 back to text.",
  },
  {
    slug: "case-converter",
    title: "Case Converter",
    description: "Convert text between upper, lower, title, and sentence case.",
  },
  {
    slug: "qr-code-generator",
    title: "QR Code Generator",
    description: "Generate downloadable QR codes from any text or URL.",
  },
  {
    slug: "lorem-ipsum-generator",
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text for prototypes and designs.",
  },
  {
    slug: "markdown-preview",
    title: "Markdown Preview",
    description: "Write and preview Markdown formatting in real time.",
  },
  {
    slug: "url-encoder",
    title: "URL Encoder/Decoder",
    description: "Encode or decode URLs and parameters safely.",
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((t) => t.slug === slug);
}

