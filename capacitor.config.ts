import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'nextn',
  webDir: 'public',
  server: {
    url: 'https://manasd.netlify.app/',
    cleartext: true
  }
};

export default config;
