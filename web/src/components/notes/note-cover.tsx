"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface NoteCoverProps {
  thumbnailUrl?: string | null;
  fileType?: string | null;
  documentType?: string | null;
  title?: string | null;
  className?: string;
}

type CoverKind = "PDF" | "DOCX" | "PPT" | "MD" | "TXT" | "Image" | "Other";

function resolveKind(fileType?: string | null, documentType?: string | null): CoverKind {
  const raw = `${documentType ?? ""} ${fileType ?? ""}`.toLowerCase();
  if (/\bpdf\b|application\/pdf/.test(raw)) return "PDF";
  if (/\b(docx?|word)\b|application\/(vnd\.openxmlformats-officedocument\.wordprocessingml|msword)/.test(raw)) return "DOCX";
  if (/\b(pptx?|powerpoint|presentation)\b|application\/(vnd\.openxmlformats-officedocument\.presentationml|vnd\.ms-powerpoint)/.test(raw)) return "PPT";
  if (/\b(md|markdown)\b|text\/markdown/.test(raw)) return "MD";
  if (/\b(txt|plain)\b|text\/plain/.test(raw)) return "TXT";
  if (/\b(image|png|jpe?g|gif|webp|svg|bmp|tiff)\b|^image\//.test(raw)) return "Image";
  return "Other";
}

const KIND_STYLES: Record<CoverKind, { bg: string; fg: string; glyph: string }> = {
  PDF: { bg: "bg-red-50", fg: "text-red-700", glyph: "PDF" },
  DOCX: { bg: "bg-blue-50", fg: "text-blue-700", glyph: "DOC" },
  PPT: { bg: "bg-orange-50", fg: "text-orange-700", glyph: "PPT" },
  MD: { bg: "bg-slate-100", fg: "text-slate-700", glyph: "MD" },
  TXT: { bg: "bg-zinc-100", fg: "text-zinc-700", glyph: "TXT" },
  Image: { bg: "bg-emerald-50", fg: "text-emerald-700", glyph: "IMG" },
  Other: { bg: "bg-violet-50", fg: "text-violet-700", glyph: "FILE" },
};

export function NoteCover({
  thumbnailUrl,
  fileType,
  documentType,
  title,
  className,
}: NoteCoverProps) {
  const [failed, setFailed] = useState(false);
  const kind = resolveKind(fileType, documentType);
  const showImage = Boolean(thumbnailUrl) && !failed;
  const style = KIND_STYLES[kind];

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden bg-slate-100",
        className,
      )}
    >
      {showImage ? (
        <Image
          src={thumbnailUrl!}
          alt={title ? `${title} cover` : "Note cover"}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-2 border border-slate-200/80",
            style.bg,
          )}
          aria-label={`${kind} document preview`}
        >
          <div
            className={cn(
              "flex h-12 min-w-12 items-center justify-center rounded-md border border-current/15 bg-white/70 px-2 text-sm font-bold tracking-wide shadow-sm",
              style.fg,
            )}
          >
            {style.glyph}
          </div>
          <span className={cn("text-xs font-medium uppercase tracking-wider", style.fg)}>
            {kind}
          </span>
        </div>
      )}
    </div>
  );
}
