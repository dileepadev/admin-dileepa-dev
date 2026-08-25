import type { Metadata } from 'next';
import { getApiLink } from '@/app/actions/api-links';
import { getBlogs } from '@/app/actions/blogs';
import { Card, Section } from '@/components/ui';
import { BlogsScreen } from './blogs-screen';

export const metadata: Metadata = { title: 'Blogs' };

export default async function BlogsPage() {
  // The catalogue is fetched alongside the records rather than after them:
  // it is a second independent read, and serialising it would put a whole
  // round trip between the page and the screen for a panel that is closed.
  const [records, endpoints] = await Promise.all([getBlogs(), getApiLink('blogs')]);

  return (
    <Section>
      <Card className="mb-8">
        <p className="text-fg text-small">The words live in Git, not here.</p>
        <p className="text-fg-muted text-small mt-2">
          <code className="font-mono">POST /blogs/sync</code> rewrites title, description, dates,
          tags and reading time from the Markdown front matter on every push to{' '}
          <span className="font-mono">blog-dileepa-dev</span>. Editing those here lasts until the
          next push. What is genuinely yours to set is <em>featured</em>, the order, and the SEO
          overrides.
        </p>
        <p className="text-fg-muted text-small mt-2">
          Posts carry no banner. Anything a post shows is an ordinary Markdown image in the body.
        </p>
      </Card>

      <BlogsScreen records={records} endpoints={endpoints} />
    </Section>
  );
}
