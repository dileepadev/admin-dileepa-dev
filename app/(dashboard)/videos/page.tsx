import { VideosList } from "./videos-list";

export default function VideosPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Videos</h1>
      <VideosList />
    </div>
  );
}
