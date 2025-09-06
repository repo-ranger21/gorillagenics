import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  keywords?: string;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  type?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
}

const defaultMeta = {
  title: 'GuerillaGenics - NFL DFS & Betting Analytics Platform',
  description: 'Get smarter NFL picks with jungle-powered DFS analytics. BioBoost scores, Juice Watch alerts, and weekly predictions that actually win.',
  image: '/images/og-image.jpg',
  keywords: 'NFL DFS, fantasy football, betting analytics, weekly picks, DraftKings, FanDuel',
  author: 'GuerillaGenics',
  type: 'website' as const,
  twitterCard: 'summary_large_image' as const
};

export default function SEO({
  title,
  description,
  canonical,
  image,
  noIndex = false,
  noFollow = false,
  keywords,
  author,
  publishedAt,
  modifiedAt,
  type = 'website',
  twitterCard = 'summary_large_image'
}: SEOProps) {
  const meta = {
    title: title ? `${title} | GuerillaGenics` : defaultMeta.title,
    description: description || defaultMeta.description,
    image: image || defaultMeta.image,
    keywords: keywords || defaultMeta.keywords,
    author: author || defaultMeta.author,
    canonical: canonical || window.location.href,
    type,
    twitterCard
  };

  // Ensure absolute URL for image
  const absoluteImage = meta.image.startsWith('http') 
    ? meta.image 
    : `${window.location.origin}${meta.image}`;

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta name="author" content={meta.author} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={meta.canonical} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content="GuerillaGenics" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={meta.twitterCard} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:site" content="@GuerillaGenics" />
      <meta name="twitter:creator" content="@GuerillaGenics" />
      
      {/* Article-specific Meta Tags */}
      {type === 'article' && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === 'article' && modifiedAt && (
        <meta property="article:modified_time" content={modifiedAt} />
      )}
      {type === 'article' && (
        <>
          <meta property="article:author" content={meta.author} />
          <meta property="article:section" content="Sports Betting" />
          <meta property="article:tag" content="NFL" />
          <meta property="article:tag" content="DFS" />
          <meta property="article:tag" content="Fantasy Football" />
        </>
      )}
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#0B3D2E" />
      <meta name="msapplication-TileColor" content="#0B3D2E" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "GuerillaGenics",
          "description": defaultMeta.description,
          "url": window.location.origin,
          "logo": `${window.location.origin}/images/guerilla-logo.svg`,
          "sameAs": [
            "https://twitter.com/GuerillaGenics",
            `https://discord.gg/${import.meta.env.VITE_DISCORD_INVITE_URL?.split('/').pop() || 'ZaRJJdQN'}`,
            import.meta.env.VITE_SUBSTACK_PUBLICATION || 'https://substack.com/@guerillagenics'
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "url": `https://discord.gg/${import.meta.env.VITE_DISCORD_INVITE_URL?.split('/').pop() || 'ZaRJJdQN'}`
          }
        })}
      </script>
    </Helmet>
  );
}