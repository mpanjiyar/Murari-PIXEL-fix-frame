/**
 * Google Drive REST API Service helpers for saving and restoring portfolio configurations.
 */

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
  webViewLink?: string;
}

/**
 * Upload backup dataset to Google Drive
 */
export async function uploadBackupToDrive(
  accessToken: string,
  backupData: any,
  filename: string
): Promise<{ id: string; name: string }> {
  const boundary = 'pixelframes_drive_backup_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    mimeType: 'application/json',
    description: 'Automated Backup for Murari Panjiyar Portfolio (Pixel Fix & Pixel Frame)'
  };

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(backupData, null, 2) +
    close_delim;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: body,
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error('Google Drive Upload Failed:', errorDetails);
    throw new Error(`Google Drive upload failed with status ${response.status}: ${errorDetails}`);
  }

  return response.json();
}

/**
 * List existing backup files on Google Drive (both manual and auto-saves)
 */
export async function listBackupsOnDrive(accessToken: string): Promise<DriveBackupFile[]> {
  const query = encodeURIComponent(
    "(name contains 'PixelFrames_Backup_' or name = 'PixelFrames_LiveSync.json') and mimeType = 'application/json' and trashed = false"
  );
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime,size,webViewLink)&orderBy=createdTime%20desc`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to list backups from Google Drive: ${errorDetails}`);
  }

  const result = await response.json();
  return result.files || [];
}

/**
 * Intelligent Upsert to save or update the Live Sync Backup document in Google Drive
 */
export async function upsertLiveSyncBackup(
  accessToken: string,
  backupData: any
): Promise<{ id: string; name: string }> {
  // 1. Search for any existing file with the name 'PixelFrames_LiveSync.json'
  const query = encodeURIComponent("name = 'PixelFrames_LiveSync.json' and trashed = false");
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchResponse.ok) {
    const searchError = await searchResponse.text();
    console.warn('Silent search warning:', searchError);
  } else {
    const searchResult = await searchResponse.json();
    const existingFiles = searchResult.files || [];
    
    if (existingFiles.length > 0) {
      const fileId = existingFiles[0].id;
      
      // 2. Perform a media PUT/PATCH update to replace the file content in-place
      const updateResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backupData, null, 2),
        }
      );

      if (updateResponse.ok) {
        return { id: fileId, name: 'PixelFrames_LiveSync.json' };
      } else {
        const updateError = await updateResponse.text();
        console.error('In-place update failed, falling back to clean recreate:', updateError);
        // Fall through to creating a new one if update fails
      }
    }
  }

  // 3. Fallback: Create a brand new file
  return uploadBackupToDrive(accessToken, backupData, 'PixelFrames_LiveSync.json');
}

/**
 * Create a folder or return the ID of an existing one with that name in Google Drive
 */
export async function getOrCreateFolder(accessToken: string, folderName: string): Promise<string> {
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (searchResponse.ok) {
    const searchResult = await searchResponse.json();
    if (searchResult.files && searchResult.files.length > 0) {
      return searchResult.files[0].id;
    }
  }

  const createResponse = await fetch(
    'https://www.googleapis.com/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );

  if (!createResponse.ok) {
    throw new Error('Could not prepare or create the Google Drive destination folder.');
  }

  const newFolder = await createResponse.json();
  return newFolder.id;
}

/**
 * Upload a raw photo (either base64 data-url or remote http image) to a specific Drive folder
 */
export async function uploadPhotoFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  photoUrl: string
): Promise<{ id: string }> {
  let blob: Blob;

  if (photoUrl.startsWith('data:')) {
    const parts = photoUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    blob = new Blob([u8arr], { type: mime });
  } else {
    try {
      const fetchImage = await fetch(photoUrl, { referrerPolicy: 'no-referrer' });
      blob = await fetchImage.blob();
    } catch (err) {
      throw new Error(`CORS policy restricts directly downloading external files: "${photoUrl}". Please upload local image files to save them directly.`);
    }
  }

  const boundary = 'pixelframes_image_upload_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  let ext = 'jpg';
  if (blob.type === 'image/png') ext = 'png';
  else if (blob.type === 'image/webp') ext = 'webp';
  else if (blob.type === 'image/gif') ext = 'gif';

  const cleanFilename = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fullFileName = cleanFilename.endsWith('.' + ext) ? cleanFilename : `${cleanFilename}.${ext}`;

  const metadata = {
    name: fullFileName,
    parents: [folderId]
  };

  const arrayBuffer = await blob.arrayBuffer();
  const metadataPart = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + delimiter;
  
  const prefixBlob = new Blob([metadataPart], { type: 'text/plain' });
  const suffixBlob = new Blob([`\r\nContent-Type: ${blob.type}\r\n\r\n`, arrayBuffer, close_delim]);
  const finalMultipartBlob = new Blob([prefixBlob, suffixBlob], { type: `multipart/related; boundary=${boundary}` });

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: finalMultipartBlob,
    }
  );

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Google Drive media upload failed: ${errorMsg}`);
  }

  return response.json();
}

/**
 * Download a backup file from Google Drive and parse its JSON content
 */
export async function downloadBackupFromDrive(accessToken: string, fileId: string): Promise<any> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to download backup document from Google Drive: ${errorDetails}`);
  }

  return response.json();
}

/**
 * Delete a specific backup file from Google Drive
 */
export async function deleteBackupFromDrive(accessToken: string, fileId: string): Promise<boolean> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Failed to delete Google Drive backup item: ${errorDetails}`);
  }

  return true;
}
