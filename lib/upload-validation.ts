/**
 * Server-side file upload validation.
 *
 * Validates MIME type, file extension, size, and magic bytes
 * to prevent malicious file uploads that bypass client-side checks.
 */

type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

// ── Magic byte signatures ──────────────────────────────────────────

const SIGNATURES: Record<string, { offset: number; bytes: number[] }[]> = {
  "application/pdf": [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/png": [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }],
  "image/gif": [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }], // GIF8
  "image/webp": [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // WEBP
  ],
};

async function matchesMagicBytes(
  file: File,
  mime: string
): Promise<boolean> {
  const sigs = SIGNATURES[mime];
  if (!sigs) return false;

  const needed = Math.max(...sigs.map((s) => s.offset + s.bytes.length));
  const buf = new Uint8Array(await file.slice(0, needed).arrayBuffer());

  return sigs.every((sig) =>
    sig.bytes.every((b, i) => buf[sig.offset + i] === b)
  );
}

// ── Validators ─────────────────────────────────────────────────────

const RESUME_MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const RESUME_ALLOWED_MIMES = new Set(["application/pdf"]);
const RESUME_ALLOWED_EXTS = new Set([".pdf"]);

const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const IMAGE_ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const IMAGE_ALLOWED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

export async function validateResumeFile(file: File): Promise<ValidationResult> {
  const ext = getExtension(file.name);

  if (!RESUME_ALLOWED_MIMES.has(file.type) || !RESUME_ALLOWED_EXTS.has(ext)) {
    return { valid: false, error: "Only PDF files are allowed for resume uploads." };
  }

  if (file.size > RESUME_MAX_SIZE) {
    return { valid: false, error: "Resume file must be 10 MB or smaller." };
  }

  if (!(await matchesMagicBytes(file, file.type))) {
    return { valid: false, error: "File content does not match its declared type." };
  }

  return { valid: true };
}

export async function validateImageFile(file: File): Promise<ValidationResult> {
  const ext = getExtension(file.name);

  if (!IMAGE_ALLOWED_MIMES.has(file.type) || !IMAGE_ALLOWED_EXTS.has(ext)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, and GIF images are allowed.",
    };
  }

  if (file.size > IMAGE_MAX_SIZE) {
    return { valid: false, error: "Image file must be 5 MB or smaller." };
  }

  if (!(await matchesMagicBytes(file, file.type))) {
    return { valid: false, error: "File content does not match its declared type." };
  }

  return { valid: true };
}
