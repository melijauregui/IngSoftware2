import * as dotenv from 'dotenv';
dotenv.config();

const {
  PORT,
  HOSTNAME,
  POSTGRES_ROOT_PASSWORD,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_PORT,
  DB_HOST,
  ENVIRONMENT,
  DATABASE_URL,
} = process.env;
const REQUIRED_VARS = {
  PORT,
  HOSTNAME,
  POSTGRES_ROOT_PASSWORD,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_PORT,
  DB_HOST,
  ENVIRONMENT,
  DATABASE_URL,
};

// Check if any required variable is missing
const missingVars = Object.entries(REQUIRED_VARS).filter(
  ([key, value]) => !value
);
if (missingVars.length > 0) {
  throw new Error(
    `❌ Missing environment variables: ${missingVars
      .map(([key]) => key)
      .join(', ')}`
  );
}

// Export the variables for easy use
export const config = {
  PORT,
  HOSTNAME,
  POSTGRES_ROOT_PASSWORD,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_PORT,
  DB_HOST,
  ENVIRONMENT: ENVIRONMENT || 'development',
  DATABASE_URL,
};
