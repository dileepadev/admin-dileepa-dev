import type { Metadata } from 'next';
import Link from 'next/link';
import { getBlogs } from '@/app/actions/blogs';
import { getEvents } from '@/app/actions/events';
import { getProjects } from '@/app/actions/projects';
import {
  getCommunities,
  getEducations,
  getExperiences,
  getTools,
  getVideos,
} from '@/app/actions/profile';
import { Card, Section, SectionHeading } from '@/components/ui';

export const metadata: Metadata = { title: 'Dashboard' };

/**
 * The dashboard counts what is *live*, not what exists.
 *
 * A count of rows tells you the database is not empty. A count of what a
 * visitor can actually see tells you whether the site is right, which is the
 * question someone opening this app is asking.
 */
export default async function DashboardPage() {
  const [experiences, educations, tools, communities, videos, projects, events, blogs] =
    await Promise.all([
      getExperiences(),
      getEducations(),
      getTools(),
      getCommunities(),
      getVideos(),
      getProjects(),
      getEvents(),
      getBlogs(),
    ]);

  const live = <T extends { published?: boolean }>(rows: T[]) =>
    rows.filter((row) => row.published !== false).length;

  const stats = [
    {
      label: 'Experiences',
      href: '/experiences',
      total: experiences.length,
      live: live(experiences),
    },
    { label: 'Educations', href: '/educations', total: educations.length, live: live(educations) },
    { label: 'Tools', href: '/tools', total: tools.length, live: live(tools) },
    {
      label: 'Communities',
      href: '/communities',
      total: communities.length,
      live: live(communities),
    },
    { label: 'Events', href: '/events', total: events.length, live: live(events) },
    { label: 'Videos', href: '/videos', total: videos.length, live: live(videos) },
    { label: 'Projects', href: '/projects', total: projects.length, live: live(projects) },
    { label: 'Blogs', href: '/blogs', total: blogs.length, live: live(blogs) },
  ];

  const photos = events.reduce((count, event) => count + (event.photos?.length ?? 0), 0);

  return (
    <Section>
      <SectionHeading
        label="Overview"
        title="Dashboard"
        intro="What is live on dileepa.dev right now, and where to change it."
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className="block no-underline">
              <Card className="hover:border-brand transition-colors duration-[160ms]">
                <p className="text-fg-muted text-small font-mono">{stat.label}</p>
                <p className="text-fg text-h1 mt-2 font-bold tracking-[-0.02em]">{stat.live}</p>
                <p className="text-fg-muted mt-1 font-mono text-xs">
                  {stat.total === stat.live ? 'all live' : `${stat.total - stat.live} hidden`}
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <Card className="mt-8">
        <p className="text-fg-muted text-small font-mono">Event gallery</p>
        <p className="text-fg text-small mt-2">
          {photos === 0 ? (
            <>
              No event photographs yet. Attach photos to an event and they appear in the gallery on{' '}
              <Link href="/events">the events screen</Link> and on the site.
            </>
          ) : (
            <>
              {photos} photograph{photos === 1 ? '' : 's'} across{' '}
              {events.filter((event) => (event.photos?.length ?? 0) > 0).length} events. These are
              one of only two places a photograph appears on the site.
            </>
          )}
        </p>
      </Card>
    </Section>
  );
}
