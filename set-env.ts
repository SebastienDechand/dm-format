import { writeFile } from 'fs';
import { join } from 'path';

require('dotenv').config();

interface EnvConfig {
  API_URL?: string;
  CLOUDINARY_CLOUDNAME?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
  RECAPTCHA_SITEKEY?: string;
  EMAILJS_USERID?: string;
  EMAILJS_SERVICEID?: string;
  EMAILJS_TEMPLATEID?: string;
}

const env = process.env as EnvConfig;

const targetPath = join(__dirname, 'src/environments/environment.prod.ts');

const envFileContent = `// 🔐 File generated automatically at build time
export const environment = {
  production: true,
  apiUrl: '${env['API_URL']}',
  cloudinary: {
    cloudName: '${env['CLOUDINARY_CLOUDNAME']}',
    upload_preset: '${env['CLOUDINARY_UPLOAD_PRESET']}',
  },
  recaptcha: {
    siteKey: '${env['RECAPTCHA_SITEKEY']}',
  },
  emailjs: {
    userId: '${env['EMAILJS_USERID']}',
    serviceId: '${env['EMAILJS_SERVICEID']}',
    templateId: '${env['EMAILJS_TEMPLATEID']}',
  }
};
`;

writeFile(targetPath, envFileContent, (err) => {
  if (err) {
    console.error(
      '❌ Erreur lors de la génération de environment.prod.ts :',
      err
    );
    process.exit(1);
  } else {
    console.log('✅ environment.prod.ts généré avec succès !');
  }
});
