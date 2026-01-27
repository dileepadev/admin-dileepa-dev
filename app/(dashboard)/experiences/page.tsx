import { ExperiencesList } from "./experiences-list";

export default function ExperiencesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Experiences</h1>
        <p className="text-muted-foreground">
          Update your professional experience, work history, and roles.
        </p>
      </div>

      <ExperiencesList />
    </div>
  );
}
