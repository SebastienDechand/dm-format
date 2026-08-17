const { writeFile } = require('fs');
const { join } = require('path');
require('dotenv').config();

const SITE_URL = 'https://dm-format.fr';
const apiUrl =
  process.env.API_URL || 'https://dm-format-api-production.up.railway.app/api';

const targetPath = join(__dirname, 'public/sitemap.xml');

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/organisation', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
];

function urlEntry(path, priority, changefreq) {
  const today = new Date().toISOString().split('T')[0];
  return [
    '  <url>',
    `    <loc>${SITE_URL}${path}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function generateSitemap() {
  let trainingIds = [];
  try {
    const response = await fetch(`${apiUrl}/trainings`);
    const programs = await response.json();
    if (Array.isArray(programs)) {
      trainingIds = programs.map((p) => p.id || p._id).filter(Boolean);
    }
  } catch (err) {
    console.warn(
      '⚠️ Impossible de récupérer les formations, sitemap limité aux pages statiques :',
      err.message
    );
  }

  const entries = [
    ...staticPages.map((p) => urlEntry(p.path, p.priority, p.changefreq)),
    ...trainingIds.map((id) => urlEntry(`/trainings/${id}`, '0.9', 'weekly')),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  writeFile(targetPath, sitemap, (err) => {
    if (err) {
      console.error('❌ Erreur génération sitemap.xml :', err);
      process.exit(1);
    } else {
      console.log(
        `✅ sitemap.xml généré (${staticPages.length} pages statiques, ${trainingIds.length} formations).`
      );
    }
  });
}

generateSitemap();
