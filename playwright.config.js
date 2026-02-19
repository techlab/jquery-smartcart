import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './test',
    testMatch: '**/*.e2e.{js,ts}',
    use: {
        baseURL: 'http://localhost:3002',
        headless: true,
    },
    webServer: {
        command: 'npm run dev',
        port: 3002,
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
});
