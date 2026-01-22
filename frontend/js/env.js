/**
 * Environment Configuration
 * This file is used to configure the application environment.
 * The backend/scripts/sync-env.js script may overwrite this in development.
 */

const ENV = {
    // WhatsApp Configuration
    WHATSAPP_PHONE: '201149219332',

    // Backend API
    // In production (Vercel), we use relative path /api
    // In development, this may be overwritten to http://localhost:5001/api by sync-env.js
    API_URL: '/api'
};

// Make ENV available globally
window.ENV = ENV;
