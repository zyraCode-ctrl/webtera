import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ToolCard } from "@/components/ToolCard";
import { getToolBySlug, tools } from "@/data/tools";
import { getToolContent } from "@/data/toolContent";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";
import { PasswordGeneratorTool } from "@/components/tools/PasswordGeneratorTool";
import { WordCounterTool } from "@/components/tools/WordCounterTool";
import { Base64Tool } from "@/components/tools/Base64Tool";
import { CaseConverterTool } from "@/components/tools/CaseConverterTool";
import { QrCodeTool } from "@/components/tools/QrCodeTool";
import { LoremIpsumTool } from "@/components/tools/LoremIpsumTool";
import { MarkdownPreviewTool } from "@/components/tools/MarkdownPreviewTool";
import { UrlEncoderTool } from "@/components/tools/UrlEncoderTool";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) return { title: "Tool" };
  return {
    title: tool.title,
    description: tool.description,
  };
}

function ToolRenderer({ slug }: { slug: string }) {
  switch (slug) {
    case "json-formatter":
      return <JsonFormatterTool />;
    case "password-generator":
      return <PasswordGeneratorTool />;
    case "word-counter":
      return <WordCounterTool />;
    case "base64":
      return <Base64Tool />;
    case "case-converter":
      return <CaseConverterTool />;
    case "qr-code-generator":
      return <QrCodeTool />;
    case "lorem-ipsum-generator":
      return <LoremIpsumTool />;
    case "markdown-preview":
      return <MarkdownPreviewTool />;
    case "url-encoder":
      return <UrlEncoderTool />;
    default:
      return null;
  }
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const content = getToolContent(params.slug);

  const related = tools
    .filter((t) => t.slug !== params.slug)
    .slice(0, 3);

  return (
    <div className="min-w-0 w-full space-y-8">
      {/* Tool title at top */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {tool.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          {tool.description}
        </p>
      </section>

      {/* Ad below title */}
      <AdSlot type="banner" variant="topBanner" />

      {/* Tool UI (input → ad → result → ad → actions) */}
      <div className="transition-opacity duration-300">
        <ToolRenderer slug={params.slug} />
      </div>

      {/* Detailed content */}
      {content ? (
        <section className="space-y-4">
          <Card title="What is this tool?">
            <p className="text-sm leading-7 text-zinc-700">{content.what}</p>
          </Card>

          <Card title="How to use">
            <ol className="list-inside list-decimal space-y-2 text-sm leading-7 text-zinc-700">
              {content.howTo.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          </Card>

          <Card title="Example input/output">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {content.example.inputLabel}
                </div>
                <pre className="mt-2 min-w-0 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs leading-6 text-zinc-800">
                  {content.example.input}
                </pre>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {content.example.outputLabel}
                </div>
                <pre className="mt-2 min-w-0 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs leading-6 text-zinc-800">
                  {content.example.output}
                </pre>
              </div>
            </div>
          </Card>

          <Card title="Benefits">
            <ul className="list-inside list-disc space-y-2 text-sm leading-7 text-zinc-700">
              {content.benefits.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </Card>

          <Card title="FAQ">
            <div className="space-y-4">
              {content.faq.map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-sm font-semibold text-zinc-950">
                    {f.q}
                  </div>
                  <div className="text-sm leading-7 text-zinc-700">{f.a}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      {/* Related tools */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
            Related tools
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((t) => (
            <ToolCard
              key={t.slug}
              title={t.title}
              description={t.description}
              href={`/tools/${t.slug}`}
            />
          ))}
        </div>
      </section>

      {/* Bottom ad */}
      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="text-sm font-semibold text-zinc-950">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

