import { useMemo } from 'react'

import { useCollage } from '../CollageProvider'
import { useCollageRenderer } from '../useCollageRenderer'

const formatAspectRatio = (ratioId: string) => ratioId.replace(':', ' / ')

export const PreviewStage = () => {
  const { aspectRatio, images, layout, settings } = useCollage()
  const { canvasRef, download, isExporting, share } = useCollageRenderer()

  const slots = useMemo(
    () =>
      layout.cells.map((cell, index) => {
        const gutter = settings.gutter
        const inset = gutter / 2
        const source = images[index]

        const position = {
          left: `calc(${cell.x * 100}% + ${inset}px)`,
          top: `calc(${cell.y * 100}% + ${inset}px)`,
          width: `calc(${cell.width * 100}% - ${gutter}px)`,
          height: `calc(${cell.height * 100}% - ${gutter}px)`,
        }

        return {
          id: source?.id ?? `slot-${index}`,
          source,
          position,
        }
      }),
    [images, layout.cells, settings.gutter],
  )

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
        <p className="text-sm text-slate-500">
          Live view of your collage. Download or share once you’re happy with it.
        </p>
      </header>

      <div className="rounded-3xl bg-surface p-6 shadow-panel ring-1 ring-border">
        <div
          className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl shadow-inner"
          style={{
            aspectRatio: formatAspectRatio(aspectRatio.id),
            backgroundColor: settings.backgroundColor,
          }}
        >
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            aria-hidden="true"
          />
          {slots.map((slot, index) => (
            <figure
              key={slot.id}
              className="absolute overflow-hidden bg-slate-100 shadow-md transition"
              style={{
                ...slot.position,
                borderRadius: `${Math.max(settings.cornerRadius - settings.gutter / 2, 0)}px`,
              }}
            >
              {slot.source ? (
                <img
                  src={slot.source.previewUrl}
                  alt={slot.source.file.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <span className="text-xs font-medium text-slate-400">
                    Slot {index + 1}
                  </span>
                </div>
              )}
            </figure>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="flex-1 min-w-[160px] rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-panel transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={download}
            disabled={images.length === 0 || isExporting}
          >
            {isExporting ? 'Rendering…' : 'Download JPEG'}
          </button>
          <button
            type="button"
            className="flex-1 min-w-[160px] rounded-full border border-border px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
            onClick={share}
            disabled={images.length === 0 || isExporting}
          >
            Share
          </button>
        </div>
      </div>
    </section>
  )
}
