export function Header() {
  return (
    <header className="border-border bg-bg-primary/80 sticky top-0 z-50 flex h-14 items-center gap-4 border-b px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-text-primary text-lg font-semibold tracking-tight">Admin Panel</h1>
      </div>
      {/* <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          Profile
        </button>
      </div> */}
    </header>
  );
}
