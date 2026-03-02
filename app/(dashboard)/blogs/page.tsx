import { BlogsList } from "./blogs-list";

export default function BlogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Blogs</h1>
      <BlogsList />
    </div>
  );
}
