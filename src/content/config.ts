import { defineCollection, z } from "astro:content";
import { isBefore, parse, format } from "date-fns";

const generateSlug = (dateStr: string, title: string): string => {
  const date = new Date(dateStr);
  const formattedDate = format(date, 'yyyy-MM-dd');
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${formattedDate}-${titleSlug}`;
};

const meetups = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    date: z.string(),         // Format: "YYYY-MM-DD"
    startTime: z.string(),    // Format: "HH:MM"
    endTime: z.string(),      // Format: "HH:MM"
    location: z.object({
      venue: z.string(),
      address: z.string(),
      mapLink: z.string().url().optional(),
    }),
    meetupUrl: z.string().url(),
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
    sponsors: z.array(
      z.object({
        name: z.string(),
        logo: z.string(),
        url: z.string().url(),
      })
    ).optional(),
    organizers: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
        linkedin: z.string().url(),
        website: z.string().url().optional(),
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
    codeOfConductUrl: z.string().url(),
  }).transform((data) => {
    const dateObj = new Date(data.date);
    const eventDate = parse(`${data.date} ${data.endTime}`, 'yyyy-MM-dd HH:mm', new Date());

    return {
      ...data,
      date: dateObj,
      status: (() => {
        const isPast = isBefore(eventDate, new Date());
        return isPast ? "past" : "upcoming";
      })(),
      slug: data.slug || generateSlug(data.date, data.title)
    };
  })
});

export const collections = { meetups };

