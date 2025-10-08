import { HeaderOffset } from "@repo/ui/header";
import { ContentLayout } from "@repo/ui/ads";
import Link from "next/link";
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
    .filter((item) => item.type.startsWith("dictionary_"))
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
        value: (
          <Link
            href={`/db/dictionary/${subitem.id}`}
            title={subitem.props.title}
          >
            {subitem.props.title}
          </Link>
        ),
      })),
    };
  });

  return (
    <HeaderOffset full>
      <ContentLayout
        id="blue-protocol-star-resonance"
        header={
          <>
            <h2 className="text-2xl">Lore Dictionary</h2>
            <p className="text-sm my-2">
              An encyclopedia of lore, concepts, and historical events in Blue
              Protocol Star Resonance. Learn about the world, its inhabitants,
              and its history.
            </p>
          </>
        }
        sidebar={<DatabaseSidebar menu={menu} />}
        content={children}
      />
    </HeaderOffset>
  );
}
