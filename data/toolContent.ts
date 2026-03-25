export type ToolSlug =
  | "json-formatter"
  | "password-generator"
  | "word-counter"
  | "base64"
  | "case-converter"
  | "qr-code-generator"
  | "lorem-ipsum-generator"
  | "markdown-preview"
  | "url-encoder";

export type ToolFaq = { q: string; a: string };

export type ToolContent = {
  what: string;
  howTo: string[];
  example: { inputLabel: string; input: string; outputLabel: string; output: string };
  benefits: string[];
  faq: ToolFaq[];
};

export const toolContent: Record<ToolSlug, ToolContent> = {
  "json-formatter": {
    what:
      "A JSON Formatter helps you quickly validate and pretty‑print JSON so it’s easy to read, debug, and share.",
    howTo: [
      "Paste your JSON into the input box.",
      "Choose indentation (2 or 4 spaces).",
      "Review the formatted output (or fix the error message if invalid).",
      "Copy or download the formatted JSON.",
    ],
    example: {
      inputLabel: "Example input",
      input: '{"name":"Ava","active":true,"roles":["admin","editor"],"count":2}',
      outputLabel: "Example output",
      output:
        '{\n  "name": "Ava",\n  "active": true,\n  "roles": [\n    "admin",\n    "editor"\n  ],\n  "count": 2\n}',
    },
    benefits: [
      "Catch invalid JSON instantly.",
      "Readable formatting for debugging and reviews.",
      "Copy/download results in one click.",
      "Runs in-browser for fast feedback.",
    ],
    faq: [
      {
        q: "Does this tool validate JSON?",
        a: "Yes. If your JSON is invalid, you’ll see an error instead of formatted output.",
      },
      {
        q: "Will it change my data?",
        a: "Formatting only changes whitespace (indentation/newlines), not the underlying values.",
      },
      {
        q: "Is my JSON uploaded anywhere?",
        a: "No—formatting happens in your browser.",
      },
      {
        q: "Why do I see an error even though it looks valid?",
        a: "Common causes include trailing commas, unquoted keys, or using single quotes.",
      },
    ],
  },

  "password-generator": {
    what:
      "A Password Generator creates strong, random passwords to help protect accounts from guessing and brute-force attacks.",
    howTo: [
      "Pick a length (recommended: 12–20).",
      "Enable the character sets you want (upper/lower/numbers/symbols).",
      "Tap Regenerate until you like the result.",
      "Copy or download the password.",
    ],
    example: {
      inputLabel: "Example settings",
      input: "Length: 16\nUppercase: on\nLowercase: on\nNumbers: on\nSymbols: off",
      outputLabel: "Example output",
      output: "tG7mQ1pV3nZ8cL2a",
    },
    benefits: [
      "Stronger than human-made passwords.",
      "Customizable to match site requirements.",
      "One-click copy and download.",
      "Generated locally in your browser.",
    ],
    faq: [
      {
        q: "What length should I use?",
        a: "For most logins, 12–20 characters is a good balance. Longer is generally better.",
      },
      {
        q: "Do symbols always make it stronger?",
        a: "Often yes, but length is usually the biggest factor. Use symbols if the site allows them.",
      },
      {
        q: "Is it safe to copy passwords to clipboard?",
        a: "It’s generally fine for personal use, but avoid copying on shared/public devices.",
      },
      {
        q: "Is the password stored anywhere?",
        a: "No. It’s generated and displayed locally in your browser.",
      },
    ],
  },

  "word-counter": {
    what:
      "A Word Counter instantly measures words, characters, and lines—useful for writing limits, SEO drafts, and captions.",
    howTo: [
      "Paste or type your text into the input area.",
      "See live counts for words, characters, no-spaces, and lines.",
      "Copy or download the stats if you need to share them.",
    ],
    example: {
      inputLabel: "Example input",
      input: "Hello world!\nThis is a short example.",
      outputLabel: "Example output",
      output: "{\n  \"words\": 7,\n  \"characters\": 36,\n  \"charactersNoSpaces\": 30,\n  \"lines\": 2\n}",
    },
    benefits: [
      "Instant feedback while writing.",
      "Counts multiple metrics at once.",
      "Great on mobile for quick checks.",
      "Export stats with one click.",
    ],
    faq: [
      {
        q: "How are words counted?",
        a: "Words are counted by splitting on whitespace and ignoring extra spaces.",
      },
      {
        q: "Do emojis count as characters?",
        a: "They usually count as characters, but some emojis may count as multiple code units depending on platform.",
      },
      {
        q: "What does “No spaces” mean?",
        a: "It’s the character count with all whitespace removed.",
      },
    ],
  },

  base64: {
    what:
      "Base64 is a way to encode text into ASCII characters, commonly used to safely move data through systems that expect plain text.",
    howTo: [
      "Choose Encode to convert text → Base64, or Decode for Base64 → text.",
      "Paste your input.",
      "Copy the result when ready.",
    ],
    example: {
      inputLabel: "Example input",
      input: "hello",
      outputLabel: "Example output",
      output: "aGVsbG8=",
    },
    benefits: [
      "Great for APIs, headers, and quick testing.",
      "Encode/decode instantly in-browser.",
      "Helpful errors when input is invalid.",
    ],
    faq: [
      {
        q: "Is Base64 encryption?",
        a: "No. It’s an encoding, not a security mechanism—anyone can decode it.",
      },
      {
        q: "Why does decoding fail?",
        a: "The input may contain invalid characters, missing padding, or not be Base64 at all.",
      },
      {
        q: "Can I encode non-English text?",
        a: "Yes—this tool encodes Unicode text safely.",
      },
    ],
  },

  "case-converter": {
    what:
      "A Case Converter changes the capitalization/format of text (upper/lower/title/sentence) and can generate simple snake_case or kebab-case.",
    howTo: [
      "Paste or type your text.",
      "Select the desired case style from the dropdown.",
      "Copy the converted result.",
    ],
    example: {
      inputLabel: "Example input",
      input: "hello world from webtera",
      outputLabel: "Example output (Title Case)",
      output: "Hello World From Webtera",
    },
    benefits: [
      "Quickly clean up titles, headings, and captions.",
      "Generate consistent slugs/identifiers (snake/kebab).",
      "One-click copy for fast workflows.",
    ],
    faq: [
      {
        q: "Does Title Case handle every language perfectly?",
        a: "It’s a simple title-case conversion designed for speed; edge cases (acronyms, names) may need manual tweaks.",
      },
      {
        q: "Why are symbols removed in snake/kebab?",
        a: "Those modes aim to create clean identifiers by stripping punctuation and normalizing spaces.",
      },
      {
        q: "Is my text stored anywhere?",
        a: "No—conversion happens locally in your browser.",
      },
    ],
  },

  "qr-code-generator": {
    what: "A QR Code Generator instantly creates a scannable graphic (like a barcode) from any text, URL, or contact info.",
    howTo: [
      "Paste your text or URL into the input area.",
      "The QR code will update instantly.",
      "Right-click and save, or use the download button to keep the graphic.",
    ],
    example: {
      inputLabel: "Example input",
      input: "https://example.com/promo",
      outputLabel: "Example output",
      output: "[QR Code Graphic rendered]",
    },
    benefits: [
      "No sign-up or tracking on your generated codes.",
      "Works fully offline in the browser.",
      "Instant high-res output.",
    ],
    faq: [
      {
        q: "Do these QR codes expire?",
        a: "No, the codes you generate here contain raw data. As long as the data (like your website URL) works, the code will work forever.",
      },
      {
        q: "Is there a limit on how much text I can encode?",
        a: "Technically yes (up to ~4,296 characters), but scanners often struggle with codes containing too much data. Try to keep it brief.",
      },
    ],
  },

  "lorem-ipsum-generator": {
    what: "A Lorem Ipsum Generator creates standard Latin dummy text to use as placeholders in mockups and designs.",
    howTo: [
      "Select the number of paragraphs you need.",
      "Click Generate.",
      "Click the Copy button to copy it all at once.",
    ],
    example: {
      inputLabel: "Settings",
      input: "Paragraphs: 1",
      outputLabel: "Example output",
      output: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    },
    benefits: [
      "Helps clients focus on layout, not content.",
      "Instantly generates as much text as you need.",
      "No weird or inappropriate vocabulary added.",
    ],
    faq: [
      {
        q: "What does Lorem Ipsum mean?",
        a: "It's a scrambled piece of text from a work by Cicero from 45 BC. It doesn't have meaningful translation.",
      },
    ],
  },

  "markdown-preview": {
    what: "A Markdown Preview lets you type in lightweight formatting syntax and instantly see what it looks like rendered as HTML/Rich text.",
    howTo: [
      "Type or paste Markdown text in the editor panel.",
      "The preview panel will update automatically.",
      "Copy the raw text or the output depending on your workflow.",
    ],
    example: {
      inputLabel: "Example markdown",
      input: "# Hello\n**bold text**",
      outputLabel: "Rendered layout",
      output: "[Large H1 heading Hello]\n[Bold text]",
    },
    benefits: [
      "Great for writing docs, READMEs, or emails.",
      "Split-screen design for real-time feedback.",
      "Renders lists, links, and formatting accurately.",
    ],
    faq: [
      {
        q: "What flavor of Markdown does this use?",
        a: "We use a standard Github-Flavored Markdown-compatible renderer.",
      },
    ],
  },

  "url-encoder": {
    what: "A URL Encoder helps securely translate special characters like spaces, question marks, and ampersands into a web-safe format.",
    howTo: [
      "Paste your raw URL, text, or parameters.",
      "Choose Encode to make it web-safe, or Decode to make it readable.",
      "Copy the resulting string.",
    ],
    example: {
      inputLabel: "Example input (Encode)",
      input: "hello world!",
      outputLabel: "Example output",
      output: "hello%20world%21",
    },
    benefits: [
      "Crucial for pasting text inside URLs or query strings.",
      "Decodes broken-looking URLs back to human text.",
      "Instant one-click operation.",
    ],
    faq: [
      {
        q: "Why do spaces become %20?",
        a: "URLs cannot contain literal spaces. Under the international standard, spaces are encoded as %20.",
      },
      {
        q: "Does this send my URL anywhere?",
        a: "No, encoding and decoding occur purely locally in your browser.",
      },
    ],
  },
};

export function getToolContent(slug: string) {
  return (toolContent as Record<string, ToolContent | undefined>)[slug];
}

