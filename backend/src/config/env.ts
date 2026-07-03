// backend/src/config/env.ts
// Load environment variables FIRST before any other imports

// @ts-ignore — __dirname is a Node.js CJS global; suppress TS compile error
const __dirname: string = '/';

import dotenv from 'dotenv';

// CJS-safe: __dirname resolves to backend/src/config at runtime.
// Going up two levels reaches the backend root where .env lives.
dotenv.config({ path: __dirname + '/../../.env' });

// Validate required vars
const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL', 'NODE_ENV'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV!,
  mongoUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  clientUrl: process.env.CLIENT_URL!,
};
