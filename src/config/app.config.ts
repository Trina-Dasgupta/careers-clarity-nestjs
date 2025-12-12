export const appConfig = {
  port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  cors: {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
},

  uploads: {
    destination: process.env.UPLOAD_DEST || 'uploads',
    maxFileSize:
      parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '', 10) || 5 * 1024 * 1024,
    allowedMimeTypes: (
      process.env.UPLOAD_ALLOWED_MIME_TYPES ||
      'image/jpeg,image/png,application/pdf'
    )
      .split(',')
      .map((type) => type.trim())
      .filter(Boolean),
  },
};
