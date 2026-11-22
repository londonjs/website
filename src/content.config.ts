import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { isBefore, parse } from 'date-fns';
import { generateSlug } from './utils/slug';

const meetups = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/meetups' }),
  schema: z
    .object({
      title: z.string(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      location: z.object({
        venue: z.string(),
        address: z.string(),
        mapLink: z.url().optional(),
        coordinates: z.object({ lat: z.number(), lon: z.number() }).optional(),
      }),
      meetupUrl: z.url(),
      description: z.object({
        markdown: z.string(),
      }),
      slug: z.string().optional(),
      talks: z.array(
        z.object({
          speaker: z.object({
            name: z.string(),
            role: z.string().optional(),
          }),
          title: z.string(),
        })
      ),
      sponsors: z
        .array(
          z.object({
            name: z.string(),
            logo: z.string(),
            url: z.url(),
          })
        )
        .optional(),
      organizers: z.array(
        z.object({
          name: z.string(),
          role: z.string(),
          linkedin: z.url(),
          website: z.url().optional(),
        })
      ),
      refreshments: z.object({
        description: z.string(),
        markdown: z.boolean(),
      }),
      thingsToNote: z.object({
        items: z.array(z.string()),
        markdown: z.boolean(),
      }),
      codeOfConductUrl: z.url(),
    })
    .transform((data) => {
      const dateObj = new Date(data.date);
      const eventDate = parse(`${data.date} ${data.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

      return {
        ...data,
        date: dateObj,
        status: (() => {
          const isPast = isBefore(eventDate, new Date());
          return isPast ? 'past' : 'upcoming';
        })(),
        slug: data.slug || generateSlug(data.date, data.title),
      };
    }),
});

export const collections = { meetups };
