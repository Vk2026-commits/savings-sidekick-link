import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgetflow.app',
  appName: 'BudgetFlow',
  webDir: 'dist',
  server: {
    url: "https://7c4c2f41-4189-4250-82ef-315830e0c512.lovableproject.com?forceHideBadge=true",
    cleartext: true
  }
};

export default config;
