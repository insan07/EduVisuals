import { Metadata, ResolvingMetadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ImageDetailClient from "./ImageDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data: image } = await supabase
      .from("images")
      .select("*, profiles(full_name)")
      .eq("id", id)
      .single();

    if (!image) {
      return {
        title: "Image Not Found | Learnpik",
      };
    }

    const title = `${image.title} - Learnpik Educational Visuals`;
    const description = image.description || `Download ${image.title} for your educational needs on Learnpik.`;
    
    // Determine the best image URL for OpenGraph
    const imageUrl = image.watermarked_url || image.file_url;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://learnpik.com/image/${id}`,
        siteName: "Learnpik",
        images: [
          {
            url: imageUrl,
            width: image.width || 1200,
            height: image.height || 630,
            alt: image.alt_text || image.title,
          },
        ],
        locale: "en_US",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "Learnpik Visual",
    };
  }
}

export default async function ImagePage({ params }: Props) {
  const { id } = await params;

  // Fetch data for JSON-LD
  const { data: image } = await supabase
    .from("images")
    .select("*, profiles(full_name)")
    .eq("id", id)
    .single();

  const jsonLd = image ? {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": image.title,
    "description": image.description || image.title,
    "contentUrl": image.watermarked_url || image.file_url,
    "creator": {
      "@type": "Person",
      "name": image.profiles?.full_name || "Learnpik Creator"
    },
    "acquireLicensePage": `https://learnpik.com/image/${id}`,
    "creditText": "Learnpik",
    "copyrightNotice": "Learnpik Educational Visuals",
    "datePublished": image.published_at || image.created_at
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ImageDetailClient id={id} />
    </>
  );
}
