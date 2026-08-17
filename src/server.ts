import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

/**
 * Serve static files from /browser
 */
app.get(
  '*.*',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  })
);

// Route pour le sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    // Importation des modules nécessaires
    const fetch = (await import('node-fetch')).default;

    // URL de votre API
    const apiUrl = process.env['API_URL'] || 'https://votreapi.com';

    // Récupération des formations
    const response = await fetch(`${apiUrl}/trainings`);
    const programs = await response.json();

    // Génération du sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Pages statiques
    sitemap += createUrlEntry('https://dm-format.fr/', '1.0', 'daily');
    sitemap += createUrlEntry('https://dm-format.fr/about', '0.8', 'monthly');
    sitemap += createUrlEntry(
      'https://dm-format.fr/organisation',
      '0.7',
      'monthly'
    );
    sitemap += createUrlEntry('https://dm-format.fr/contact', '0.8', 'monthly');

    // Pages dynamiques des formations
    if (programs && Array.isArray(programs)) {
      programs.forEach((program) => {
        sitemap += createUrlEntry(
          `https://dm-format.fr/trainings/${program.id}`,
          '0.9',
          'weekly'
        );
      });
    }

    sitemap += '</urlset>';

    // Envoi du sitemap
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    res.status(500).send('Erreur lors de la génération du sitemap');
  }
});

// Fonction utilitaire pour créer une entrée URL
function createUrlEntry(
  url: string,
  priority: string,
  changefreq: string
): string {
  const today = new Date().toISOString().split('T')[0];
  return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>\n  </url>\n`;
}

// Route pour robots.txt (si non servi par les fichiers statiques)
app.get('/robots.txt', (req, res) => {
  res.sendFile(join(browserDistFolder, 'robots.txt'));
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('*', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
