import { CommunitiesList } from "./communities-list";

export default function CommunitiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Communities</h1>
      <CommunitiesList />
    </div>
  );
}
