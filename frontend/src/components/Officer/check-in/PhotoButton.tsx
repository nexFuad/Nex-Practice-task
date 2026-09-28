"use client";
/* eslint-disable @next/next/no-img-element -- Attendance photos use stored external URLs. */


export function PhotoButton({
  url,
  onPreview,
}: {
  url: string | null;
  onPreview: (url: string) => void;
}) {
  return url ? (
    <button
      type="button"
      onClick={() => onPreview(url)}
      className="grid size-10 place-items-center overflow-hidden rounded-md border border-slate-200"
    >
      <img src={url} alt="Attendance" className="size-full object-cover" />
    </button>
  ) : (
    <span className="text-slate-400">-</span>
  );
}
