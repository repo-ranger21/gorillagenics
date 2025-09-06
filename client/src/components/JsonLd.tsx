import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
}

// Helper functions to generate structured data

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GuerillaGenics",
    "description": "NFL DFS & Betting Analytics Platform with BioBoost scores and Juice Watch alerts",
    "url": window.location.origin,
    "logo": `${window.location.origin}/images/guerilla-logo.svg`,
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/GuerillaGenics",
      `https://discord.gg/${import.meta.env.VITE_DISCORD_INVITE_URL?.split('/').pop() || 'ZaRJJdQN'}`,
      import.meta.env.VITE_SUBSTACK_PUBLICATION || 'https://substack.com/@guerillagenics'
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": `https://discord.gg/${import.meta.env.VITE_DISCORD_INVITE_URL?.split('/').pop() || 'ZaRJJdQN'}`
    },
    "offers": {
      "@type": "Offer",
      "description": "Premium NFL DFS Analytics and Weekly Picks",
      "price": "10.00",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": import.meta.env.VITE_SUBSTACK_PUBLICATION || 'https://substack.com/@guerillagenics'
    }
  };
}

export function articleSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  author: string;
  publishedAt: string;
  modifiedAt?: string;
  coverImage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "url": `${window.location.origin}/blog/${post.slug}`,
    "datePublished": post.publishedAt,
    "dateModified": post.modifiedAt || post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author,
      "url": `${window.location.origin}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": "GuerillaGenics",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/images/guerilla-logo.svg`
      }
    },
    "image": post.coverImage ? `${window.location.origin}${post.coverImage}` : undefined,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${window.location.origin}/blog/${post.slug}`
    },
    "keywords": ["NFL", "DFS", "Fantasy Football", "Betting", "Analytics"],
    "articleSection": "Sports Betting",
    "wordCount": post.excerpt.length * 8 // Rough estimate
  };
}

export function sportsEventSchema(game: {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  week: number;
  season: number;
}) {
  const gameDate = new Date(game.gameTime);
  
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${game.awayTeam} @ ${game.homeTeam} - Week ${game.week}`,
    "description": `NFL Week ${game.week} matchup: ${game.awayTeam} visits ${game.homeTeam}`,
    "startDate": gameDate.toISOString(),
    "sport": "American Football",
    "url": `${window.location.origin}/weekly-picks?game=${game.gameId}`,
    "competitor": [
      {
        "@type": "SportsTeam",
        "name": game.homeTeam,
        "sport": "American Football"
      },
      {
        "@type": "SportsTeam", 
        "name": game.awayTeam,
        "sport": "American Football"
      }
    ],
    "organizer": {
      "@type": "SportsOrganization",
      "name": "National Football League",
      "sport": "American Football"
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "offers": {
      "@type": "Offer",
      "description": `Premium analysis and picks for ${game.awayTeam} @ ${game.homeTeam}`,
      "price": "10.00",
      "priceCurrency": "USD",
      "url": import.meta.env.VITE_SUBSTACK_PUBLICATION || 'https://substack.com/@guerillagenics'
    }
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function reviewSchema(reviews: Array<{
  author: string;
  rating: number;
  text: string;
  date: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "GuerillaGenics NFL DFS Analytics",
    "description": "Premium NFL DFS analytics and weekly picks",
    "brand": {
      "@type": "Brand",
      "name": "GuerillaGenics"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
      "reviewCount": reviews.length,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.text,
      "datePublished": review.date
    }))
  };
}