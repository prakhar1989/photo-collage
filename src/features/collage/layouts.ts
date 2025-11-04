import type { CollageLayout, CollageLayoutId } from './types'

export const COLLAGE_LAYOUTS: Record<CollageLayoutId, CollageLayout> = {
  'two-up': {
    id: 'two-up',
    name: 'Split',
    maxImages: 2,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
  },
  'two-stack': {
    id: 'two-stack',
    name: 'Top/Bottom',
    maxImages: 2,
    cells: [
      { x: 0, y: 0, width: 1, height: 0.5 },
      { x: 0, y: 0.5, width: 1, height: 0.5 },
    ],
  },
  'three-stack': {
    id: 'three-stack',
    name: 'Stack',
    maxImages: 3,
    cells: [
      { x: 0, y: 0, width: 1, height: 1 / 3 },
      { x: 0, y: 1 / 3, width: 1, height: 1 / 3 },
      { x: 0, y: 2 / 3, width: 1, height: 1 / 3 },
    ],
  },
  'three-column': {
    id: 'three-column',
    name: 'Columns',
    maxImages: 3,
    cells: [
      { x: 0, y: 0, width: 1 / 3, height: 1 },
      { x: 1 / 3, y: 0, width: 1 / 3, height: 1 },
      { x: 2 / 3, y: 0, width: 1 / 3, height: 1 },
    ],
  },
  'grid-2x2': {
    id: 'grid-2x2',
    name: 'Grid',
    maxImages: 4,
    cells: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
  'feature-left': {
    id: 'feature-left',
    name: 'Feature Left',
    maxImages: 3,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 1 },
      { x: 0.6, y: 0, width: 0.4, height: 0.5 },
      { x: 0.6, y: 0.5, width: 0.4, height: 0.5 },
    ],
  },
  'featured-center': {
    id: 'featured-center',
    name: 'Centerpiece',
    maxImages: 5,
    cells: [
      { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
      { x: 0.2, y: 0, width: 0.6, height: 0.2 },
      { x: 0.2, y: 0.8, width: 0.6, height: 0.2 },
      { x: 0, y: 0.2, width: 0.2, height: 0.6 },
      { x: 0.8, y: 0.2, width: 0.2, height: 0.6 },
    ],
  },
  mosaic: {
    id: 'mosaic',
    name: 'Mosaic',
    maxImages: 5,
    cells: [
      { x: 0, y: 0, width: 0.6, height: 0.6 },
      { x: 0.6, y: 0, width: 0.4, height: 0.35 },
      { x: 0.6, y: 0.35, width: 0.4, height: 0.65 },
      { x: 0, y: 0.6, width: 0.35, height: 0.4 },
      { x: 0.35, y: 0.6, width: 0.25, height: 0.4 },
    ],
  },
}

export const DEFAULT_LAYOUT_ID: CollageLayoutId = 'mosaic'

export const LAYOUT_OPTIONS = Object.values(COLLAGE_LAYOUTS)
