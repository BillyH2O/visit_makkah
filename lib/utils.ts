import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Converts Cloudinary HEIC images to JPG format for browser compatibility
 * Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}.{format}
 * 
 * @param url - The Cloudinary image URL
 * @returns The URL with format conversion if it's a HEIC file, otherwise returns the original URL
 */
export function convertCloudinaryHeicToJpg(url: string): string {
  if (!url) return url
  
  // Check if it's a Cloudinary URL with HEIC extension (case insensitive)
  if (/res\.cloudinary\.com.*\.heic$/i.test(url)) {
    // Check if f_jpg transformation is already present
    if (url.includes('/f_jpg/')) {
      return url
    }
    
    // Insert f_jpg transformation after /image/upload/
    // Example: /image/upload/v1766399256/IMG_1717_k5hqgq.heic
    // Result:  /image/upload/f_jpg/v1766399256/IMG_1717_k5hqgq.heic
    return url.replace(
      /(\/image\/upload\/)([^\/]*\/)?(v\d+\/)/,
      (match, uploadPart, existingTransforms, versionPart) => {
        // If there are existing transformations, check if f_jpg is already there
        if (existingTransforms && existingTransforms.includes('f_jpg')) {
          return match
        }
        // Insert f_jpg before the version or after existing transformations
        return existingTransforms 
          ? `${uploadPart}${existingTransforms}f_jpg/${versionPart}`
          : `${uploadPart}f_jpg/${versionPart}`
      }
    )
  }
  
  return url
}
