// This file provides type declarations for the environment files

export interface Environment {
  production: boolean;
  apiUrl: string;
}

declare global {
  const environment: Environment;
}
