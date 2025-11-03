import { DEFAULT_LAYOUT_ID } from './layouts'
import type { AspectRatioOption, CollageSettings } from './types'

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: '1:1', label: 'Square', value: 1 },
  { id: '4:5', label: 'Portrait', value: 4 / 5 },
  { id: '9:16', label: 'Story', value: 9 / 16 },
]

export const DEFAULT_SETTINGS: CollageSettings = {
  layoutId: DEFAULT_LAYOUT_ID,
  aspectRatioId: '4:5',
  gutter: 16,
  cornerRadius: 24,
  backgroundColor: '#ffffff',
}

export const MAX_IMAGES = 5
