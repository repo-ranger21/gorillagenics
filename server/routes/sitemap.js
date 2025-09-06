const express = require('express');
const router = express.Router();

// Mock data sources (in production, these would come from your database)
const getBlogPosts = () => [
  { slug: 'dfs-value-picks-week-1', published_at: '2024-09-03T10:00:00Z' },
  { slug: 'bankroll-management-dfs-beginners', published_at: '2024-08-28T14:30:00Z' },
  { slug: 'bioboost-system-explained', published_at: '2024-08-15T09:00:00Z' }
];

// GET /sitemap.xml - Generate sitemap
router.get('/sitemap.xml', (req, res) => {
  try {
    const baseUrl = process.env.SITE_URL || 'https://guerillagenics.app';
    const currentDate = new Date().toISOString();
    
    // Static pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0', lastmod: currentDate },
      { url: '/weekly-picks', changefreq: 'daily', priority: '0.9', lastmod: currentDate },
      { url: '/top5', changefreq: 'daily', priority: '0.9', lastmod: currentDate },
      { url: '/dashboard', changefreq: 'weekly', priority: '0.8', lastmod: currentDate },
      { url: '/testimonials', changefreq: 'weekly', priority: '0.7', lastmod: currentDate },
      { url: '/blog', changefreq: 'daily', priority: '0.8', lastmod: currentDate }
    ];
    
    // Blog posts
    const blogPosts = getBlogPosts();
    const blogPages = blogPosts.map(post => ({
      url: `/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: post.published_at
    }));
    
    // Combine all pages
    const allPages = [...staticPages, ...blogPages];
    
    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
    
    console.log(`🗺️ Generated sitemap with ${allPages.length} URLs`);
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
  }
});

// GET /robots.txt - Generate robots.txt
router.get('/robots.txt', (req, res) => {
  try {
    const baseUrl = process.env.SITE_URL || 'https://guerillagenics.app';
    const isProduction = process.env.NODE_ENV === 'production';
    
    const robots = isProduction ? `# GuerillaGenics Robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1

# Disallow admin areas
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/admin/

# Allow specific important pages
Allow: /weekly-picks
Allow: /top5
Allow: /testimonials
Allow: /blog/

# SEO directives
User-agent: Googlebot
Allow: /

User-agent: Bingbot  
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /
` : `# Development Environment - Block All Crawlers
User-agent: *
Disallow: /

# Sitemap still available for testing
Sitemap: ${baseUrl}/sitemap.xml
`;
    
    res.set('Content-Type', 'text/plain');
    res.send(robots);
    
    console.log(`🤖 Served robots.txt (${isProduction ? 'production' : 'development'} mode)`);
    
  } catch (error) {
    console.error('Robots.txt error:', error);
    res.status(500).send('# Error generating robots.txt');
  }
});

// GET /sitemap-index.xml - Sitemap index for large sites
router.get('/sitemap-index.xml', (req, res) => {
  try {
    const baseUrl = process.env.SITE_URL || 'https://guerillagenics.app';
    const currentDate = new Date().toISOString();
    
    // For larger sites, you might split sitemaps by content type
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(sitemapIndex);
    
    console.log('🗂️ Served sitemap index');
    
  } catch (error) {
    console.error('Sitemap index error:', error);
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap index</error>');
  }
});

module.exports = router;