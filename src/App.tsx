import { ControlsPanel } from './features/collage/components/ControlsPanel'
import { PreviewStage } from './features/collage/components/PreviewStage'
import { UploadPanel } from './features/collage/components/UploadPanel'
import { CollageProvider } from './features/collage/CollageProvider'

const App = () => {
  return (
    <CollageProvider>
      <div className="min-h-screen bg-gradient-to-b from-background to-slate-100/80">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Collage Studio</h1>
              <p className="text-sm text-slate-500">
                Build quick, shareable layouts — no account needed.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Instagram ready</span>
              <span>•</span>
              <span>Local only</span>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row">
          <aside className="w-full shrink-0 space-y-8 lg:w-[360px]">
            <ControlsPanel />
            <UploadPanel />
          </aside>
          <section className="flex-1">
            <PreviewStage />
          </section>
        </main>
      </div>
    </CollageProvider>
  )
}

export default App
