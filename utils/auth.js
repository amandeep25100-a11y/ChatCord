/**
 * Auth0 Authentication Middleware
 * 
 * Provides authentication utilities for the ChatCord app
 */

const { auth, requiresAuth } = require('express-openid-connect');

/**
 * Get Auth0 configuration from environment variables
 */
function getAuth0Config() {
  // Check if Auth0 is configured
  if (!process.env.AUTH0_SECRET || !process.env.AUTH0_CLIENT_ID) {
    console.log('⚠️  Auth0 not configured - running without authentication');
    return null;
  }

  const config = {
    authRequired: false, // Don't require auth for all routes
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    routes: {
      login: '/login',
      logout: '/logout',
      callback: '/callback'
    },
    session: {
      cookie: {
        domain: undefined,
        path: '/',
        transient: false,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      },
      name: 'chatcord_session',
      rolling: true,
      rollingDuration: 24 * 60 * 60 // 24 hours
    }
  };

  console.log('✅ Auth0 configured');
  return config;
}

/**
 * Middleware to pass user info to views
 */
function userInfoMiddleware(req, res, next) {
  res.locals.user = req.oidc?.user || null;
  res.locals.isAuthenticated = req.oidc?.isAuthenticated() || false;
  next();
}

/**
 * Check if Auth0 is enabled
 */
function isAuth0Enabled() {
  return !!(process.env.AUTH0_SECRET && process.env.AUTH0_CLIENT_ID);
}

module.exports = {
  auth,
  requiresAuth,
  getAuth0Config,
  userInfoMiddleware,
  isAuth0Enabled
};
