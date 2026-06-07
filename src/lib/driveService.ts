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
