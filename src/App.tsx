import { useStudio } from './hooks/useStudio';
import { useDemoWalkthrough } from './hooks/useDemoWalkthrough';
import Header from './components/Header';
import PatchbayView from './components/PatchbayView';
import ComponentInspector from './components/ComponentInspector';
import AnalysisPanel from './components/AnalysisPanel';
import SonicSignatureStrip from './components/SonicSignatureStrip';

const shellTheme = {
  musician: {
    frame: 'bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_34%),#09090b]',
    glowA: 'bg-emerald-500/10',
    glowB: 'bg-lime-400/8',
  },
  engineer: {
    frame: 'bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.1),transparent_34%),#09090b]',
    glowA: 'bg-red-500/10',
    glowB: 'bg-orange-400/8',
  },
  technical: {
    frame: 'bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_34%),#09090b]',
    glowA: 'bg-yellow-400/10',
    glowB: 'bg-amber-400/8',
  },
} as const;

function App() {
  const {
    state,
    setPerspective,
    setMode,
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
    <div className={`h-screen h-[100svh] flex flex-col text-zinc-200 overflow-hidden transition-colors duration-500 ${theme.frame}`}>
      <Header
        perspective={state.perspective}
        mode={state.mode}
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
            onSelectMic={selectMic}
            onSelectPreamp={selectPreamp}
            onAddInsert={addInsert}
            onAddParallel={addParallel}
            onRemoveInsert={removeInsert}
            onRemoveParallel={removeParallel}
            onReorderInserts={reorderInserts}
            onInspect={inspect}
            equalizers={equalizers}
            outboardProcessors={outboardProcessors}
          />

          {/* Live sonic signature readout */}
          <SonicSignatureStrip signature={state.sonicSignature} />

          {/* Bottom analysis strip */}
          <AnalysisPanel
            perspective={state.perspective}
            mode={state.mode}
            analysis={state.analysis}
            routeSummary={state.routeSummary}
            perspectiveInsight={state.perspectiveInsights[state.perspective]}
            selectedMic={state.selectedMic}
            selectedPreamp={state.selectedPreamp}
            insertChain={state.insertChain}
            parallelChain={state.parallelChain}
            onClearChain={clearChain}
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

            <aside className="fixed inset-x-0 bottom-0 top-20 z-30 overflow-y-auto rounded-t-2xl border border-zinc-800 bg-zinc-950/96 shadow-2xl lg:relative lg:top-auto lg:bottom-auto lg:left-auto lg:right-auto lg:z-10 lg:w-[22rem] lg:rounded-none lg:border-l lg:border-t-0 lg:border-r-0 lg:border-b-0 lg:bg-zinc-950/72 lg:shadow-none lg:backdrop-blur shrink-0">
              <ComponentInspector
                perspective={state.perspective}
                inspectedId={state.inspectedId}
                onInspect={inspect}
                onClose={() => inspect(null)}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
