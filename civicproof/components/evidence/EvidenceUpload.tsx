"use client";

import { generateId, saveEvidence } from "@/lib/localStorage";
import { assignTrustLabel } from "@/lib/trustAnalysis";
import type { EvidenceItem, FileType } from "@/types";
import { FileUp, Loader2, Upload } from "lucide-react";
import type { DragEvent } from "react";
import { useEffect, useRef, useState } from "react";

type EvidenceUploadProps = {
  caseId: string;
  onUpload: (item: EvidenceItem) => void;
};

type ProcessingFile = {
  id: string;
  fileName: string;
};

const acceptedFormats = "image/*,video/*,audio/*,.pdf,.doc,.docx";

function getFileType(file: File): FileType {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  if (file.type.startsWith("audio/")) {
    return "audio";
  }

  if (
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "document";
  }

  return "other";
}

function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceUpload({ caseId, onUpload }: EvidenceUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef(true);
  const [isDragging, setIsDragging] = useState(false);
  const [note, setNote] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const processFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);

    for (const file of fileList) {
      const processingId = generateId();
      if (isMountedRef.current) {
        setProcessingFiles((current) => [...current, { id: processingId, fileName: file.name }]);
      }

      try {
        const hashBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());

        if (!isMountedRef.current) {
          return;
        }

        const item: EvidenceItem = {
          id: generateId(),
          caseId,
          fileName: file.name,
          fileType: getFileType(file),
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          note: note.trim() || undefined,
          sha256Hash: bytesToHex(hashBuffer),
          uploadedAt: new Date().toISOString(),
        };
        const trustLabel = assignTrustLabel(file, item);
        const itemWithTrust: EvidenceItem = { ...item, trustLabel };

        saveEvidence(itemWithTrust);
        onUpload(itemWithTrust);
        setUploadedCount((current) => current + 1);
        setUploadedBytes((current) => current + file.size);
      } catch {
        continue;
      } finally {
        if (isMountedRef.current) {
          setProcessingFiles((current) => current.filter((processingFile) => processingFile.id !== processingId));
        }
      }
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void processFiles(event.dataTransfer.files);
  };

  return (
    <section className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="rounded-lg border border-dashed p-8 text-center transition sm:p-10"
        style={{
          backgroundColor: isDragging ? "color-mix(in srgb, var(--accent-green) 8%, var(--bg-primary))" : "var(--bg-primary)",
          borderColor: isDragging ? "var(--accent-green)" : "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedFormats}
          className="hidden"
          onChange={(event) => {
            if (event.target.files) {
              void processFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
        <Upload className="mx-auto h-9 w-9" style={{ color: isDragging ? "var(--accent-green)" : "var(--text-muted)" }} />
        <p className="mt-4 text-lg font-bold">Drop files here or click to browse</p>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Images, videos, audio, PDF, DOC, and DOCX
        </p>
      </div>

      <input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Optional note for the next upload"
        className="w-full rounded-md border px-3 py-3 text-sm outline-none"
        style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
      />

      {processingFiles.length > 0 ? (
        <div className="space-y-2">
          {processingFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--accent-green)" }} />
              Hashing {file.fileName}
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--text-muted)" }}>
        <span className="inline-flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          {uploadedCount} files uploaded this session - {formatFileSize(uploadedBytes)}
        </span>
        <span>Accepted: JPG, PNG, MP4, MOV, MP3, PDF, DOC, DOCX</span>
      </div>
    </section>
  );
}
