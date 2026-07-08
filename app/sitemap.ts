import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://learnpik.com';

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/visuals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // If Supabase is configured, fetch dynamic routes
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch published images
    const { data: images } = await supabase
      .from('images')
      .select('id, published_at')
      .eq('is_published', true)
      .eq('status', 'approved')
      .order('published_at', { ascending: false })
      .limit(5000);

    if (images) {
      const imageRoutes = images.map((image) => ({
        url: `${baseUrl}/image/${image.id}`,
        lastModified: image.published_at ? new Date(image.published_at) : new Date(),
        changeFrequency: 'weekly' as any,
        priority: 0.8,
      }));
      
      routes.push(...imageRoutes);
    }
  }

  return routes;
}
