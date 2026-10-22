/**
 * SabiProfile - Dropbox OAuth API v2 Connector
 *
 * Implements the "Zero Raw Document Centralization" invariant:
 * - Interacts with Dropbox API v2 via OAuth 2.0 access token.
 * - Streams file content directly into user's private Dropbox storage.
 * - Ephemerally downloads file content into memory buffers.
 * - Never writes raw files to local SabiProfile server disk.
 */

export interface DropboxUploadResult {
  id: string;
  path: string;
  name: string;
  size: number;
  clientModified: string;
}

export interface DropboxFileEntry {
  name: string;
  path: string;
  id: string;
  size?: number;
}

export class DropboxConnector {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Uploads a document to user's private Dropbox folder.
   * Path should be e.g. "/SabiProfile Vault/Finance/statement.pdf"
   */
  async uploadFile(
    remotePath: string,
    buffer: Buffer
  ): Promise<DropboxUploadResult> {
    const formattedPath = remotePath.startsWith("/") ? remotePath : `/${remotePath}`;
    const url = "https://content.dropboxapi.com/2/files/upload";

    const apiArg = JSON.stringify({
      path: formattedPath,
      mode: "add",
      autorename: true,
      mute: false,
      strict_conflict: false,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Dropbox-API-Arg": apiArg,
        "Content-Type": "application/octet-stream",
      },
      body: new Uint8Array(buffer),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Dropbox upload failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      path: data.path_display || data.path_lower || formattedPath,
      name: data.name,
      size: data.size || buffer.length,
      clientModified: data.client_modified || new Date().toISOString(),
    };
  }

  /**
   * Downloads a file stream into ephemeral memory buffer.
   * STRICT INVARIANT: Buffer must be zeroed out after processing.
   */
  async downloadFile(remotePath: string): Promise<Buffer> {
    const formattedPath = remotePath.startsWith("/") ? remotePath : `/${remotePath}`;
    const url = "https://content.dropboxapi.com/2/files/download";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path: formattedPath }),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Dropbox download failed (${res.status}): ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Creates a folder in user's Dropbox.
   * Silently ignores if folder already exists (409 conflict).
   */
  async createFolder(path: string): Promise<void> {
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    const url = "https://api.dropboxapi.com/2/files/create_folder_v2";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: formattedPath,
        autorename: false,
      }),
    });

    if (!res.ok) {
      if (res.status === 409) {
        // Folder already exists or path conflict, which is safe to ignore
        return;
      }
      const errText = await res.text();
      throw new Error(`Dropbox createFolder error (${res.status}): ${errText}`);
    }
  }

  /**
   * Lists files in user's vault folder.
   */
  async listFolder(path: string = "/SabiProfile Vault"): Promise<DropboxFileEntry[]> {
    const formattedPath = path.startsWith("/") ? path : `/${path}`;
    const url = "https://api.dropboxapi.com/2/files/list_folder";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: formattedPath,
        recursive: false,
        include_media_info: false,
        include_deleted: false,
      }),
    });

    if (!res.ok) {
      if (res.status === 409) {
        // Path not found, return empty
        return [];
      }
      const errText = await res.text();
      throw new Error(`Dropbox listFolder error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return (data.entries || []).map((e: any) => ({
      name: e.name,
      path: e.path_display || e.path_lower,
      id: e.id,
      size: e.size,
    }));
  }
}

