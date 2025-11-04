import type { ChangeEvent } from 'react'

import { useCollage } from '../CollageProvider'
import { ASPECT_RATIOS } from '../settings'
import { COLLAGE_LAYOUTS, LAYOUT_OPTIONS } from '../layouts'

const formatLabel = (value: number) => `${value}px`

export const ControlsPanel = () => {
  const { settings, updateSettings } = useCollage()

  const handleLayoutChange = (id: string) => {
    if (id === settings.layoutId) return
    if (!(id in COLLAGE_LAYOUTS)) return
    updateSettings({ layoutId: id as typeof settings.layoutId })
  }

  const handleAspectChange = (id: string) => {
    if (id === settings.aspectRatioId) return
    updateSettings({ aspectRatioId: id as typeof settings.aspectRatioId })
  }

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    updateSettings({ [name]: Number(value) } as Partial<typeof settings>)
  }

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSettings({ backgroundColor: event.target.value })
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Layouts</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Choose a preset collage layout that fits your photos best.</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {LAYOUT_OPTIONS.map((option) => {
            const isActive = option.id === settings.layoutId
            return (
              <button
                key={option.id}
                type="button"
                className={[
                  'rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  isActive
                    ? 'border-accent bg-accent/10 text-slate-900'
                    : 'border-border bg-surface text-slate-600 hover:border-slate-300 dark:border-border/60 dark:bg-surface/80 dark:text-slate-200 dark:hover:border-slate-500',
                ].join(' ')}
                onClick={() => handleLayoutChange(option.id)}
              >
                <span className="block text-sm font-semibold dark:text-slate-200">{option.name}</span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  {option.maxImages} slot{option.maxImages > 1 ? 's' : ''}
                </span>
                <span
                  aria-hidden="true"
                  className="mt-3 block h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800"
                />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Aspect ratio</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Match Instagram square, feed, or story sizes.</p>
        <div className="mt-3 flex gap-2">
          {ASPECT_RATIOS.map((option) => {
            const isActive = option.id === settings.aspectRatioId
            return (
              <button
                key={option.id}
                type="button"
                className={[
                  'flex-1 rounded-full border px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'border-accent bg-accent text-white shadow-panel'
                    : 'border-border bg-surface text-slate-600 hover:border-slate-300 dark:border-border/60 dark:bg-surface/80 dark:text-slate-200 dark:hover:border-slate-500',
                ].join(' ')}
                onClick={() => handleAspectChange(option.id)}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-surface p-5 shadow-panel ring-1 ring-border dark:ring-border/60">
        <header>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Spacing & style</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Fine tune the look of your collage.</p>
        </header>

        <label className="block">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Gutter</span>
            <span className="text-slate-400 dark:text-slate-500">{formatLabel(settings.gutter)}</span>
          </div>
          <input
            className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-accent dark:bg-slate-700"
            type="range"
            name="gutter"
            min={0}
            max={48}
            step={4}
            value={settings.gutter}
            onChange={handleRangeChange}
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Corner radius</span>
            <span className="text-slate-400 dark:text-slate-500">{formatLabel(settings.cornerRadius)}</span>
          </div>
          <input
            className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-accent dark:bg-slate-700"
            type="range"
            name="cornerRadius"
            min={0}
            max={64}
            step={4}
            value={settings.cornerRadius}
            onChange={handleRangeChange}
          />
        </label>

        <label className="block">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Background</span>
            <span className="text-slate-400 dark:text-slate-500">{settings.backgroundColor.toUpperCase()}</span>
          </div>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={handleColorChange}
            className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-border bg-transparent dark:border-border/60"
          />
        </label>
      </div>
    </section>
  )
}
