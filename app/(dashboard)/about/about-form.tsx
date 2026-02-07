'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateAbout, getAboutData, AboutFormData, UpdateAboutState } from '@/app/actions/about';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ImageUploadField } from '@/components/ui/image-upload-field';

const initialState: UpdateAboutState = {
  message: '',
  errors: {},
};

export function AboutForm() {
  const [state, formAction] = useActionState(updateAbout, initialState);
  const [data, setData] = useState<AboutFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const aboutData = await getAboutData();
      setData(aboutData);
      setLoading(false);
    }
    loadData();
  }, []);

  const addDescription = () => {
    if (data) {
      setData({
        ...data,
        description: [...data.description, ''],
      });
    }
  };

  const removeDescription = (index: number) => {
    if (data) {
      setData({
        ...data,
        description: data.description.filter((_, i) => i !== index),
      });
    }
  };

  const updateDescription = (index: number, value: string) => {
    if (data) {
      const newDesc = [...data.description];
      newDesc[index] = value;
      setData({
        ...data,
        description: newDesc,
      });
    }
  };

  const addConnect = () => {
    if (data) {
      setData({
        ...data,
        connect: [...data.connect, ''],
      });
    }
  };

  const removeConnect = (index: number) => {
    if (data) {
      setData({
        ...data,
        connect: data.connect.filter((_, i) => i !== index),
      });
    }
  };

  const updateConnect = (index: number, value: string) => {
    if (data) {
      const newConnect = [...data.connect];
      newConnect[index] = value;
      setData({
        ...data,
        connect: newConnect,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Failed to load about data</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-foreground block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={data.name}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.name && (
            <p className="text-destructive mt-1 text-sm">{state.errors.name.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="text-foreground block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={data.title}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.title && (
            <p className="text-destructive mt-1 text-sm">{state.errors.title.join(', ')}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="tagline" className="text-foreground block text-sm font-medium">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          required
          defaultValue={data.tagline}
          className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
        />
        {state.errors?.tagline && (
          <p className="text-destructive mt-1 text-sm">{state.errors.tagline.join(', ')}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <label className="text-foreground block text-sm font-medium">Description</label>
          <button
            type="button"
            onClick={addDescription}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Paragraph
          </button>
        </div>
        <div className="space-y-3">
          {data.description.map((desc, index) => (
            <div key={index} className="flex gap-3">
              <textarea
                name="description"
                required
                value={desc}
                onChange={(e) => updateDescription(index, e.target.value)}
                rows={3}
                className="border-input bg-background focus:border-ring focus:ring-ring flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                placeholder="Enter description paragraph..."
              />
              {data.description.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDescription(index)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 self-start rounded-md p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {state.errors?.description && (
          <p className="text-destructive mt-1 text-sm">{state.errors.description.join(', ')}</p>
        )}
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <ImageUploadField
            name="bannerWebp"
            label="Banner WebP URL"
            defaultValue={data.bannerWebp}
            folder="about"
          />
          {state.errors?.bannerWebp && (
            <p className="text-destructive mt-1 text-sm">{state.errors.bannerWebp.join(', ')}</p>
          )}
        </div>

        <div>
          <ImageUploadField
            name="profilePng"
            label="Profile PNG URL"
            defaultValue={data.profilePng}
            folder="about"
          />
          {state.errors?.profilePng && (
            <p className="text-destructive mt-1 text-sm">{state.errors.profilePng.join(', ')}</p>
          )}
        </div>

        <div>
          <ImageUploadField
            name="profileWebp"
            label="Profile WebP URL"
            defaultValue={data.profileWebp}
            folder="about"
          />
          {state.errors?.profileWebp && (
            <p className="text-destructive mt-1 text-sm">{state.errors.profileWebp.join(', ')}</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="website" className="text-foreground block text-sm font-medium">
            Website URL
          </label>
          <input
            id="website"
            name="website"
            type="url"
            required
            defaultValue={data.website}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.website && (
            <p className="text-destructive mt-1 text-sm">{state.errors.website.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-foreground block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={data.email}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.email && (
            <p className="text-destructive mt-1 text-sm">{state.errors.email.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="github" className="text-foreground block text-sm font-medium">
            GitHub URL
          </label>
          <input
            id="github"
            name="github"
            type="url"
            required
            defaultValue={data.github}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.github && (
            <p className="text-destructive mt-1 text-sm">{state.errors.github.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="linkedin" className="text-foreground block text-sm font-medium">
            LinkedIn URL
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            required
            defaultValue={data.linkedin}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.linkedin && (
            <p className="text-destructive mt-1 text-sm">{state.errors.linkedin.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="xtwitter" className="text-foreground block text-sm font-medium">
            X/Twitter URL
          </label>
          <input
            id="xtwitter"
            name="xtwitter"
            type="url"
            required
            defaultValue={data.xtwitter}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.xtwitter && (
            <p className="text-destructive mt-1 text-sm">{state.errors.xtwitter.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="instagram" className="text-foreground block text-sm font-medium">
            Instagram URL
          </label>
          <input
            id="instagram"
            name="instagram"
            type="url"
            required
            defaultValue={data.instagram}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.instagram && (
            <p className="text-destructive mt-1 text-sm">{state.errors.instagram.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="youtube" className="text-foreground block text-sm font-medium">
            YouTube URL
          </label>
          <input
            id="youtube"
            name="youtube"
            type="url"
            required
            defaultValue={data.youtube}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.youtube && (
            <p className="text-destructive mt-1 text-sm">{state.errors.youtube.join(', ')}</p>
          )}
        </div>

        <div>
          <label htmlFor="facebook" className="text-foreground block text-sm font-medium">
            Facebook URL
          </label>
          <input
            id="facebook"
            name="facebook"
            type="url"
            defaultValue={data.facebook}
            className="border-input bg-background focus:border-ring focus:ring-ring mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
          />
          {state.errors?.facebook && (
            <p className="text-destructive mt-1 text-sm">{state.errors.facebook.join(', ')}</p>
          )}
        </div>
      </div>

      {/* Connect Messages */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <label className="text-foreground block text-sm font-medium">Connect Messages</label>
          <button
            type="button"
            onClick={addConnect}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Message
          </button>
        </div>
        <div className="space-y-3">
          {data.connect.map((msg, index) => (
            <div key={index} className="flex gap-3">
              <textarea
                name="connect"
                required
                value={msg}
                onChange={(e) => updateConnect(index, e.target.value)}
                rows={2}
                className="border-input bg-background focus:border-ring focus:ring-ring flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                placeholder="Enter connect message..."
              />
              {data.connect.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConnect(index)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 self-start rounded-md p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {state.errors?.connect && (
          <p className="text-destructive mt-1 text-sm">{state.errors.connect.join(', ')}</p>
        )}
      </div>

      {state.message && (
        <div
          className={`rounded-md p-3 ${state.message.includes('successfully') ? 'border border-green-200 bg-green-50 text-green-800' : 'bg-destructive/15 text-destructive'}`}
        >
          <p className="text-sm">{state.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ display: 'none' }} />
          Save Changes
        </button>
      </div>
    </form>
  );
}
