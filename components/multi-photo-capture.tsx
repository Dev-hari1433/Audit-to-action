"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, ImagePlus, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import type { PhotoEvidence } from "@/types";

export interface CapturedPhoto extends PhotoEvidence {
  preview: string;
  qualityMessage: string;
}

interface MultiPhotoCaptureProps {
  photos: CapturedPhoto[];
  onChange: (photos: CapturedPhoto[]) => void;
  label?: string;
  maxPhotos?: number;
}

function inspectImage(canvas: HTMLCanvasElement, width: number, height: number) {
  const sample = document.createElement("canvas");
  sample.width = 96;
  sample.height = 72;
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return { quality: "RETAKE" as const, message: "We could not check this photo. Please retake it." };
  context.drawImage(canvas, 0, 0, sample.width, sample.height);
  const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
  let brightness = 0;
  let detail = 0;
  let previous = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const luminance = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
    brightness += luminance;
    if (index > 0) detail += Math.abs(luminance - previous);
    previous = luminance;
  }
  const samples = pixels.length / 4;
  brightness /= samples;
  detail /= samples;
  if (width < 640 || height < 480) return { quality: "RETAKE" as const, message: "Resolution is too low. Move closer and use a sharper camera." };
  if (brightness < 42) return { quality: "RETAKE" as const, message: "The photo is too dark. Add light and retake it." };
  if (brightness > 232) return { quality: "RETAKE" as const, message: "The photo is overexposed. Reduce glare and retake it." };
  if (detail < 5.5) return { quality: "RETAKE" as const, message: "The image may be blurry. Hold the phone steady and retake it." };
  return { quality: "CLEAR" as const, message: "Clear enough for AI screening and human review." };
}

function photoFromCanvas(sourceCanvas: HTMLCanvasElement, name: string, source: PhotoEvidence["source"]): CapturedPhoto {
  const originalWidth = sourceCanvas.width;
  const originalHeight = sourceCanvas.height;
  const scale = Math.min(1, 1280 / Math.max(originalWidth, originalHeight));
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(originalWidth * scale));
  output.height = Math.max(1, Math.round(originalHeight * scale));
  output.getContext("2d")?.drawImage(sourceCanvas, 0, 0, output.width, output.height);
  const check = inspectImage(output, originalWidth, originalHeight);
  return {
    id: crypto.randomUUID(),
    fileName: name,
    width: originalWidth,
    height: originalHeight,
    quality: check.quality,
    qualityMessage: check.message,
    source,
    preview: output.toDataURL("image/jpeg", 0.82),
  };
}

async function photoFromFile(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > 10_000_000) throw new Error(`${file.name} is larger than 10 MB.`);
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d")?.drawImage(image, 0, 0);
    return photoFromCanvas(canvas, file.name, "UPLOAD");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function MultiPhotoCapture({ photos, onChange, label = "Live proof photos", maxPhotos = 6 }: MultiPhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const startCamera = async () => {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Live camera is unavailable in this browser. Use the camera upload option below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setMessage("Camera permission was not granted. Allow camera access, or use the camera upload option.");
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setMessage("The camera is still starting. Try again in a moment.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const photo = photoFromCanvas(canvas, `live-photo-${photos.length + 1}.jpg`, "CAMERA");
    onChange([...photos, photo].slice(0, maxPhotos));
    setMessage(photo.quality === "CLEAR" ? "Photo captured. You can add another angle." : photo.qualityMessage);
    if (photos.length + 1 >= maxPhotos) stopCamera();
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMessage("");
    try {
      const remaining = maxPhotos - photos.length;
      const selected = Array.from(files).slice(0, remaining);
      const next = await Promise.all(selected.map(photoFromFile));
      onChange([...photos, ...next]);
      const needsRetake = next.find((photo) => photo.quality === "RETAKE");
      setMessage(needsRetake ? needsRetake.qualityMessage : `${next.length} photo${next.length === 1 ? "" : "s"} added and checked.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not read those photos.");
    } finally {
      setBusy(false);
    }
  };

  const clearCount = photos.filter((photo) => photo.quality === "CLEAR").length;
  return (
    <section className="rounded-2xl border border-[#cddbd4] bg-[#f8fbf9] p-4 sm:p-5" aria-labelledby="photo-capture-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id="photo-capture-title" className="font-black">{label} <span className="text-[#c44b23]">*</span></h3>
          <p className="mt-1 text-sm leading-6 text-[#66736c]">Capture up to {maxPhotos} clear photos. Show the full barrier and one close angle.</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#0b5d45] shadow-sm">{clearCount}/{photos.length} clear</span>
      </div>

      <div className={`mt-4 overflow-hidden rounded-2xl bg-[#102e25] ${cameraActive ? "block" : "hidden"}`}>
        <video ref={videoRef} muted playsInline aria-label="Live rear camera preview" className="aspect-[4/3] w-full object-cover" />
        <div className="flex gap-2 p-3">
          <button type="button" onClick={capture} disabled={photos.length >= maxPhotos} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e56532] px-4 py-3 font-black text-white disabled:opacity-50"><Camera size={18} />Capture photo</button>
          <button type="button" onClick={stopCamera} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-bold text-white"><CameraOff size={18} />Stop</button>
        </div>
      </div>

      {!cameraActive && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={startCamera} disabled={photos.length >= maxPhotos} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#0b5d45] px-4 py-3 font-black text-white shadow-[0_8px_22px_rgba(11,93,69,.18)] disabled:opacity-50"><Camera size={19} />Open live camera</button>
          <label className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#a9c4b7] bg-white px-4 py-3 font-bold text-[#0b5d45]">
            <ImagePlus size={19} />{busy ? "Checking photos…" : "Camera / gallery"}
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple disabled={busy || photos.length >= maxPhotos} onChange={(event) => { void addFiles(event.target.files); event.currentTarget.value = ""; }} />
          </label>
        </div>
      )}

      {message && <p className="mt-3 flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#5f6d65]" role="status"><RefreshCw size={16} className="mt-0.5 shrink-0 text-[#0b5d45]" />{message}</p>}

      {photos.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{photos.map((photo, index) => (
        <article key={photo.id} className={`overflow-hidden rounded-xl border-2 bg-white ${photo.quality === "CLEAR" ? "border-emerald-200" : "border-amber-300"}`}>
          <img src={photo.preview} alt={`Evidence photo ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
          <div className="p-3">
            <p className={`flex items-center gap-1.5 text-xs font-black ${photo.quality === "CLEAR" ? "text-emerald-700" : "text-amber-800"}`}>{photo.quality === "CLEAR" ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}{photo.quality === "CLEAR" ? "Clear" : "Retake needed"}</p>
            <p className="mt-1 text-[11px] leading-4 text-[#66736c]">{photo.width} × {photo.height} · {photo.source === "CAMERA" ? "Live camera" : "Camera/gallery"}</p>
            <button type="button" onClick={() => onChange(photos.filter((item) => item.id !== photo.id))} className="mt-2 flex items-center gap-1 text-xs font-bold text-red-700"><Trash2 size={13} />Remove</button>
          </div>
        </article>
      ))}</div>}
      <p className="mt-3 text-xs leading-5 text-[#68766e]">Photos marked “Retake needed” cannot be submitted. The quality check looks for usable resolution, lighting and visible detail.</p>
    </section>
  );
}
