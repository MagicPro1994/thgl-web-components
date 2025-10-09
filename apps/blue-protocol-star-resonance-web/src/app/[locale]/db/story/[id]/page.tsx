import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { type Database } from "@repo/ui/providers";
import { fetchDatabase, DEFAULT_LOCALE, getMetadataAlternates } from "@repo/lib";
import { APP_CONFIG } from "@/config";

type Params = Promise<{ id: string; locale?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id, locale = DEFAULT_LOCALE } = await params;
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

  const title = `${item.props.title} – Story Episodes – Blue Protocol: Star Resonance`;
  const description = item.props.content?.substring(0, 160);

  const { canonical, languageAlternates } = getMetadataAlternates(
    `/db/story/${id}`,
    locale,
    APP_CONFIG.supportedLocales,
  );

  return {
    title,
    description,
    keywords: [
      ...APP_CONFIG.keywords,
      "Story Episodes",
      item.props.title,
      "Quest Phase",
      "Main Story",
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

export default async function StoryPhasePage({
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
