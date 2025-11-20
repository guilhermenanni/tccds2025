import dotenv from 'dotenv';

export const configDotenv = () => {
  const result = dotenv.config();
  if (result.error) {
    console.warn('⚠️  Arquivo .env não encontrado, usando variáveis padrão.');
  }
};
