export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">Welcome to the admin dashboard.</p>
      </div>
    </div>
  );
}
