"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadImage } from "@/Services/upload";

export function LiveCamera({
  onClose,
  onCaptured,
}: {
  onClose: () => void;
  onCaptured: (url: string) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    let stream: MediaStream | null = null;
    void navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((value) => {
        stream = value;
        if (video.current) video.current.srcObject = value;
      })
      .catch(() =>
        setError(
          "Camera access is required. Allow camera access and try again.",
        ),
      );
    return () => stream?.getTracks().forEach((track) => track.stop());
  }, []);
  const capture = () => {
    const element = video.current;
    const target = canvas.current;
    if (!element || !target) return;
    target.width = element.videoWidth;
    target.height = element.videoHeight;
    target.getContext("2d")?.drawImage(element, 0, 0);
    setUploading(true);
    target.toBlob(
      async (blob) => {
        try {
          if (!blob) throw new Error("Unable to capture photo.");
          onCaptured(await uploadImage(blob));
        } catch (cause) {
          setError(
            cause instanceof Error ? cause.message : "Unable to save photo.",
          );
          setUploading(false);
        }
      },
      "image/jpeg",
      0.9,
    );
  };
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/70 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-4">
        <div className="mb-3 flex justify-between">
          <h3 className="font-semibold">Live Camera</h3>
          <button onClick={onClose}>
            <X className="size-5" />
          </button>
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <video
          ref={video}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full rounded-md bg-black object-cover"
        />
        <canvas ref={canvas} hidden />
        <button
          type="button"
          disabled={Boolean(error) || uploading}
          onClick={capture}
          className="mt-4 h-10 w-full rounded-md bg-blue-600 text-sm font-semibold text-white disabled:bg-slate-300"
        >
          {uploading ? "Uploading…" : "Capture Photo"}
        </button>
      </div>
    </div>
  );
}
