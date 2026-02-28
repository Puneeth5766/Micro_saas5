"use client";

import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../Button";
import { Spinner } from "../Spinner";
import { cn } from "../../utils/cn";

export interface UploadZoneProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  loading?: boolean;
  onUpload: (files: File[]) => Promise<void> | void;
}

export function UploadZone({ accept, maxSize = 10 * 1024 * 1024, multiple = false, loading = false, onUpload }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept,
    maxSize,
    multiple,
    onDrop: (acceptedFiles) => {
      setFiles((prev) => (multiple ? [...prev, ...acceptedFiles] : acceptedFiles.slice(0, 1)));
    }
  });

  const errors = useMemo(
    () => fileRejections.flatMap((rejection) => rejection.errors.map((error) => `${rejection.file.name}: ${error.message}`)),
    [fileRejections]
  );

  async function handleUpload(): Promise<void> {
    if (files.length === 0) return;
    await onUpload(files);
  }

  function removeFile(index: number): void {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border border-dashed border-border bg-surface p-6 text-center transition-colors",
          isDragActive && "border-primary bg-primary/5"
        )}
        role="button"
        aria-label="File upload dropzone"
      >
        <input {...getInputProps()} />
        <p className="text-sm text-text-secondary">Drag and drop files here, or click to select files.</p>
        <p className="mt-1 text-xs text-text-muted">Max file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB</p>
      </div>

      {errors.length > 0 ? (
        <ul className="space-y-1 text-sm text-danger" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">{file.name}</p>
                <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFile(idx)} disabled={loading}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <Button onClick={handleUpload} disabled={files.length === 0 || loading} loading={loading} leftIcon={loading ? <Spinner size="sm" /> : undefined}>
        Upload
      </Button>
    </div>
  );
}
