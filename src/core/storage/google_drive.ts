/**
 * SabiProfile - Google Drive OAuth Connector
 *
 * Implements the "Zero Raw Document Centralization" invariant:
 * - Interacts with Google Drive API v3 via OAuth 2.0 access token.
 * - Streams file content into ephemeral memory buffers.
 * - Never writes raw files to local SabiProfile server disk.
 * - Uploads documents directly to user's private Google Drive vault.
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

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink?: string;
  mimeType: string;
  size: number;
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

  /**
   * Finds a folder by name, optionally inside a specific parent folder.
   */
  async getFolderIdByName(folderName: string, parentId?: string): Promise<string | null> {
    let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
    if (parentId) {
      q += ` and '${parentId}' in parents`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  }

  /**
   * Creates a folder in Google Drive. Returns the folder ID.
   */
  async createVaultFolder(folderName: string, parentId?: string): Promise<string> {
    const existingId = await this.getFolderIdByName(folderName, parentId);
    if (existingId) {
      return existingId;
    }

    const metadata: Record<string, any> = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    if (parentId) {
      metadata.parents = [parentId];
    }

    const res = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create Google Drive folder (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.id;
  }

  /**
   * Uploads a file directly into user's Google Drive via multipart upload.
   */
  async uploadFile(
    fileName: string,
    buffer: Buffer,
    mimeType: string,
    folderId?: string
  ): Promise<DriveUploadResult> {
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata: Record<string, any> = {
      name: fileName,
      mimeType: mimeType || "application/octet-stream",
    };
    if (folderId) {
      metadata.parents = [folderId];
    }

    const metadataHeader =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType || "application/octet-stream"}\r\n\r\n`;

    const metaPart = Buffer.from(metadataHeader, "utf-8");
    const closePart = Buffer.from(closeDelimiter, "utf-8");
    const multipartBody = Buffer.concat([metaPart, buffer, closePart]);

    const url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType,size";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": multipartBody.length.toString(),
      },
      body: new Uint8Array(multipartBody),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Drive upload failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      webViewLink: data.webViewLink,
      mimeType: data.mimeType || mimeType,
      size: data.size ? parseInt(data.size, 10) : buffer.length,
    };
  }
}
