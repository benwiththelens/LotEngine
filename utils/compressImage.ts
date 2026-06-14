import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file on the client-side to generate a web-ready proxy asset.
 * Targets ~800KB max, 1920px max resolution, and outputs as WebP.
 * 
 * @param file The raw File object from the file input.
 * @returns A Promise resolving to the compressed File, or the original File if compression fails.
 */
export const generateProxy = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // Returning a File object instead of a Blob to maintain compatibility with standard uploaders
    return new File([compressedFile], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed, returning original file as failsafe:", error);
    return file;
  }
};
