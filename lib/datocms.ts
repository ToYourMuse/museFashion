// lib/datocms.ts
import { executeQuery } from '@datocms/cda-client';

export const performRequest = (query: string, options: any = {}) => {
  // Ensure the environment variable is available
  const apiToken = process.env.NEXT_DATOCMS_API_TOKEN || process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN;
  
  if (!apiToken) {
    console.error('DatoCMS API token is not defined');
    throw new Error('DatoCMS API token is missing');
  }
  
  return executeQuery(query, {
    ...options,
    token: apiToken,
    environment: process.env.NEXT_DATOCMS_ENVIRONMENT || 'main',
  });
};