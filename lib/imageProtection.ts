import { getSubjectColor } from "./utils";

// Mock Visual Database for Validation
const databaseImages = [
  { id: "1", title: "Plant Cell Structure Diagram", isPremium: false },
  { id: "2", title: "Organic Chemistry Reaction Mechanism", isPremium: true },
  { id: "3", title: "Sigiriya Rock Fortress 3D Layout", isPremium: false },
  { id: "4", title: "Gravitational Field Equations Map", isPremium: true },
  { id: "5", title: "the World Climatic Zones Map", isPremium: false },
  { id: "6", title: "SQL Database Schema Mind Map", isPremium: false },
  { id: "7", title: "AC Generator Vector Diagram", isPremium: true },
  { id: "8", title: "Human Respiratory System Diagram", isPremium: false },
];

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether a user is allowed to download a specific image.
 */
export function validateDownloadAccess(
  user: { email: string; role: string; tier: "Free" | "Premium" | string } | null,
  imageId: string,
  dailyDownloadsCount: number = 0
): ValidationResult {
  const image = databaseImages.find((img) => img.id === imageId);

  // If image is not found, default to free validation
  const isImagePremium = image ? image.isPremium : false;

  if (isImagePremium) {
    if (!user || user.tier !== "Premium") {
      return {
        allowed: false,
        reason: "This is a Premium visual. Please upgrade to a Premium subscription to download.",
      };
    }
    return { allowed: true };
  }

  // Free visual checks
  if (!user) {
    return {
      allowed: false,
      reason: "Authentication required. Please sign in to download educational resources.",
    };
  }

  // Check daily limit for free user (5 per day)
  if (user.tier !== "Premium" && dailyDownloadsCount >= 5) {
    return {
      allowed: false,
      reason: "Daily download limit reached. Free accounts are limited to 5 downloads per day.",
    };
  }

  return { allowed: true };
}

/**
 * Generates a signed, temporary download URL (e.g. Cloudflare R2 presigned url)
 */
export function generateSignedDownloadUrl(
  imageId: string,
  userId: string,
  expiresInSeconds: number = 60
): string {
  const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  // Secure signed URL simulation
  const signature = Buffer.from(`${imageId}:${userId}:${expirationTime}:edu_secure_secret`).toString("base64").substring(0, 16);
  
  const signedUrl = `https://cdn.eduvisuals.com/secure-downloads/${imageId}?token=${signature}&expires=${expirationTime}`;
  
  console.log(`[SIGNED URL GENERATED] Image: ${imageId} | User: ${userId} | Expires: ${new Date(expirationTime * 1000).toISOString()}`);
  
  return signedUrl;
}

/**
 * Adds watermarks and invisible metadata to image files.
 * We include a graceful try/catch block around sharp to prevent build crashes in case of local binary loading issues.
 */
export async function addWatermark(
  imageBuffer: Buffer,
  userId: string
): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;
    
    // Create an SVG watermark text overlay
    const svgWatermark = `
      <svg width="400" height="60">
        <text x="10" y="40" font-family="sans-serif" font-size="24" font-weight="900" fill="rgba(0, 57, 60, 0.15)">
          EduVisuals · ID: ${userId.substring(0, 8)}
        </text>
      </svg>
    `;

    return await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: "southeast",
        },
      ])
      .withMetadata({
        exif: {
          IFD0: {
            Copyright: `EduVisuals - Protected Content for User ${userId}`,
          },
        },
      })
      .toBuffer();
  } catch (error) {
    console.warn("Sharp watermarking failed or library not fully compiled. Returning raw buffer as fallback.", error);
    return imageBuffer;
  }
}
