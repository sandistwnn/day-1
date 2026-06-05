module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  nodeEnv: process.env.NODE_ENV,
  appName: process.env.APP_NAME || 'Task API',
  version: process.env.APP_VERSION || '1.0.0',
  appVersion: process.env.APP_VERSION || '1.0.0',
};
