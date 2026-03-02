import { EducationsList } from "./educations-list";

export default function EducationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Educations</h1>
        <p className="text-muted-foreground">
          Update your educational background, degrees, and institutions.
        </p>
      </div>

      <EducationsList />
    </div>
  );
}
