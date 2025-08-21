import * as dotenv from "dotenv";
dotenv.config();

const {
  // EXPO_PUBLIC_ANDROID_CLIENT_ID,
} = process.env;
const REQUIRED_VARS = {
  // EXPO_PUBLIC_ANDROID_CLIENT_ID,
};

// Check if any required variable is missing
const missingVars = Object.entries(REQUIRED_VARS).filter(
  ([key, value]) => !value
);
if (missingVars.length > 0) {
  throw new Error(
    `❌ Missing environment variables: ${missingVars
      .map(([key]) => key)
      .join(", ")}`
  );
}

// Export the variables for easy use
export const config = {
  // PINECONE_API_KEY: process.env.PINECONE_API_KEY as string,
};
