import { Suspense, lazy } from 'react';
import { useStudio } from './hooks/useStudio';
import { useDemoWalkthrough } from './hooks/useDemoWalkthrough';
import Header from './components/Header';
import PatchbayView from './components/PatchbayView';

const ComponentInspector = lazy(() => import('./components/ComponentInspector'));

const shellTheme = {
  musician: {
    frame: 'bg-[var(--sa-black)]',
    glowA: 'bg-emerald-500/12',
    glowB: 'bg-lime-400/8',
  },
  engineer: {
    frame: 'bg-[var(--sa-black)]',
    glowA: 'bg-red-500/12',
    glowB: 'bg-orange-400/8',
  },
  technical: {
    frame: 'bg-[var(--sa-black)]',
    glowA: 'bg-yellow-400/12',
    glowB: 'bg-amber-400/8',
  },
} as const;

function App() {
  const {
    state,
    setPerspective,
    setMode,
    setSearch,
    selectMic,
    selectPreamp,
    addInsert,
    addParallel,
    removeInsert,
    removeParallel,
    reorderInserts,
    inspect,
    clearChain,
    equalizers,
    outboardProcessors,
    microphones,
    preamps,
    compressors,
  } = useStudio();

  const demo = useDemoWalkthrough({
    mode: state.mode,
    microphones,
    preamps,
    compressors,
    equalizers,
    onSelectMic: selectMic,
    onSelectPreamp: selectPreamp,
    onAddInsert: addInsert,
    onClearChain: clearChain,
    onSetMode: setMode,
  });

  const theme = shellTheme[state.perspective];

  return (
    <div className={`studio-atlas-shell lens-${state.perspective} mode-${state.mode} h-screen h-[100svh] flex flex-col overflow-hidden text-zinc-200 transition-colors duration-500 ${theme.frame}`}>
      <Header
        perspective={state.perspective}
        mode={state.mode}
        searchQuery={state.searchQuery}
        onSearch={setSearch}
        onPerspective={setPerspective}
        onMode={setMode}
        demoState={demo.demoState}
        demoNarration={demo.narration}
        onStartDemo={demo.start}
        onCancelDemo={demo.cancel}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className={`absolute left-0 top-0 h-72 w-72 rounded-full blur-3xl transition-colors duration-500 ${theme.glowA}`} />
          <div className={`absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl transition-colors duration-500 ${theme.glowB}`} />
        </div>
        {/* Main content area */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          <PatchbayView
            perspective={state.perspective}
            mode={state.mode}
            selectedMic={state.selectedMic}
            selectedPreamp={state.selectedPreamp}
            insertChain={state.insertChain}
            parallelChain={state.parallelChain}
            analysis={state.analysis}
            routeSummary={state.routeSummary}
            perspectiveInsight={state.perspectiveInsights[state.perspective]}
            sonicSignature={state.sonicSignature}
            searchQuery={state.searchQuery}
            onSelectMic={selectMic}
            onSelectPreamp={selectPreamp}
            onAddInsert={addInsert}
            onAddParallel={addParallel}
            onRemoveInsert={removeInsert}
            onRemoveParallel={removeParallel}
            onReorderInserts={reorderInserts}
            onInspect={inspect}
            onClearChain={clearChain}
            equalizers={equalizers}
            outboardProcessors={outboardProcessors}
          />
        </div>

        {/* Component Inspector */}
        {state.inspectedId && (
          <>
            <button
              type="button"
              aria-label="Close inspector"
              onClick={() => inspect(null)}
              className="fixed inset-0 z-20 bg-zinc-950/70 backdrop-blur-sm lg:hidden"
            />

            <aside className="fixed inset-x-0 bottom-0 top-24 z-30 overflow-y-auto mat-brushed-dark rounded-t-[3px] border border-zinc-800/30 shadow-2xl lg:relative lg:top-auto lg:bottom-auto lg:left-auto lg:right-auto lg:z-10 lg:w-[22rem] lg:rounded-none lg:border-l lg:border-t-0 lg:border-r-0 lg:border-b-0 lg:border-zinc-800/20 lg:shadow-none shrink-0">
              <div className="sticky top-0 z-10 border-b border-zinc-800/20 mat-brushed-dark px-4 py-2 lg:hidden">
                <div className="mx-auto mb-2 h-1 w-12 rounded-[2px] bg-zinc-700/40" />
                <div className="text-silkscreen-faint text-[8px]">Focused gear view</div>
              </div>
              <Suspense fallback={<div className="p-4 text-sm text-zinc-500">Loading inspector…</div>}>
                <ComponentInspector
                  perspective={state.perspective}
                  inspectedId={state.inspectedId}
                  onInspect={inspect}
                  onClose={() => inspect(null)}
                />
              </Suspense>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
