import path from "path";
import { Router } from "express";
import multer from "multer";
import * as uploadController from "../controllers/upload.controller";

const ALLOWED_EXTENSIONS = new Set([".hl7", ".json", ".xml", ".txt"]);
const ALLOWED_MIMETYPES  = new Set([
    "application/json",
    "application/xml",
    "application/octet-stream",
    "text/plain",
    "text/xml",
    "text/hl7v2",
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIMETYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Dateityp nicht unterstützt: ${file.originalname}`));
        }
    },
});

const router = Router();

router.post("/", upload.single("file"), uploadController.uploadFile);

export default router;