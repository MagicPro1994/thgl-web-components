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

  const title = "Reading Books – Blue Protocol: Star Resonance";
  const description =
    "A comprehensive collection of reading books found throughout Blue Protocol: Star Resonance. Discover lore, stories, travel guides, letters, posters, and more.";

  const { canonical, languageAlternates } = getMetadataAlternates(
    "/db/reading-books",
    locale,
    APP_CONFIG.supportedLocales,
  );

  return {
    title,
    description,
    keywords: [
      ...APP_CONFIG.keywords,
      "Reading Books",
      "Lore Books",
      "Travel Guides",
      "Letters",
      "Collectibles",
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

export default async function ReadingBooksPage() {
  const database = await fetchDatabase(APP_CONFIG.name);
  const category = database.find((item) =>
    item.type.startsWith("reading_books_"),
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
      {item.props.description && (
        <p
          className="text-muted-foreground italic"
          dangerouslySetInnerHTML={{ __html: item.props.description }}
        />
      )}
      <div
        className="pt-4 text-muted-foreground whitespace-break-spaces"
        dangerouslySetInnerHTML={{ __html: item.props.content }}
      />
      {item.props.entryCount > 1 && (
        <p className="text-sm text-muted-foreground pt-4">
          This book contains {item.props.entryCount} pages.
        </p>
      )}
    </div>
  );
}
