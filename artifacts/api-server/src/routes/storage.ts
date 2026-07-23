import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from '@workspace/api-zod';
import { Router, type IRouter, type Request, type Response } from 'express';

import { ObjectNotFoundError, ObjectStorageService } from '../lib/objectStorage';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

function hasAuthenticatedSession(
  req: Request,
): req is Request & { isAuthenticated: () => boolean } {
  if (
    !('isAuthenticated' in req) ||
    typeof req.isAuthenticated !== 'function'
  ) {
    return false;
  }

  return req.isAuthenticated();
}

/**
 * POST /storage/uploads/request-url
 *
 * Request a signed Supabase Storage upload URL + token for a file.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 *
 * IMPORTANT: Supabase signed upload URLs are NOT plain PUT endpoints.
 * The client must upload using the supabase-js SDK:
 *
 *   const { createClient } = await import('@supabase/supabase-js');
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *   await supabase.storage
 *     .from('menu-images')
 *     .uploadToSignedUrl(path, token, file);
 *
 * where `path` and `token` both come from this endpoint's response
 * (objectPath, stripped of the "/objects/" prefix, and metadata.token).
 * Requires auth middleware so public callers cannot mint write-capable URLs.
 */
router.post(
  '/storage/uploads/request-url',
  async (req: Request, res: Response) => {
    if (!hasAuthenticatedSession(req)) {
      res.status(401).json({ error: 'Unauthorized' });

      return;
    }

    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    try {
      const { name, size, contentType } = parsed.data;

      const { uploadURL, objectPath, token, bucketPath } =
        await objectStorageService.getObjectEntityUploadURL();

      res.json({
        ...RequestUploadUrlResponse.parse({ uploadURL, objectPath }),
        // Extra fields (not in the shared zod schema) needed by the
        // frontend's supabase-js uploadToSignedUrl(bucketPath, token, file) call.
        token,
        bucketPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve object entities from the Supabase "menu-images" bucket.
 * Since the bucket is public, this mainly exists as a stable internal path
 * (/objects/uploads/xxx) that MenuForm.tsx already knows how to save as
 * imageUrl. If you'd rather point <img> tags straight at Supabase's public
 * URL, use objectStorageService.getPublicUrl(objectPath) instead.
 */
router.get('/storage/objects/*path', async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;
    const objectPath = `/objects/${wildcardPath}`;

    const response = await objectStorageService.downloadObject(objectPath);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, 'Object not found');
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    req.log.error({ err: error }, 'Error serving object');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;
