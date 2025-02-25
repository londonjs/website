import { defineCollection, z } from "astro:content";
import { isBefore } from "date-fns";
import { toDate } from "date-fns-tz";

const generateSlug = (date: Date, title: string): string => {
  const formattedDate = date.toISOString().split('T')[0];
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${formattedDate}-${titleSlug}`;
};

const meetups = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      description: z.string().optional(),
      location: z.string(),
      meetupUrl: z.string().url(),
      status: z.enum(["upcoming", "past"]).default("upcoming"),
      slug: z.string().optional(),
      speakers: z
        .array(
          z.object({
            name: z.string(),
            role: z.string().optional(),
          })
        )
        .optional(),
      sponsors: z
        .array(
          z.object({
            name: z.string(),
            logo: z.string(),
            url: z.string().url(),
          })
        )
        .optional(),
    }).transform((data) => {
      const timeZone = "Europe/London";
      const startTimeParts = data.startTime.split(":");
      const endTimeParts = data.endTime.split(":");

      const startDateTimeString = `${data.date.toISOString().split("T")[0]}T${
        data.startTime
      }:00`;
      const endDateTimeString = `${data.date.toISOString().split("T")[0]}T${
        data.endTime
      }:00`;

      const startDateTime = toDate(startDateTimeString, { timeZone });
      const endDateTime = toDate(endDateTimeString, { timeZone });
      const now = new Date();

      return {
        ...data,
        startDateTime,
        endDateTime,
        status: isBefore(endDateTime, now) ? "past" : "upcoming",
        slug: data.slug ?? generateSlug(data.date, data.title),
      };
    }),
});

export const collections = { meetups };
