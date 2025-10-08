import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Database } from "@repo/ui/providers";
import { fetchDatabase } from "@repo/lib";
import { APP_CONFIG } from "@/config";

export const metadata: Metadata = {
  alternates: {
    canonical: "/db/dictionary",
  },
  title: "Lore Dictionary – Blue Protocol Star Resonance – The Hidden Gaming Lair",
  description:
    "An encyclopedia of lore, concepts, and historical events in Blue Protocol Star Resonance. Learn about the world, its inhabitants, and its history.",
};

export default async function DictionaryPage() {
  const database = await fetchDatabase(APP_CONFIG.name);
  const category = database.find((item) =>
    item.type.startsWith("dictionary_"),
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
    </div>
  );
}
