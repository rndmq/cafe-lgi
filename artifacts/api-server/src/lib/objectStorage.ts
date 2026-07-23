import { randomUUID } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'menu-images';

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

let cachedClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  // service_role key — server-side only, bypasses RLS. Never expose to the client.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Add them to your ' +
        'Vercel project environment variables.',
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedClient;
}

/**
 * ObjectStorageService
 *
 * Thin wrapper around a Supabase Storage bucket (default: "menu-images").
 * The bucket is expected to be PUBLIC, so uploaded files are readable via
 * their public URL without any extra ACL/auth logic.
 */
export class ObjectStorageService {
  private get bucket() {
    return getSupabaseAdmin().storage.from(BUCKET_NAME);
  }

  /**
   * Creates a signed upload URL the client can PUT/POST the file to directly,
   * without the file ever passing through our server.
   * Returns both the URL to upload to and the storage-relative object path
   * to save on the menu record once the upload succeeds.
   */
  async getObjectEntityUploadURL(): Promise<{
    uploadURL: string;
    objectPath: string;
    bucketPath: string;
    token: string;
  }> {
    const objectId = randomUUID();
    const bucketPath = `uploads/${objectId}`;

    const { data, error } = await this.bucket.createSignedUploadUrl(
      bucketPath,
    );

    if (error || !data) {
      throw new Error(
        `Failed to create signed upload URL: ${error?.message ?? 'unknown error'}`,
      );
    }

    return {
      uploadURL: data.signedUrl,
      objectPath: `/objects/${bucketPath}`,
      bucketPath,
      token: data.token,
    };
  }

  /**
   * Resolves our internal "/objects/..." path to a public URL that can be
   * served directly to the browser (e.g. as a menu item's imageUrl).
   */
  getPublicUrl(objectPath: string): string {
    const relativePath = this.toRelativePath(objectPath);
    const { data } = this.bucket.getPublicUrl(relativePath);
    return data.publicUrl;
  }

  /**
   * Streams an object's bytes back out, for the /storage/objects/* passthrough
   * route. Throws ObjectNotFoundError if it doesn't exist.
   */
  async downloadObject(objectPath: string): Promise<Response> {
    const relativePath = this.toRelativePath(objectPath);
    const { data, error } = await this.bucket.download(relativePath);

    if (error || !data) {
      throw new ObjectNotFoundError();
    }

    const headers: Record<string, string> = {
      'Content-Type': data.type || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600',
    };

    return new Response(data, { headers });
  }

  /** Normalizes a stored "/objects/uploads/xxx" path down to its bucket-relative form. */
  private toRelativePath(objectPath: string): string {
    if (!objectPath.startsWith('/objects/')) {
      throw new ObjectNotFoundError();
    }
    return objectPath.slice('/objects/'.length);
  }
}
