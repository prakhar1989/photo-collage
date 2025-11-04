import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import { COLLAGE_LAYOUTS, DEFAULT_LAYOUT_ID } from './layouts'
import { ASPECT_RATIOS, DEFAULT_SETTINGS, MAX_IMAGES } from './settings'
import type {
  AspectRatioOption,
  CollageContextValue,
  CollageImage,
  CollageLayout,
  CollageSettings,
} from './types'

const CollageContext = createContext<CollageContextValue | undefined>(undefined)

const SETTINGS_STORAGE_KEY = 'photo-collage.settings'

const findAspectRatio = (id: CollageSettings['aspectRatioId']): AspectRatioOption =>
  ASPECT_RATIOS.find((option) => option.id === id) ?? ASPECT_RATIOS[0]

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const loadImageDimensions = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.src = src
  })

const prepareImage = async (file: File): Promise<CollageImage> => {
  const previewUrl = URL.createObjectURL(file)

  try {
    if ('createImageBitmap' in globalThis) {
      const imageBitmap = await createImageBitmap(file)
      return {
        id: generateId(),
        file,
        previewUrl,
        width: imageBitmap.width,
        height: imageBitmap.height,
        imageBitmap,
        focusX: 0.5,
        focusY: 0.5,
      }
    }

    const dimensions = await loadImageDimensions(previewUrl)
    return {
      id: generateId(),
      file,
      previewUrl,
      width: dimensions.width,
      height: dimensions.height,
      focusX: 0.5,
      focusY: 0.5,
    }
  } catch (error) {
    URL.revokeObjectURL(previewUrl)
    throw error
  }
}

const releaseImage = (image: CollageImage) => {
  if (image.imageBitmap) {
    image.imageBitmap.close?.()
  }
  URL.revokeObjectURL(image.previewUrl)
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const loadStoredSettings = (): CollageSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!raw) return DEFAULT_SETTINGS

  try {
    const parsed = JSON.parse(raw) as Partial<CollageSettings>
    const layoutId =
      parsed.layoutId && parsed.layoutId in COLLAGE_LAYOUTS ? parsed.layoutId : DEFAULT_LAYOUT_ID
    const aspectRatioId =
      parsed.aspectRatioId && ASPECT_RATIOS.some((option) => option.id === parsed.aspectRatioId)
        ? parsed.aspectRatioId
        : DEFAULT_SETTINGS.aspectRatioId

    return {
      layoutId,
      aspectRatioId,
      gutter: typeof parsed.gutter === 'number' ? parsed.gutter : DEFAULT_SETTINGS.gutter,
      cornerRadius:
        typeof parsed.cornerRadius === 'number' ? parsed.cornerRadius : DEFAULT_SETTINGS.cornerRadius,
      backgroundColor:
        typeof parsed.backgroundColor === 'string'
          ? parsed.backgroundColor
          : DEFAULT_SETTINGS.backgroundColor,
    }
  } catch (error) {
    console.warn('Failed to read stored settings', error)
    return DEFAULT_SETTINGS
  }
}

interface CollageProviderProps {
  children: ReactNode
}

export const CollageProvider = ({ children }: CollageProviderProps) => {
  const [state, setState] = useState(() => ({
    images: [] as CollageImage[],
    settings: loadStoredSettings(),
  }))

  const latestImages = useRef<CollageImage[]>(state.images)
  latestImages.current = state.images

  useEffect(
    () => () => {
      latestImages.current.forEach(releaseImage)
    },
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings))
    } catch (error) {
      console.warn('Failed to persist settings', error)
    }
  }, [state.settings])

  const layout = useMemo<CollageLayout>(
    () => COLLAGE_LAYOUTS[state.settings.layoutId] ?? COLLAGE_LAYOUTS[DEFAULT_LAYOUT_ID],
    [state.settings.layoutId],
  )

  const aspectRatio = useMemo<AspectRatioOption>(
    () => findAspectRatio(state.settings.aspectRatioId),
    [state.settings.aspectRatioId],
  )

  const addImages = useCallback(async (files: File[]) => {
    if (!files.length) return

    const sanitized = Array.from(files).slice(0, MAX_IMAGES)
    const prepared = await Promise.allSettled(sanitized.map((file) => prepareImage(file)))
    const successful = prepared
      .filter((result): result is PromiseFulfilledResult<CollageImage> => result.status === 'fulfilled')
      .map((result) => result.value)

    if (!successful.length) return

    setState((prev) => {
      const activeLayout =
        COLLAGE_LAYOUTS[prev.settings.layoutId] ?? COLLAGE_LAYOUTS[DEFAULT_LAYOUT_ID]
      const maxAllowed = Math.min(MAX_IMAGES, activeLayout.maxImages)
      const availableSlots = Math.max(0, maxAllowed - prev.images.length)
      if (availableSlots <= 0) {
        successful.forEach(releaseImage)
        return prev
      }

      const incoming = successful.slice(0, availableSlots)
      return {
        ...prev,
        images: [...prev.images, ...incoming],
      }
    })
  }, [])

  const removeImage = useCallback((id: string) => {
    setState((prev) => {
      const target = prev.images.find((image) => image.id === id)
      if (!target) return prev
      releaseImage(target)

      return {
        ...prev,
        images: prev.images.filter((image) => image.id !== id),
      }
    })
  }, [])

  const clearImages = useCallback(() => {
    setState((prev) => {
      prev.images.forEach(releaseImage)
      return {
        ...prev,
        images: [],
      }
    })
  }, [])

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setState((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.images.length) return prev
      if (toIndex < 0 || toIndex >= prev.images.length) return prev

      const next = [...prev.images]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)

      return {
        ...prev,
        images: next,
      }
    })
  }, [])

  const shuffleImages = useCallback(() => {
    setState((prev) => {
      if (prev.images.length <= 1) return prev

      const shuffled = [...prev.images]
      // Fisher-Yates shuffle algorithm
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      return {
        ...prev,
        images: shuffled,
      }
    })
  }, [])

  const updateSettings = useCallback((partial: Partial<CollageSettings>) => {
    setState((prev) => {
      const nextSettings = { ...prev.settings, ...partial }
      const nextLayout =
        COLLAGE_LAYOUTS[nextSettings.layoutId] ?? COLLAGE_LAYOUTS[DEFAULT_LAYOUT_ID]
      const maxAllowed = Math.min(MAX_IMAGES, nextLayout.maxImages)

      let nextImages = prev.images
      if (nextImages.length > maxAllowed) {
        const trimmed = nextImages.slice(maxAllowed)
        trimmed.forEach(releaseImage)
        nextImages = nextImages.slice(0, maxAllowed)
      }

      return {
        images: nextImages,
        settings: nextSettings,
      }
    })
  }, [])

  const setImageFocus = useCallback((id: string, focus: { focusX?: number; focusY?: number }) => {
    if (focus.focusX === undefined && focus.focusY === undefined) return
    setState((prev) => {
      const index = prev.images.findIndex((image) => image.id === id)
      if (index === -1) return prev

      const nextImages = [...prev.images]
      const target = nextImages[index]

      const nextImage: CollageImage = {
        ...target,
        focusX: focus.focusX === undefined ? target.focusX : clamp01(focus.focusX),
        focusY: focus.focusY === undefined ? target.focusY : clamp01(focus.focusY),
      }

      if (nextImage.focusX === target.focusX && nextImage.focusY === target.focusY) {
        return prev
      }

      nextImages[index] = nextImage
      return {
        ...prev,
        images: nextImages,
      }
    })
  }, [])

  const value = useMemo<CollageContextValue>(
    () => ({
      ...state,
      layout,
      aspectRatio,
      addImages,
      removeImage,
      clearImages,
      reorderImages,
      shuffleImages,
      updateSettings,
      setImageFocus,
    }),
    [
      state,
      layout,
      aspectRatio,
      addImages,
      removeImage,
      clearImages,
      reorderImages,
      shuffleImages,
      updateSettings,
      setImageFocus,
    ],
  )

  return <CollageContext.Provider value={value}>{children}</CollageContext.Provider>
}

export const useCollage = () => {
  const context = useContext(CollageContext)
  if (!context) {
    throw new Error('useCollage must be used within a CollageProvider')
  }
  return context
}
