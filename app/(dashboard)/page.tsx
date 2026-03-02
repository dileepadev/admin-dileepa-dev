import { Card } from '@/components/ui/cards/Card';
// import ToastDemo from '@/components/ui/ToastDemo';
import { Section, SectionHeader } from '@/components/ui/Section';
import { getEvents } from '@/app/actions/events';
import { getVideos } from '@/app/actions/videos';
import { getBlogs } from '@/app/actions/blogs';
import { getCommunities } from '@/app/actions/communities';
import { getTools } from '@/app/actions/tools';
import { getExperiences } from '@/app/actions/experiences';
import { getEducations } from '@/app/actions/educations';

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
    { label: 'Events', count: events.length },
    { label: 'Videos', count: videos.length },
    { label: 'Blogs', count: blogs.length },
    { label: 'Communities', count: communities.length },
    { label: 'Tools', count: tools.length },
    { label: 'Experiences', count: experiences.length },
    { label: 'Educations', count: educations.length },
  ];

  return (
    <Section className="py-6 md:py-8 lg:py-10">
      <SectionHeader
        title="Dashboard"
        subtitle="Overview"
        description="Welcome back to your personal administrative dashboard."
        align="left"
        className="mb-8"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} variant="elevated" hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">{s.label}</p>
                <p className="text-text-primary mt-1 text-2xl font-semibold">{s.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="default" className="mt-8">
        <p className="text-text-secondary">
          Welcome to the admin dashboard. Select an item from the sidebar to manage content.
        </p>

        {/* <ToastDemo /> */}
      </Card>
    </Section>
  );
}
