import { useCallback, useMemo, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'

import { useCollage } from '../CollageProvider'
import { MAX_IMAGES } from '../settings'

const humanReadableLimit = (count: number) => (count === 1 ? '1 photo' : `${count} photos`)

export const UploadPanel = () => {
  const { addImages, clearImages, images, layout, removeImage, reorderImages } = useCollage()
  const [isDragging, setIsDragging] = useState(false)

  const remainingSlots = Math.max(0, Math.min(layout.maxImages, MAX_IMAGES) - images.length)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return
      await addImages(Array.from(files))
    },
    [addImages],
  )

  const onDrop = useCallback(
    async (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setIsDragging(false)
      await handleFiles(event.dataTransfer.files)
    },
    [handleFiles],
  )

  const onDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setIsDragging(false), [])

  const onInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      await handleFiles(event.target.files)
      event.target.value = ''
    },
    [handleFiles],
  )

  const dropzoneClasses = useMemo(
    () =>
      [
        'flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed transition-colors',
        isDragging
          ? 'border-accent bg-accent/5 text-accent'
          : 'border-border bg-surface text-slate-500 hover:border-slate-300 dark:border-border/60 dark:bg-surface/80 dark:text-slate-400 dark:hover:border-slate-500',
      ].join(' '),
    [isDragging],
  )

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upload photos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Drag and drop or browse to add up to {humanReadableLimit(layout.maxImages)} per layout.
          </p>
        </div>
        {images.length > 0 && (
          <button
            type="button"
            className="text-sm font-medium text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            onClick={clearImages}
          >
            Clear
          </button>
        )}
      </header>

      <label
        className={dropzoneClasses}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          className="hidden"
          type="file"
          accept="image/*"
          multiple
          onChange={onInputChange}
          disabled={remainingSlots === 0}
        />
        <div className="space-y-2 text-center">
          <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Drop photos here</span>
          <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
            {remainingSlots > 0
              ? `${humanReadableLimit(remainingSlots)} available`
              : 'Remove a photo or switch layouts for more slots'}
          </span>
        </div>
      </label>

      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex items-center gap-3 rounded-xl bg-surface p-2 shadow-sm shadow-slate-100 ring-1 ring-border transition-colors dark:shadow-none dark:ring-border/60"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{image.file.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {Math.round(image.width)} × {Math.round(image.height)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full bg-slate-100 p-2 text-xs text-slate-500 transition hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  aria-label="Move photo up"
                  onClick={() => reorderImages(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-100 p-2 text-xs text-slate-500 transition hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  aria-label="Move photo down"
                  onClick={() => reorderImages(index, Math.min(images.length - 1, index + 1))}
                  disabled={index === images.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-100 p-2 text-xs text-red-500 transition hover:bg-red-100 dark:bg-slate-700 dark:text-red-400 dark:hover:bg-red-500/10"
                  aria-label="Remove photo"
                  onClick={() => removeImage(image.id)}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
