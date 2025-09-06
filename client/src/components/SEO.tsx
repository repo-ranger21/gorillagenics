import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: object;
}

export default function SEO({
  title = "GuerillaGenics - Jungle DFS NFL Predictions",
  description = "Advanced NFL DFS predictions powered by BioBoost analytics and responsible gambling tools",
  image = "/images/og-image.png",
  url = "https://guerillagenics.app",
  type = "website",
  keywords = "NFL DFS, daily fantasy sports, NFL predictions, bioboost, responsible gambling",
  author = "GuerillaGenics Team",
  publishedTime,
  modifiedTime,
  schema
}: SEOProps) {
  const absoluteImage = image.startsWith('http')
    ? image
    : `${window.location.origin}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="GuerillaGenics" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@GuerillaGenics" />
      <meta name="twitter:creator" content="@GuerillaGenics" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Additional SEO */}
      <meta name="theme-color" content="#10B981" />
      <meta name="msapplication-TileColor" content="#10B981" />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}