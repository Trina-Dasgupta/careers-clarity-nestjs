const defaultCorsOrigin =
  process.env.NODE_ENV === 'development' ? true : 'http://localhost:3000';

const corsOriginEnv = process.env.CORS_ORIGIN?.trim();

let corsOrigin: boolean | string | string[] = defaultCorsOrigin;

if (corsOriginEnv) {
  if (corsOriginEnv === '*') {
    corsOrigin = true;
  } else {
    const origins = corsOriginEnv
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
    corsOrigin = origins.length > 1 ? origins : origins[0] || defaultCorsOrigin;
  }
}

export const appConfig = {
  port: parseInt(process.env.AUTH_SERVICE_PORT || '8001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  cors: {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
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
