import multer from 'multer';
import { env } from '../config/env.js';

/**
 * In-memory upload handling for a single CSV file.
 * We keep the file in memory (never touch disk) because CSVs here are small
 * (<= a few MB) and it keeps hosting stateless and container-friendly.
 */
const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  const name = (file.originalname || '').toLowerCase();
  const isCsv =
    name.endsWith('.csv') ||
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'text/plain';
  if (isCsv) return cb(null, true);
  return cb(new Error('Only .csv files are allowed.'));
}

export const uploadCsv = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
}).single('file');
