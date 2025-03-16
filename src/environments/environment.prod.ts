export const environment = {
  production: true,
  // apiUrl: 'https://dm-format-api-production.up.railway.app/api',
  apiUrl: 'http://localhost:3000/api',
  cloudinary: {
    cloudName: 'dwftvp3ps',
    upload_preset: 'DM-Format',
  },
  recaptcha: {
    siteKey: '6LducOsqAAAAAOskpuZoj1JbI5fQxWnuMjalx9aM',
  },
  emailjs: {
    userId: 'hReg4C2juewenAAwl',
    serviceId: 'service_kw12bzr',
    templateId: 'template_g5lsqr9',
  },
};
