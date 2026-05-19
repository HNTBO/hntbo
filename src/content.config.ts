import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tutorials = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tutorials' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    youtubeId: z.string().regex(/^[\w-]{11}$/, 'YouTube ID must be exactly 11 characters'),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()),
    featured: z.boolean().optional().default(false),
    publishDate: z.coerce.date().optional(),
    downloadUrl: z.string().optional(),
    downloadLabel: z.string().optional(),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    githubUrl: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()),
    featured: z.boolean().optional().default(false),
    isLive: z.boolean().optional().default(false),
    livePath: z.string().refine(
      (val) => val.startsWith('/tools/') || val.startsWith('http://') || val.startsWith('https://'),
      'livePath must be an absolute URL or start with /tools/'
    ).optional(),
    liveLabel: z.string().optional(),
    downloadUrl: z.string().optional(),
    downloadLabel: z.string().optional(),
  }),
});

export const collections = {
  tutorials,
  tools,
};
