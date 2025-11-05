import pica from 'pica'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCollage } from './CollageProvider'
import type { CollageImage } from './types'

type PicaInstance = ReturnType<typeof pica>

const EXPORT_BASE_WIDTH = 1080
const JPEG_QUALITY = 0.92

type CachedSource = {
  element: CanvasImageSource
  dispose?: () => void
}

/**
 * Creates an offscreen canvas element sized to the provided dimensions.
 *
 * @param width - The desired canvas width in CSS pixels.
 * @param height - The desired canvas height in CSS pixels.
 * @returns The configured offscreen canvas element sized in device pixels.
 */
const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Traces a rounded rectangle path on the supplied 2D canvas context.
 *
 * @param context - Canvas context used for drawing.
 * @param x - The x-coordinate of the rectangle's top-left corner.
 * @param y - The y-coordinate of the rectangle's top-left corner.
 * @param width - Rectangle width in pixels.
 * @param height - Rectangle height in pixels.
 * @param radius - Desired corner radius; clamped to the rectangle bounds.
 */
const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
  context.beginPath()
  context.moveTo(x + r, y)
  context.lineTo(x + width - r, y)
  context.quadraticCurveTo(x + width, y, x + width, y + r)
  context.lineTo(x + width, y + height - r)
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  context.lineTo(x + r, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - r)
  context.lineTo(x, y + r)
  context.quadraticCurveTo(x, y, x + r, y)
  context.closePath()
}

/**
 * Calculates the source rectangle needed to cover a target aspect ratio when drawing an image.
 *
 * @param sourceWidth - Original image width.
 * @param sourceHeight - Original image height.
 * @param targetWidth - Target display width.
 * @param targetHeight - Target display height.
 * @param focusX - Optional horizontal focal point between 0 and 1.
 * @param focusY - Optional vertical focal point between 0 and 1.
 * @returns The crop rectangle describing the portion of the source image to sample.
 */
const computeCoverCrop = (
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  focusX = 0.5,
  focusY = 0.5,
) => {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
  const cropWidth = targetWidth / scale
  const cropHeight = targetHeight / scale
  const maxOffsetX = Math.max(0, sourceWidth - cropWidth)
  const maxOffsetY = Math.max(0, sourceHeight - cropHeight)
  const sx = maxOffsetX * Math.min(1, Math.max(0, focusX))
  const sy = maxOffsetY * Math.min(1, Math.max(0, focusY))
  return { sx, sy, sw: cropWidth, sh: cropHeight }
}

/**
 * Encodes the given canvas element into a Blob using the provided mime type and quality.
 *
 * @param canvas - Canvas to serialize.
 * @param mime - MIME type of the resulting blob.
 * @param quality - Optional encoder-specific quality parameter.
 * @returns A promise resolving to the encoded blob, or `null` if encoding failed.
 */
const canvasToBlob = (canvas: HTMLCanvasElement, mime: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality))

/**
 * Loads an HTMLImageElement from the supplied source URL.
 *
 * @param src - Image source URL.
 * @returns A promise that resolves once the element has finished loading.
 */
const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

/**
 * Persists a blob to disk by synthesizing a temporary anchor element.
 *
 * @param blob - Blob to save.
 * @param filename - Suggested filename for the download.
 */
const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.setProperty('display', 'none')
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Provides rendering utilities for the collage preview canvas including export helpers.
 *
 * @returns Refs and callbacks for rendering, exporting, and sharing the collage image.
 */
export const useCollageRenderer = () => {
  const { aspectRatio, images, layout, settings } = useCollage()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const picaRef = useRef<PicaInstance | null>(null)
  const cacheRef = useRef<Map<string, CachedSource>>(new Map())
  const [isExporting, setIsExporting] = useState(false)

  const targetSize = useMemo(() => {
    const width = EXPORT_BASE_WIDTH
    const safeRatio = Math.max(aspectRatio.value, 0.01)
    const height = Math.round(width / safeRatio)
    return { width, height }
  }, [aspectRatio.value])

  useEffect(
    () => () => {
      const cache = cacheRef.current
      cache.forEach((entry) => entry.dispose?.())
      cache.clear()
    },
    [],
  )

  useEffect(() => {
    const cache = cacheRef.current
    const activeIds = new Set(images.map((image) => image.id))
    for (const [id, entry] of cache.entries()) {
      if (!activeIds.has(id)) {
        entry.dispose?.()
        cache.delete(id)
      }
    }
  }, [images])

  /**
   * Lazily instantiates and caches the shared pica instance used for high-quality resizing.
   *
   * @returns The shared `pica` instance used for canvas scaling.
   */
  const ensurePica = useCallback((): PicaInstance => {
    if (!picaRef.current) {
      picaRef.current = pica()
    }
    return picaRef.current
  }, [])

  /**
   * Retrieves a renderable source for the provided collage image, preferring cached bitmaps.
   *
   * @param image - Collage image whose bitmap or preview should be loaded.
   * @returns A cached `CanvasImageSource` ready for drawing.
   */
  const getSource = useCallback(async (image: CollageImage): Promise<CanvasImageSource> => {
    const cache = cacheRef.current
    const cached = cache.get(image.id)
    if (cached) return cached.element

    if (image.imageBitmap) {
      cache.set(image.id, { element: image.imageBitmap })
      return image.imageBitmap
    }

    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(image.file)
        cache.set(image.id, {
          element: bitmap,
          dispose: () => bitmap.close(),
        })
        return bitmap
      } catch (error) {
        console.warn('createImageBitmap failed, falling back to <img> element', error)
      }
    }

    const element = await loadImageElement(image.previewUrl)
    cache.set(image.id, { element })
    return element
  }, [])

  /**
   * Draws the current collage configuration onto the backing canvas, respecting abort signals.
   *
   * @param signal - Optional abort controller signal for cancelling long-running renders.
   * @returns A promise that resolves once rendering is complete or cancelled.
   */
  const renderCollage = useCallback(
    async (signal?: AbortSignal) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const { width, height } = targetSize
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      const context = canvas.getContext('2d')
      if (!context) return

      context.save()
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, width, height)
      context.fillStyle = settings.backgroundColor
      context.fillRect(0, 0, width, height)
      context.restore()

      if (!images.length) return

      const picaInstance = ensurePica()
      const gutter = settings.gutter
      const effectiveCornerRadius = Math.max(settings.cornerRadius - gutter / 2, 0)

      for (let index = 0; index < layout.cells.length; index += 1) {
        if (signal?.aborted) return

        const cell = layout.cells[index]
        const image = images[index]
        if (!image || !image.width || !image.height) continue

        const destWidth = Math.max(1, Math.round(cell.width * width - gutter))
        const destHeight = Math.max(1, Math.round(cell.height * height - gutter))
        if (destWidth <= 0 || destHeight <= 0) continue

        const destX = Math.round(cell.x * width + gutter / 2)
        const destY = Math.round(cell.y * height + gutter / 2)

        const { sx, sy, sw, sh } = computeCoverCrop(
          image.width,
          image.height,
          destWidth,
          destHeight,
          image.focusX,
          image.focusY,
        )
        const cropCanvas = createCanvas(Math.max(1, Math.round(sw)), Math.max(1, Math.round(sh)))
        const cropContext = cropCanvas.getContext('2d')
        if (!cropContext) continue

        const source = await getSource(image)
        if (signal?.aborted) return

        cropContext.drawImage(
          source,
          sx,
          sy,
          sw,
          sh,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height,
        )

        if (signal?.aborted) return

        const targetCanvas = createCanvas(destWidth, destHeight)
        await picaInstance.resize(cropCanvas, targetCanvas, {
          quality: 3,
        })

        if (signal?.aborted) return

        context.save()
        roundedRect(context, destX, destY, destWidth, destHeight, effectiveCornerRadius)
        context.clip()
        context.drawImage(targetCanvas, destX, destY, destWidth, destHeight)
        context.restore()
      }
    },
    [
      ensurePica,
      getSource,
      images,
      layout.cells,
      settings.backgroundColor,
      settings.cornerRadius,
      settings.gutter,
      targetSize.height,
      targetSize.width,
    ],
  )

  useEffect(() => {
    const controller = new AbortController()
    renderCollage(controller.signal).catch((error) => {
      if ((error as DOMException)?.name !== 'AbortError') {
        console.error('Failed to render collage preview', error)
      }
    })
    return () => controller.abort()
  }, [renderCollage])

  /**
   * Renders the collage and encodes the result as a JPEG blob.
   *
   * @returns A promise containing the encoded JPEG blob, or `null` if encoding fails.
   */
  const generateBlob = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    await renderCollage()
    return canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY)
  }, [renderCollage])

  /**
   * Exports the collage to disk, showing fallback errors in the console if encoding fails.
   *
   * @returns A promise that resolves when the download workflow completes.
   */
  const download = useCallback(async () => {
    if (!canvasRef.current || images.length === 0) return
    setIsExporting(true)
    try {
      const blob = await generateBlob()
      if (!blob) {
        throw new Error('Unable to encode collage.')
      }
      const filename = `collage-${settings.aspectRatioId.replace(':', '-')}.jpg`
      saveBlob(blob, filename)
    } catch (error) {
      console.error('Download failed', error)
    } finally {
      setIsExporting(false)
    }
  }, [generateBlob, images.length, settings.aspectRatioId])

  /**
   * Shares the collage image using the Web Share API, with download fallbacks when unsupported.
   *
   * @returns A promise that resolves when the share or fallback download finishes.
   */
  const share = useCallback(async () => {
    if (!canvasRef.current || images.length === 0) return
    setIsExporting(true)

    let blob: Blob | null = null
    const filename = `collage-${Date.now()}.jpg`

    try {
      blob = await generateBlob()
      if (!blob) {
        throw new Error('Unable to encode collage.')
      }

      const shareSupported =
        typeof navigator !== 'undefined' && typeof navigator.share === 'function'

      if (!shareSupported) {
        saveBlob(blob, filename)
        return
      }

      const file = new File([blob], filename, { type: 'image/jpeg' })
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        saveBlob(blob, filename)
        return
      }

      await navigator.share({
        files: [file],
        title: 'Photo collage',
        text: 'Created with Collage Studio',
      })
    } catch (error) {
      console.error('Share failed, saving instead', error)
      if (blob) {
        saveBlob(blob, filename)
      } else {
        const fallback = await generateBlob()
        if (fallback) {
          saveBlob(fallback, filename)
        }
      }
    } finally {
      setIsExporting(false)
    }
  }, [generateBlob, images.length])

  return {
    canvasRef,
    download,
    share,
    isExporting,
  }
}
