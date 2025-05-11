import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export const GET: APIRoute = async ({ url }): Promise<Response> => {
  const query: string | null = url.searchParams.get('query');

  // Handle if query is not present
  if (query === null) {
    return new Response(
      JSON.stringify({
        error: 'Query param is missing',
      }),
      {
        status: 400, // Bad request
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const allBlogs: CollectionEntry<'blog'>[] = await getCollection(
    'blog'
  );

  console.log(allBlogs.filter(blog => blog.body))

  //Filter blogs based on query
  const searchResults = allBlogs.filter((blog) => {
    const titleMatch: boolean = blog?.data?.title && blog.data.title
      .toLowerCase()
      .includes(query!.toLowerCase());

    const bodyMatch: boolean = blog?.data?.body && blog.data.body
      .toLowerCase()
      .includes(query!.toLowerCase());

    const slugMatch:boolean = blog?.data?.slug && blog.data.slug
      .toLowerCase()
      .includes(query!.toLowerCase());

    return titleMatch || bodyMatch || slugMatch;
  });

  return new Response(JSON.stringify(searchResults), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};