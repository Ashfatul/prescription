const required = ["DATABASE_URL", "JWT_SECRET"] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Missing required env: ${key}`);
  }
});

export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "PPMS",
  brandColor: process.env.NEXT_PUBLIC_BRAND_COLOR || "#0f766e",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};
