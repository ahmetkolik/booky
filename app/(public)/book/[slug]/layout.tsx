import type { Metadata } from "next";
import appConfig from "@/app.config";
import { bookingPage } from "@/lib/demo/data";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/client";

async function lookupBusiness(slug: string) {
  if (supabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
    if (data) {
      return {
        business: data.name as string,
        tagline: (data.category as string) ?? "",
        address: (data.address as string) ?? "",
        rating: 0,
        reviews: 0,
        found: true,
      };
    }
    // Real backend, unknown slug: not a page search engines should index.
    if (slug !== "demo") return null;
  }
  return {
    business: bookingPage.business,
    tagline: bookingPage.tagline.tr,
    address: bookingPage.address,
    rating: bookingPage.rating,
    reviews: bookingPage.reviews,
    found: true,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await lookupBusiness(slug);
  if (!business) {
    return { title: `${appConfig.name} — Online Randevu`, robots: { index: false, follow: false } };
  }
  const title = `${business.business} — Online Randevu Al`;
  const description = `${business.business} için online randevu alın. ${business.tagline} ${appConfig.name} ile 7/24 rezervasyon.`;
  const url = `https://${appConfig.domain}/book/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function BookSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await lookupBusiness(slug);
  if (!business) return <>{children}</>;
  // Only claim a rating when there are real reviews behind it — Google treats
  // an AggregateRating with no reviews as misleading structured data.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business,
    ...(business.address ? { address: business.address } : {}),
    ...(business.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.reviews,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
