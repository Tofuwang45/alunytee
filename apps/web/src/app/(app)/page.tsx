import NewChatIntake from "@/components/chat/NewChatIntake";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const repos = await prisma.repository.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, url: true },
  });

  return <NewChatIntake repos={repos} />;
}
