"use client";

import { useActionState, useEffect, useState } from "react";
import { updateAbout, getAboutData, AboutFormData, UpdateAboutState } from "@/app/actions/about";
import { Loader2, Plus, Trash2 } from "lucide-react";

const initialState: UpdateAboutState = {
  message: "",
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
        description: [...data.description, ""],
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
        connect: [...data.connect, ""],
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
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load about data</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={data.name}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-destructive">{state.errors.name.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={data.title}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.title && (
            <p className="mt-1 text-sm text-destructive">{state.errors.title.join(", ")}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="tagline" className="block text-sm font-medium text-foreground">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          required
          defaultValue={data.tagline}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {state.errors?.tagline && (
          <p className="mt-1 text-sm text-destructive">{state.errors.tagline.join(", ")}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-foreground">
            Description
          </label>
          <button
            type="button"
            onClick={addDescription}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Enter description paragraph..."
              />
              {data.description.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDescription(index)}
                  className="self-start rounded-md bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {state.errors?.description && (
          <p className="mt-1 text-sm text-destructive">{state.errors.description.join(", ")}</p>
        )}
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="bannerWebp" className="block text-sm font-medium text-foreground">
            Banner WebP URL
          </label>
          <input
            id="bannerWebp"
            name="bannerWebp"
            type="url"
            required
            defaultValue={data.bannerWebp}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.bannerWebp && (
            <p className="mt-1 text-sm text-destructive">{state.errors.bannerWebp.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="profilePng" className="block text-sm font-medium text-foreground">
            Profile PNG URL
          </label>
          <input
            id="profilePng"
            name="profilePng"
            type="url"
            required
            defaultValue={data.profilePng}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.profilePng && (
            <p className="mt-1 text-sm text-destructive">{state.errors.profilePng.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="profileWebp" className="block text-sm font-medium text-foreground">
            Profile WebP URL
          </label>
          <input
            id="profileWebp"
            name="profileWebp"
            type="url"
            required
            defaultValue={data.profileWebp}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.profileWebp && (
            <p className="mt-1 text-sm text-destructive">{state.errors.profileWebp.join(", ")}</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-foreground">
            Website URL
          </label>
          <input
            id="website"
            name="website"
            type="url"
            required
            defaultValue={data.website}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.website && (
            <p className="mt-1 text-sm text-destructive">{state.errors.website.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={data.email}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.email && (
            <p className="mt-1 text-sm text-destructive">{state.errors.email.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="github" className="block text-sm font-medium text-foreground">
            GitHub URL
          </label>
          <input
            id="github"
            name="github"
            type="url"
            required
            defaultValue={data.github}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.github && (
            <p className="mt-1 text-sm text-destructive">{state.errors.github.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-foreground">
            LinkedIn URL
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            required
            defaultValue={data.linkedin}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.linkedin && (
            <p className="mt-1 text-sm text-destructive">{state.errors.linkedin.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="xtwitter" className="block text-sm font-medium text-foreground">
            X/Twitter URL
          </label>
          <input
            id="xtwitter"
            name="xtwitter"
            type="url"
            required
            defaultValue={data.xtwitter}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.xtwitter && (
            <p className="mt-1 text-sm text-destructive">{state.errors.xtwitter.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-foreground">
            Instagram URL
          </label>
          <input
            id="instagram"
            name="instagram"
            type="url"
            required
            defaultValue={data.instagram}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.instagram && (
            <p className="mt-1 text-sm text-destructive">{state.errors.instagram.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="youtube" className="block text-sm font-medium text-foreground">
            YouTube URL
          </label>
          <input
            id="youtube"
            name="youtube"
            type="url"
            required
            defaultValue={data.youtube}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state.errors?.youtube && (
            <p className="mt-1 text-sm text-destructive">{state.errors.youtube.join(", ")}</p>
          )}
        </div>
      </div>

      {/* Connect Messages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-foreground">
            Connect Messages
          </label>
          <button
            type="button"
            onClick={addConnect}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Enter connect message..."
              />
              {data.connect.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConnect(index)}
                  className="self-start rounded-md bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {state.errors?.connect && (
          <p className="mt-1 text-sm text-destructive">{state.errors.connect.join(", ")}</p>
        )}
      </div>

      {state.message && (
        <div className={`rounded-md p-3 ${state.message.includes("successfully") ? "bg-green-50 text-green-800 border border-green-200" : "bg-destructive/15 text-destructive"}`}>
          <p className="text-sm">{state.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        >
          <Loader2 className="h-4 w-4 animate-spin" style={{ display: 'none' }} />
          Save Changes
        </button>
      </div>
    </form>
  );
}
