"use client";

import { Camera } from "lucide-react";
import { useRef } from "react";

export function ProfilePhotoCard({ fullName, imageUrl, onFileChange }: { fullName: string; imageUrl: string | null; onFileChange: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectPhoto = () => inputRef.current?.click();
  const initial = fullName.trim().charAt(0).toUpperCase() || "U";
  return <section className="flex h-fit flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} /><div className="flex flex-col items-center"><div className="relative mb-6"><button type="button" onClick={selectPhoto} className="grid size-32 cursor-pointer place-items-center overflow-hidden rounded-full border-4 border-white bg-linear-to-br from-blue-500 to-blue-600 text-5xl font-bold text-white shadow-sm">{imageUrl ? <img src={imageUrl} alt={`${fullName}'s profile`} className="size-full object-cover" /> : initial}</button><button type="button" onClick={selectPhoto} aria-label="Change profile photo" className="absolute bottom-0 right-0 grid size-10 cursor-pointer place-items-center rounded-full border-4 border-white bg-blue-500 text-white shadow-md transition-colors hover:bg-blue-600"><Camera className="size-5" /></button></div><button type="button" onClick={selectPhoto} className="h-9 w-8/12 rounded-md border border-blue-200 bg-transparent px-4 text-sm font-medium text-blue-600 shadow-sm transition hover:cursor-pointer hover:bg-blue-50">Change Photo</button></div></section>;
}
