import { mkdir, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import pdfParse from 'pdf-parse';

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_PAGES = 50;

export interface PDFParseResult {
  text: string;
  pageCount: number;
  wordCount: number;
}

export interface RFPSection {
  title: string;
  content: string;
}

export class FileProcessingError extends Error {
  code: string;
  userMessage: string;

  constructor(code: string, userMessage: string, message?: string) {
    super(message ?? userMessage);
    this.name = 'FileProcessingError';
    this.code = code;
    this.userMessage = userMessage;
  }
}

export function validatePDFFile(file: { size: number; mimetype: string }): void {
  if (file.mimetype !== 'application/pdf') {
    throw new FileProcessingError(
      'INVALID_FILE_TYPE',
      'Please upload a valid PDF file.',
      `Unsupported mimetype: ${file.mimetype}`
    );
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new FileProcessingError(
      'FILE_TOO_LARGE',
      'PDF file is too large. Maximum allowed size is 10MB.',
      `PDF size ${file.size} exceeds ${MAX_PDF_SIZE_BYTES}`
    );
  }
}

export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  if (!buffer || buffer.length === 0) {
    throw new FileProcessingError(
      'EMPTY_FILE',
      'The uploaded PDF appears to be empty.',
      'Empty buffer provided for PDF parsing'
    );
  }

  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new FileProcessingError(
      'FILE_TOO_LARGE',
      'PDF file is too large. Maximum allowed size is 10MB.',
      `PDF buffer size ${buffer.length} exceeds ${MAX_PDF_SIZE_BYTES}`
    );
  }

  try {
    const parsed = await pdfParse(buffer);
    const pageCount = parsed.numpages ?? 0;

    if (pageCount > MAX_PDF_PAGES) {
      throw new FileProcessingError(
        'PAGE_LIMIT_EXCEEDED',
        'PDF has too many pages. Maximum allowed length is 50 pages.',
        `PDF page count ${pageCount} exceeds ${MAX_PDF_PAGES}`
      );
    }

    const text = (parsed.text ?? '').replace(/\u0000/g, '').trim();
    const wordCount = text.length === 0 ? 0 : text.split(/\s+/).filter(Boolean).length;

    return {
      text,
      pageCount,
      wordCount,
    };
  } catch (error) {
    if (error instanceof FileProcessingError) {
      throw error;
    }

    throw new FileProcessingError(
      'PDF_PARSE_FAILED',
      'We could not read this PDF. Please verify the file is not corrupted and try again.',
      error instanceof Error ? error.message : 'Unknown PDF parsing error'
    );
  }
}

function isSectionHeader(currentLine: string, nextLine?: string): boolean {
  const line = currentLine.trim();
  if (!line || line.length < 3 || line.length > 120) {
    return false;
  }

  const sectionPattern = /^section\s+\d+[a-z0-9.-]*\b[:.)-]?/i;
  const numberedHeaderPattern = /^\d+(?:\.\d+)*[.)-]?\s+[A-Za-z].{2,}$/;
  const romanNumeralPattern = /^[IVXLCM]+[.)-]\s+[A-Za-z].{2,}$/;
  const allCapsPattern = /^[A-Z][A-Z0-9\s&/(),:'-]{4,}$/;

  if (sectionPattern.test(line) || numberedHeaderPattern.test(line) || romanNumeralPattern.test(line)) {
    return true;
  }

  if (allCapsPattern.test(line)) {
    const words = line.split(/\s+/);
    const nextLooksLikeBody = nextLine ? /[a-z]/.test(nextLine) : false;
    return words.length <= 12 && nextLooksLikeBody;
  }

  return false;
}

export function extractRFPSections(rawText: string): RFPSection[] {
  const cleanText = (rawText ?? '').replace(/\r\n?/g, '\n').trim();

  if (!cleanText) {
    return [{ title: 'RFP Content', content: '' }];
  }

  const lines = cleanText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 4 || cleanText.length < 400) {
    return [{ title: 'RFP Content', content: cleanText }];
  }

  const sections: RFPSection[] = [];
  let currentTitle = 'Introduction';
  let currentContent: string[] = [];
  let detectedHeaders = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : undefined;

    if (isSectionHeader(line, nextLine)) {
      detectedHeaders += 1;
      if (currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n').trim(),
        });
      }
      currentTitle = line;
      currentContent = [];
      continue;
    }

    currentContent.push(line);
  }

  if (currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim(),
    });
  }

  const validSections = sections.filter((section) => section.content.length > 0);
  if (detectedHeaders < 1 || validSections.length < 2) {
    return [{ title: 'RFP Content', content: cleanText }];
  }

  return validSections;
}

function sanitizeFilename(filename: string): string {
  return basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function saveUploadedFile(buffer: Buffer, filename: string): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new FileProcessingError('EMPTY_FILE', 'Cannot save an empty file.');
  }

  const normalized = filename.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  const inferredUserId = parts.length > 1 ? parts[0] : 'anonymous';
  const safeUserId = inferredUserId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = sanitizeFilename(parts[parts.length - 1] ?? 'upload.pdf');

  const uploadDir = join('/tmp', 'rfp-uploads', safeUserId);
  await mkdir(uploadDir, { recursive: true });

  const filePath = join(uploadDir, `${Date.now()}-${safeName}`);
  await writeFile(filePath, buffer);

  return filePath;
}
