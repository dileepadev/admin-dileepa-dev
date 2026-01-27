import { getEvents } from "@/app/actions/events";
import { getVideos } from "@/app/actions/videos";
import { getBlogs } from "@/app/actions/blogs";
import { getCommunities } from "@/app/actions/communities";
import { getTools } from "@/app/actions/tools";
import { getExperiences } from "@/app/actions/experiences";
import { getEducations } from "@/app/actions/educations";

export default async function Home() {
  const [events, videos, blogs, communities, tools, experiences, educations] = await Promise.all([
    getEvents(),
    getVideos(),
    getBlogs(),
    getCommunities(),
    getTools(),
    getExperiences(),
    getEducations(),
  ]);

  const stats = [
    { label: "Events", count: events.length },
    { label: "Videos", count: videos.length },
    { label: "Blogs", count: blogs.length },
    { label: "Communities", count: communities.length },
    { label: "Tools", count: tools.length },
    { label: "Experiences", count: experiences.length },
    { label: "Educations", count: educations.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold mt-1">{s.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">Welcome to the admin dashboard.</p>
      </div>
    </div>
  );
}
