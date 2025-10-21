import { HeaderOffset } from "@repo/ui/header";
import { ContentLayout } from "@repo/ui/ads";
import { fetchDatabase, fetchDict } from "@repo/lib";
import { DatabaseSidebar } from "@/components/database-sidebar";
import { APP_CONFIG } from "@/config";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const enDict = await fetchDict(APP_CONFIG.name);
  const database = await fetchDatabase(APP_CONFIG.name);
  const data = database
    .filter((item) => item.type.startsWith("reading_books_"))
    .sort((a, b) =>
      enDict[a.type].localeCompare(enDict[b.type], undefined, {
        numeric: true,
      }),
    );

  const menu = data.map((item) => {
    return {
      category: {
        key: item.type,
        value: enDict[item.type],
      },
      items: item.items.map((subitem) => ({
        key: subitem.id,
        text: subitem.props.title,
        href: `/db/reading-books/${subitem.id}`,
      })),
    };
  });

  return (
    <HeaderOffset full>
      <ContentLayout
        id="blue-protocol-star-resonance"
        header={
          <>
            <h2 className="text-2xl">All Reading Books</h2>
            <p className="text-sm my-2">
              A comprehensive collection of reading books found throughout Blue
              Protocol Star Resonance. Discover lore, stories, guides, and more.
            </p>
          </>
        }
        sidebar={<DatabaseSidebar menu={menu} />}
        content={children}
      />
    </HeaderOffset>
  );
}
