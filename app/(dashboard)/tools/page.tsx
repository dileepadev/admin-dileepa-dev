import { ToolsList } from "./tools-list";

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Tools</h1>
      <ToolsList />
    </div>
  );
}
