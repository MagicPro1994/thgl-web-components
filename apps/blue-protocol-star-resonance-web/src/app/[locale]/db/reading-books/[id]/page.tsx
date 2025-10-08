import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Database } from "@repo/ui/providers";
import { fetchDatabase } from "@repo/lib";
import { APP_CONFIG } from "@/config";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const database = await fetchDatabase(APP_CONFIG.name);

  const category = database.find((item) =>
    item.items.some((i) => i.id === id),
  ) as Database[number] | undefined;
  if (!category) {
    return {};
  }
  const item = category.items.find((i) => i.id === id);
  if (!item) {
    return {};
  }

  return {
    title: `${item.props.title} – Reading Books – Blue Protocol Star Resonance – The Hidden Gaming Lair`,
    description: item.props.description || item.props.content?.substring(0, 160),
  };
}

export default async function ReadingBookPage({
  params,
}: {
  params: Params;
}): Promise<JSX.Element> {
  const { id } = await params;
  const database = await fetchDatabase(APP_CONFIG.name);

  const category = database.find((item) =>
    item.items.some((i) => i.id === id),
  ) as Database[number] | undefined;
  if (!category) {
    notFound();
  }
  const item = category.items.find((i) => i.id === id);
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
