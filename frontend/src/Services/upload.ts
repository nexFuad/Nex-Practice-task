/** Uploads an image to Cloudinary. Upload implementation stays outside UI components. */
export async function uploadImage(file: File | Blob) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset)
    throw new Error("Cloudinary upload is not configured.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!response.ok) throw new Error("Image upload failed.");
  const result = (await response.json()) as { secure_url?: string };
  if (!result.secure_url) throw new Error("Image upload did not return a URL.");
  return result.secure_url;
}
