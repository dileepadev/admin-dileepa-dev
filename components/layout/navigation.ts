import {
  Briefcase,
  Calendar,
  CircleUser,
  Database,
  FileText,
  FolderGit2,
  MessageSquare,
  GraduationCap,
  Grid2x2,
  ImageUp,
  LayoutDashboard,
  Presentation,
  User,
  Users,
  Video,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/**
 * Grouped navigation.
 *
 * A flat list of ten items made a person read all ten to find one. The groups
 * are the site's own sections — what you are editing, not what kind of record
 * it happens to be.
 */
export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const navigation: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }],
  },
  {
    title: 'Profile',
    items: [
      { name: 'About', href: '/about', icon: User },
      { name: 'Experiences', href: '/experiences', icon: Briefcase },
      { name: 'Educations', href: '/educations', icon: GraduationCap },
      { name: 'Tools', href: '/tools', icon: Wrench },
      // Both hold copy the public site used to compile in: the six About cards
      // and the speaker kit's talk themes. They sit under Profile because that
      // is the part of the site they render on, not because of their shape.
      { name: 'Pillars', href: '/pillars', icon: Grid2x2 },
      { name: 'Speaking topics', href: '/speaking-topics', icon: Presentation },
    ],
  },
  {
    title: 'Community',
    items: [
      { name: 'Communities', href: '/communities', icon: Users },
      { name: 'Events', href: '/events', icon: Calendar },
      { name: 'Videos', href: '/videos', icon: Video },
    ],
  },
  {
    title: 'Content',
    items: [
      { name: 'Projects', href: '/projects', icon: FolderGit2 },
      { name: 'Blogs', href: '/blogs', icon: FileText },
      { name: 'Comments', href: '/comments', icon: MessageSquare },
      { name: 'Media', href: '/media', icon: ImageUp },
    ],
  },
  {
    // Last, and its own group rather than an item under Overview: everything
    // above edits records, and this empties the database they live in.
    title: 'Maintenance',
    items: [
      { name: 'Account', href: '/account', icon: CircleUser },
      { name: 'Database', href: '/database', icon: Database },
    ],
  },
];
