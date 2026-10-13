/**
 * Sabi Vault - Google Drive OAuth Connector
 *
 * Implements the "Zero Raw Document Centralization" invariant:
 * - Interacts with Google Drive API v3 via OAuth 2.0 access token.
 * - Streams file content into ephemeral memory buffers.
 * - Never writes raw files to disk.
 * - Buffer is discarded immediately after parsing and SHA-256 calculation.
 */

export interface GoogleDriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  createdTime?: string;
  modifiedTime?: string;
}

export interface EphemeralStreamResult {
  fileId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}

export class GoogleDriveConnector {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Lists candidate credential files in the user's Google Drive folder.
   */
  async listCredentialsFiles(): Promise<GoogleDriveFileMetadata[]> {
    const query = encodeURIComponent(
      "mimeType = 'application/pdf' or mimeType contains 'image/' and trashed = false"
    );
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,size,createdTime,modifiedTime)&pageSize=20`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Google Drive API error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return data.files || [];
  }

  /**
   * Ephemerally fetches the file binary stream into memory.
   * STRICT INVARIANT: This buffer is NEVER written to local disk or centralized S3.
   */
  async fetchFileBuffer(fileId: string, fileName: string, mimeType: string): Promise<EphemeralStreamResult> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to stream file from Google Drive (${res.status}): ${await res.text()}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      fileId,
      fileName,
      mimeType,
      buffer,
    };
  }
}

