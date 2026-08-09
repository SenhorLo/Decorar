"use client";

import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Loader2, Star, X } from "lucide-react";

import { ProductPlate } from "@/components/ProductPlate";
import { isGeneratedArt, parseArtUrl } from "@/lib/art";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 8;

/**
 * Envia as imagens para /api/uploads assim que são escolhidas e guarda as
 * URLs devolvidas pelo servidor em inputs escondidos. O formulário principal
 * só trafega strings — o upload já aconteceu e foi validado antes.
 */
export function ImageUploader({
  name = "images",
  initial = [],
  error,
}: {
  name?: string;
  initial?: string[];
  error?: string;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    const room = MAX_IMAGES - urls.length;
    if (room <= 0) {
      setMessage(`Máximo de ${MAX_IMAGES} imagens.`);
      return;
    }

    setUploading(true);
    setMessage(null);

    const body = new FormData();
    for (const file of list.slice(0, room)) body.append("files", file);

    try {
      const response = await fetch("/api/uploads", { method: "POST", body });
      const data = (await response.json()) as { urls?: string[]; error?: string };

      if (!response.ok || !data.urls) {
        setMessage(data.error ?? "Não foi possível enviar as imagens.");
        return;
      }

      setUrls((current) => [...current, ...data.urls!].slice(0, MAX_IMAGES));
    } catch {
      setMessage("Falha de conexão ao enviar as imagens.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    setUrls((current) => current.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    setUrls((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* URLs finais — é isso que a Server Action recebe */}
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-brass bg-brass-wash" : "border-sand-deep bg-linen/40",
          error && "border-danger",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          id="image-input"
          onChange={(e) => e.target.files && void upload(e.target.files)}
        />

        {uploading ? (
          <p className="flex items-center justify-center gap-2 py-3 text-sm text-dusk">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Enviando…
          </p>
        ) : (
          <>
            <ImagePlus className="mx-auto h-6 w-6 text-mute" aria-hidden="true" />
            <label
              htmlFor="image-input"
              className="mt-3 block cursor-pointer font-display text-[1.0625rem] text-ink underline-offset-4 hover:underline"
            >
              Escolher fotos
            </label>
            <p className="mt-1.5 text-[0.75rem] text-dusk">
              ou arraste aqui · JPG, PNG, WebP ou AVIF · até 5 MB cada · máximo{" "}
              {MAX_IMAGES}
            </p>
          </>
        )}
      </div>

      {(message || error) && (
        <p className="text-[0.75rem] text-danger">{message ?? error}</p>
      )}

      {urls.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {urls.map((url, index) => (
              <li
                key={url}
                className="group relative aspect-square overflow-hidden rounded-md border border-sand-deep bg-sand/40"
              >
                {isGeneratedArt(url) ? (
                  <ProductPlate {...parseArtUrl(url)} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}

                {index === 0 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-1 text-[0.625rem] uppercase tracking-[0.08em] text-linen backdrop-blur-sm">
                    <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                    Capa
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remover imagem ${index + 1}`}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-ink/75 text-linen opacity-0 backdrop-blur-sm transition-opacity hover:bg-danger focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Mover para a esquerda"
                    className="rounded-full bg-canvas/90 px-2 py-0.5 text-[0.6875rem] text-bark disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === urls.length - 1}
                    aria-label="Mover para a direita"
                    className="rounded-full bg-canvas/90 px-2 py-0.5 text-[0.6875rem] text-bark disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <p className="flex items-center gap-1.5 text-[0.75rem] text-dusk">
            <GripVertical className="h-3 w-3" aria-hidden="true" />
            A primeira imagem é a capa do anúncio. Use as setas para reordenar.
          </p>
        </>
      )}
    </div>
  );
}
