import { notFound } from "next/navigation";
import { WatchDetail } from "@/components/watch-detail";
import { getWatchItem } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upgrade dossier",
  description: "An explainable npm upgrade dossier with a replayable audit seal.",
};

export default async function WatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getWatchItem(id);
  if (!item) notFound();
  return <WatchDetail item={item} />;
}
