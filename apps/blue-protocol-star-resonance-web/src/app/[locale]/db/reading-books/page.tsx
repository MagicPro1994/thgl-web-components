import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Database } from "@repo/ui/providers";
import { fetchDatabase } from "@repo/lib";
import { APP_CONFIG } from "@/config";

export const metadata: Metadata = {
  alternates: {
    canonical: "/db/reading-books",
  },
  title: "All Reading Books – Blue Protocol Star Resonance – The Hidden Gaming Lair",
  description:
    "A comprehensive collection of reading books found throughout Blue Protocol Star Resonance. Discover lore, stories, travel guides, letters, posters, and more.",
};

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
