import { HeaderOffset } from "@repo/ui/header";
import { ContentLayout } from "@repo/ui/ads";
import { fetchDatabase, fetchDict } from "@repo/lib";
import { APP_CONFIG } from "@/config";
import { DatabaseSidebar } from "@/components/database-sidebar";

export async function generateMetadata() {
  return {
    title: `Story Episodes – ${APP_CONFIG.title}`,
    description: `Follow the epic story of ${APP_CONFIG.title} through detailed episode summaries and quest phases.`,
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const enDict = await fetchDict(APP_CONFIG.name);
  const database = await fetchDatabase(APP_CONFIG.name);

  // Filter story episodes and sort by episode number
  const data = database
    .filter((item) => item.type.startsWith("story_episode_"))
    .sort((a, b) => {
      const aNum = parseInt(a.type.replace("story_episode_", ""), 10);
      const bNum = parseInt(b.type.replace("story_episode_", ""), 10);
      return aNum - bNum;
    });

  const menu = data.map((item) => ({
    category: { key: item.type, value: enDict[item.type] },
    items: item.items.map((subitem) => ({
      key: subitem.id,
      text: subitem.props.title,
      href: `/db/story/${subitem.id}`,
    })),
  }));

  return (
    <HeaderOffset full>
      <ContentLayout
        id="blue-protocol-star-resonance"
        header={
          <>
            <h2 className="text-2xl">Story Episodes</h2>
            <p className="text-sm my-2">
              Follow the epic journey through Blue Protocol: Star Resonance with
              detailed episode summaries and quest phases. Experience the story
              of your adventure from the very beginning to the climactic finale.
            </p>
          </>
        }
        sidebar={<DatabaseSidebar menu={menu} />}
        content={children}
      />
    </HeaderOffset>
  );
}
