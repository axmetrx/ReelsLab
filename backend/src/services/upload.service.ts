export const generatePresignedUpload = (courseId: string, fileName: string) => {
  const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || '';
  const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || '';

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
  const timestamp = Date.now();
  
  const path = `/videos/${courseId}/${timestamp}-${sanitizedFileName}`;
  const uploadUrl = `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}${path}`;
  
  const headers = {
    'AccessKey': BUNNY_STORAGE_API_KEY,
    'Content-Type': 'application/octet-stream',
  };

  return {
    uploadUrl,
    cdnPath: path,
    headers,
  };
};
