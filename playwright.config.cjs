const { defineConfig } = require('@playwright/test')
module.exports = defineConfig({
 testDir:'./tests/browser', timeout:45000,
 use:{baseURL:process.env.TEST_URL || 'http://127.0.0.1:9001',headless:true},
 webServer:process.env.TEST_URL ? undefined : {command:'npm run preview',url:'http://127.0.0.1:9001',reuseExistingServer:!process.env.CI},
 projects:[{name:'chromium',use:{browserName:'chromium'}}]
})
