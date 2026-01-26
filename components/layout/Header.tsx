export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </div>
      {/* <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Profile
        </button>
      </div> */}
    </header>
  );
}
