'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ApiError, resource, singleton } from '@/lib/api';
import {
  type ActionState,
  flag,
  lines,
  list,
  optional,
  remove as removeResource,
  save,
  setPublished as setPublishedResource,
  text,
} from '@/lib/crud';
import { SOCIAL_FIELDS } from '@/lib/constants';
import type { About, Community, Education, Experience, Tool, Video } from '@/lib/types';

/**
 * The profile resources — about, experiences, educations, tools, communities,
 * videos. Six resources, one shape of code, because `lib/crud.ts` holds the
 * shape.
 */

const logo = z.object({ light: z.string(), dark: z.string() });
const readLogo = (data: FormData, prefix = 'logo') => ({
  light: text(data, `${prefix}.light`),
  dark: text(data, `${prefix}.dark`) || text(data, `${prefix}.light`),
});

// --- About ------------------------------------------------------------------

const aboutApi = singleton<About>('/about');

const aboutSchema = z.object({
  name: z.string().min(1, 'A name is required.'),
  title: z.string().min(1, 'A title is required — it renders beside the portrait.'),
  tagline: z.string().min(1, 'The tagline is the homepage heading, so it cannot be empty.'),
  location: z.string(),
  // The first paragraph is the About section's heading on the site; the rest
  // are its body. One field, so a heading and a body cannot drift apart.
  description: z.array(z.string()).min(1, 'Write at least the opening paragraph.'),
  status: z.string(),
  images: z.object({
    profilePng: z.string(),
    profileWebp: z.string(),
    bannerWebp: z.string(),
  }),
  links: z.record(z.string(), z.string()),
  connect: z.array(z.string()),
});

export async function getAbout(): Promise<About | null> {
  try {
    return await aboutApi.get();
  } catch {
    return null;
  }
}

function readAbout(data: FormData) {
  return {
    name: text(data, 'name'),
    title: text(data, 'title'),
    tagline: text(data, 'tagline'),
    location: text(data, 'location'),
    description: lines(data, 'description'),
    status: text(data, 'status'),
    images: {
      profilePng: text(data, 'images.profilePng'),
      profileWebp: text(data, 'images.profileWebp'),
      bannerWebp: text(data, 'images.bannerWebp'),
    },
    links: Object.fromEntries(SOCIAL_FIELDS.map((key) => [key, text(data, `links.${key}`)])),
    connect: lines(data, 'connect'),
  };
}

/**
 * `/about` is a singleton — one PATCH, no identifier — so it does not go
 * through `save`, which exists to choose between POST and PATCH.
 */
export async function saveAbout(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = aboutSchema.safeParse(readAbout(formData));
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      (errors[issue.path.join('.') || '_form'] ??= []).push(issue.message);
    }
    return { errors, message: 'Some fields need attention.' };
  }

  try {
    await aboutApi.update(parsed.data);
  } catch (error) {
    return {
      message:
        error instanceof ApiError
          ? error.message
          : 'Could not save the about record. The API did not answer.',
    };
  }

  revalidatePath('/about');
  return { success: true, message: 'About saved.' };
}

// --- Experiences ------------------------------------------------------------

const experienceOptions = {
  path: '/experiences',
  label: 'Experience',
  route: '/experiences',
  schema: z.object({
    title: z.string().min(1, 'A role title is required.'),
    company: z.string().min(1, 'A company is required.'),
    url: z.string().url('That is not a URL. Include https://.').or(z.literal('')),
    period: z.string().min(1, 'A period is required, e.g. "Apr 2025 — Present".'),
    description: z.string().min(1, 'Say what the role was actually for.'),
    technologies: z.array(z.string()),
    logo,
    published: z.boolean(),
  }),
  read: (data: FormData) => ({
    title: text(data, 'title'),
    company: text(data, 'company'),
    url: text(data, 'url'),
    period: text(data, 'period'),
    description: text(data, 'description'),
    technologies: list(data, 'technologies'),
    logo: readLogo(data),
    published: flag(data, 'published'),
  }),
};

export async function getExperiences(): Promise<Experience[]> {
  return (await resource<Experience>('/experiences').list()).items;
}

export async function saveExperience(
  id: string | null,
  prevState: ActionState,
  formData: FormData,
) {
  return save(experienceOptions, id, formData);
}

export async function deleteExperience(id: string) {
  return removeResource(experienceOptions, id);
}

export async function publishExperience(id: string, published: boolean) {
  return setPublishedResource(experienceOptions, id, published);
}

// --- Educations -------------------------------------------------------------

const educationOptions = {
  path: '/educations',
  label: 'Education',
  route: '/educations',
  schema: z.object({
    course: z.string().min(1, 'A course is required.'),
    institution: z.string().min(1, 'An institution is required.'),
    period: z.string().min(1, 'A period is required.'),
    description: z.string(),
    url: z.string().url('That is not a URL. Include https://.').or(z.literal('')),
    logo,
    published: z.boolean(),
  }),
  read: (data: FormData) => ({
    course: text(data, 'course'),
    institution: text(data, 'institution'),
    period: text(data, 'period'),
    description: text(data, 'description'),
    url: text(data, 'url'),
    logo: readLogo(data),
    published: flag(data, 'published'),
  }),
};

export async function getEducations(): Promise<Education[]> {
  return (await resource<Education>('/educations').list()).items;
}

export async function saveEducation(id: string | null, prevState: ActionState, formData: FormData) {
  return save(educationOptions, id, formData);
}

export async function deleteEducation(id: string) {
  return removeResource(educationOptions, id);
}

export async function publishEducation(id: string, published: boolean) {
  return setPublishedResource(educationOptions, id, published);
}

// --- Tools ------------------------------------------------------------------

const toolOptions = {
  path: '/tools',
  label: 'Tool',
  route: '/tools',
  schema: z.object({
    name: z.string().min(1, 'A name is required.'),
    logo,
    published: z.boolean(),
  }),
  read: (data: FormData) => ({
    name: text(data, 'name'),
    logo: readLogo(data),
    published: flag(data, 'published'),
  }),
};

export async function getTools(): Promise<Tool[]> {
  return (await resource<Tool>('/tools').list()).items;
}

export async function saveTool(id: string | null, prevState: ActionState, formData: FormData) {
  return save(toolOptions, id, formData);
}

export async function deleteTool(id: string) {
  return removeResource(toolOptions, id);
}

export async function publishTool(id: string, published: boolean) {
  return setPublishedResource(toolOptions, id, published);
}

// --- Communities ------------------------------------------------------------

const communityOptions = {
  path: '/communities',
  label: 'Community',
  route: '/communities',
  schema: z.object({
    name: z.string().min(1, 'A name is required.'),
    role: z.string().min(1, 'A role is required.'),
    period: z.string().min(1, 'A period is required.'),
    description: z.string(),
    communityUrl: z.string().url('That is not a URL. Include https://.').or(z.literal('')),
    logo,
    current: z.boolean(),
    published: z.boolean(),
  }),
  read: (data: FormData) => ({
    name: text(data, 'name'),
    role: text(data, 'role'),
    period: text(data, 'period'),
    description: text(data, 'description'),
    communityUrl: text(data, 'communityUrl'),
    logo: readLogo(data),
    current: flag(data, 'current'),
    published: flag(data, 'published'),
  }),
};

export async function getCommunities(): Promise<Community[]> {
  return (await resource<Community>('/communities').list()).items;
}

export async function saveCommunity(id: string | null, prevState: ActionState, formData: FormData) {
  return save(communityOptions, id, formData);
}

export async function deleteCommunity(id: string) {
  return removeResource(communityOptions, id);
}

export async function publishCommunity(id: string, published: boolean) {
  return setPublishedResource(communityOptions, id, published);
}

// --- Videos -----------------------------------------------------------------

const videoOptions = {
  path: '/videos',
  label: 'Video',
  route: '/videos',
  schema: z.object({
    title: z.string().min(1, 'A title is required.'),
    date: z.string().min(1, 'A date is required, as YYYY-MM-DD.'),
    link: z.string().url('That is not a URL. Include https://.'),
    thumbnail: z.string(),
    published: z.boolean(),
  }),
  read: (data: FormData) => ({
    title: text(data, 'title'),
    date: text(data, 'date'),
    link: text(data, 'link'),
    // The site no longer renders video thumbnails, but the field stays on the
    // model — dropping stored data to change a layout is not a trade worth
    // making. See `dileepa-dev/app/videos/page.tsx`.
    thumbnail: optional(data, 'thumbnail') ?? '',
    published: flag(data, 'published'),
  }),
};

export async function getVideos(): Promise<Video[]> {
  return (await resource<Video>('/videos').list()).items;
}

export async function saveVideo(id: string | null, prevState: ActionState, formData: FormData) {
  return save(videoOptions, id, formData);
}

export async function deleteVideo(id: string) {
  return removeResource(videoOptions, id);
}

export async function publishVideo(id: string, published: boolean) {
  return setPublishedResource(videoOptions, id, published);
}
