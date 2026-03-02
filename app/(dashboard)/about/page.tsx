import { AboutForm } from "./about-form";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage About</h1>
        <p className="text-muted-foreground">
          Update your personal information, bio, and contact details.
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <AboutForm />
      </div>
    </div>
  );
}

