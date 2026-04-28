"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
  label?: string;
  accept?: string;
  uploading?: boolean;
}

export default function ImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  label = "رفع صورة",
  accept = "image/jpeg,image/png,image/webp",
  uploading = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    await onUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
  };

  return (
    <div>
      {label && (
        <p style={{ marginBottom: "0.5rem", fontWeight: 600, color: "var(--foreground)" }}>
          {label}
        </p>
      )}

      {preview ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              width: 200,
              height: 150,
              borderRadius: "0.75rem",
              overflow: "hidden",
              border: "2px solid var(--border)",
              position: "relative",
            }}
          >
            <Image src={preview} alt="معاينة" fill style={{ objectFit: "cover" }} />
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LoadingSpinner color="white" />
              </div>
            )}
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                position: "absolute",
                top: -8,
                left: -8,
                background: "#DC2626",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: 24,
                height: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="حذف الصورة"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--primary)" : "var(--border)"}`,
            borderRadius: "0.75rem",
            padding: "2rem",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            background: isDragging ? "rgba(45,106,79,0.05)" : "var(--surface-2)",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--text-muted)",
          }}
        >
          {uploading ? (
            <LoadingSpinner />
          ) : (
            <>
              <ImageIcon size={36} style={{ color: "var(--primary-light)" }} />
              <Upload size={20} />
              <span style={{ fontSize: "0.875rem" }}>اسحب صورة هنا أو انقر للاختيار</span>
              <span style={{ fontSize: "0.75rem" }}>JPG, PNG, WebP</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
