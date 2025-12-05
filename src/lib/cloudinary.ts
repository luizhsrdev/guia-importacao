import { v2 as cloudinary } from 'cloudinary';

// Logs para debug
console.log('Configurando Cloudinary...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Definido' : 'Não definido');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Definido' : 'Não definido');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Definido' : 'Não definido');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Usar HTTPS
});

export default cloudinary;
