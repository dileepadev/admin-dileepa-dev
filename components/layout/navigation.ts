import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Video,
  FileText,
  Users,
  Wrench,
  ImageUp,
} from 'lucide-react';

export const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'About', href: '/about', icon: User },
  { name: 'Experiences', href: '/experiences', icon: Briefcase },
  { name: 'Educations', href: '/educations', icon: GraduationCap },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Blogs', href: '/blogs', icon: FileText },
  { name: 'Communities', href: '/communities', icon: Users },
  { name: 'Tools', href: '/tools', icon: Wrench },
  { name: 'Media', href: '/media', icon: ImageUp },
];
