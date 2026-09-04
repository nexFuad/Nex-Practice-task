"use client";
import { FilePenLine } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
export function ProfileUploader({
  preview,
  onChange,
}: {
  preview: string | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => inputRef.current?.click();
  return (
    <div className="group relative mx-auto size-40">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={openPicker}
        className="grid size-40 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs font-medium uppercase text-slate-400 transition-all group-hover:border-slate-900 group-hover:bg-slate-100"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Profile preview"
            width={100}
            height={100}
            className="size-full object-cover"
          />
        ) : (
          "Click to upload"
        )}
      </button>
      <button
        type="button"
        onClick={openPicker}
        aria-label="Choose profile picture"
        className="absolute bottom-8 right-2 z-10 grid size-11 cursor-pointer translate-x-1/3 translate-y-1/3 place-items-center rounded-full border-[3px] border-slate-900 bg-white text-slate-900 shadow-md"
      >
        <FilePenLine className="size-5" />
      </button>
    </div>
  );
}
