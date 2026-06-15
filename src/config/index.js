require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  nodeEnv: process.env.NODE_ENV,
  appName: process.env.APP_NAME || 'WAD Capstone API',
  version: process.env.APP_VERSION || '1.0.0',
  appVersion: process.env.APP_VERSION || '1.0.0',
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
