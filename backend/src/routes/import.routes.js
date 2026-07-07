import { Router } from 'express';
import { uploadCsv } from '../middleware/upload.middleware.js';
import { importCsv } from '../controllers/import.controller.js';

const router = Router();

/**
 * POST /api/import
 * Multipart upload (field: "file") OR JSON body { csv }.
 * Returns AI-extracted CRM records + skipped rows + totals.
 */
router.post('/import', uploadCsv, importCsv);

export default router;
