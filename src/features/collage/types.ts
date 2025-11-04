export type CollageLayoutId = 'two-up' | 'three-stack' | 'grid-2x2' | 'mosaic';

export interface LayoutCell {
  /** Normalized x coordinate between 0 and 1 */
  x: number;
  /** Normalized y coordinate between 0 and 1 */
  y: number;
  /** Normalized width between 0 and 1 */
  width: number;
  /** Normalized height between 0 and 1 */
  height: number;
}

export interface CollageLayout {
  id: CollageLayoutId;
  name: string;
  cells: LayoutCell[];
  maxImages: number;
  preview?: string;
}

export type AspectRatioId = '1:1' | '4:5' | '9:16';

export interface AspectRatioOption {
  id: AspectRatioId;
  label: string;
  /** width/height ratio */
  value: number;
}

export interface CollageSettings {
  layoutId: CollageLayoutId;
  aspectRatioId: AspectRatioId;
  gutter: number;
  cornerRadius: number;
  backgroundColor: string;
}

export interface CollageImage {
  id: string;
  file: File;
  /**
   * Object URL for quick preview rendering.
   * Created via URL.createObjectURL and revoked when removed.
   */
  previewUrl: string;
  /** Size metadata after decoding */
  width: number;
  height: number;
  imageBitmap?: ImageBitmap;
  /** Normalized crop focus (0 = start, 1 = end) */
  focusX: number;
  focusY: number;
}

export interface CollageState {
  images: CollageImage[];
  settings: CollageSettings;
}

export interface CollageContextValue extends CollageState {
  layout: CollageLayout;
  aspectRatio: AspectRatioOption;
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearImages: () => void;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  updateSettings: (partial: Partial<CollageSettings>) => void;
  setImageFocus: (id: string, focus: { focusX?: number; focusY?: number }) => void;
}
