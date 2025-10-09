import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Database } from "@repo/ui/providers";
import { fetchDatabase, DEFAULT_LOCALE, getMetadataAlternates } from "@repo/lib";
import { APP_CONFIG } from "@/config";

type PageProps = {
  params: Promise<{ locale?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale = DEFAULT_LOCALE } = await params;

  const title = "Story Episodes – Blue Protocol: Star Resonance";
  const description =
    "Follow the epic story of Blue Protocol: Star Resonance through detailed episode summaries and quest phases.";

  const { canonical, languageAlternates } = getMetadataAlternates(
    "/db/story",
    locale,
    APP_CONFIG.supportedLocales,
  );

  return {
    title,
    description,
    keywords: [
      ...APP_CONFIG.keywords,
      "Story Episodes",
      "Main Story",
      "Quest Phases",
      "Lore",
      "Campaign",
    ],
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
  };
}

export default async function StoryPage() {
  const database = await fetchDatabase(APP_CONFIG.name);
  const category = database.find((item) =>
    item.type.startsWith("story_episode_"),
  ) as Database[number];
  if (!category) {
    notFound();
  }
  const item = category.items[0];
  if (!item) {
    notFound();
  }

  return (
    <div className="py-6 text-left space-y-4">
      <h3 className="uppercase text-4xl">{item.props.title}</h3>
      <div
        className="pt-4 text-muted-foreground whitespace-break-spaces"
        dangerouslySetInnerHTML={{ __html: item.props.content }}
      />
      {item.props.phaseOrder !== undefined && (
        <p className="text-sm text-muted-foreground pt-4">
          Phase {item.props.phaseOrder}
        </p>
      )}
    </div>
  );
}
