import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Repeat } from "lucide-react";
import { Workout, WorkoutsData, WORKOUT_TYPE_CONFIG, formatTimer } from "@/lib/workouts";
import { useTimerEngine } from "./useTimerEngine";
import { TimerScreens } from "./TimerScreens";
import { TimerControls } from "./TimerControls";
import { WorkoutOverview } from "./WorkoutOverview";
import { WorkoutComplete } from "./WorkoutComplete";
import { RepoDataGate } from "@/components/RepoDataGate";
import { useRepoData, type RepoData } from "@/hooks/useRepoData";

// ─── Active Timer ──────────────────────────────────────────────────────────

function ActiveTimer({
  workout,
  onComplete,
  onQuit,
}: {
  workout: Workout;
  onComplete: (elapsed: number) => void;
  onQuit: () => void;
}) {
  const config = WORKOUT_TYPE_CONFIG[workout.workout_type];
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const engine = useTimerEngine(workout, onComplete);
  const {
    state,
    pos,
    timer,
    isPaused,
    setIsPaused,
    totalElapsed,
    progressPct,
    phase,
    exercise,
    isCircuit,
    phaseRounds,
    isRest,
    isPrep,
    isPhaseTransition,
    currentSide,
    nextPreview,
    handleExerciseDone,
    handleGoBack,
    handleSkip,
    handleSkipOptional,
    handleSkipPhase,
  } = engine;

  // Ref to avoid re-registering the keyboard listener on every state change
  const stateRef = useRef(state);
  stateRef.current = state;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showQuitDialog) return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (stateRef.current === "exercise" && exercise?.type === "reps") {
            handleExerciseDone();
          } else {
            setIsPaused((p) => !p);
          }
          break;
        case "Enter":
          e.preventDefault();
          if (stateRef.current === "exercise" && exercise?.type === "reps") {
            handleExerciseDone();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          handleSkip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleGoBack();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showQuitDialog, exercise, handleExerciseDone, setIsPaused, handleSkip, handleGoBack]);

  if (!phase || !exercise) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: isRest ? "#f0fdf4" : isPrep ? "#fefce8" : isPhaseTransition ? "#eff6ff" : "#fff",
        transition: "background-color 0.3s",
      }}
    >
      {/* Top bar */}
      <div className="bg-foreground text-background">
        <div className="container py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuitDialog(true)}
                className="p-1.5 hover:bg-background/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider">
                {workout.title}
              </span>
            </div>
            <span className="text-xs font-mono text-background/60">
              {formatTimer(totalElapsed)}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-background/20">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: config.color }}
          />
        </div>
      </div>

      {/* Phase indicator */}
      <div className="container pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider font-mono px-1.5 py-0.5"
            style={{ backgroundColor: config.color, color: "#fff" }}
          >
            {phase.name}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {pos.exerciseIdx + 1}/{phase.exercises.length}
          </span>
          {isCircuit && (
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Round {pos.roundNum}/{phaseRounds}
            </span>
          )}
          {phase?.optional && (
            <span className="text-[9px] font-mono text-amber-500 uppercase">
              optional
            </span>
          )}
        </div>
        {/* Circuit round progress dots */}
        {isCircuit && phaseRounds > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {Array.from({ length: phaseRounds }, (_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="h-1.5 transition-all duration-300"
                  style={{
                    width: `${Math.max(24, 120 / phaseRounds)}px`,
                    backgroundColor:
                      i < pos.roundNum - 1
                        ? config.color
                        : i === pos.roundNum - 1
                          ? `${config.color}80`
                          : "#e5e7eb",
                  }}
                />
              </div>
            ))}
            <span className="text-[9px] font-mono text-muted-foreground ml-1">
              {pos.roundNum}/{phaseRounds}
            </span>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="container flex-1 flex flex-col justify-center pb-8">
        <TimerScreens
          state={state}
          timer={timer}
          exercise={exercise}
          pos={pos}
          phase={phase}
          isCircuit={isCircuit}
          phaseRounds={phaseRounds}
          currentSide={currentSide}
          nextPreview={nextPreview}
          handleSkipPhase={handleSkipPhase}
        />
      </div>

      {/* Quit confirmation dialog */}
      {showQuitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border-2 border-foreground p-6 mx-4 max-w-sm w-full">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-2">
              Quit Workout?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitDialog(false)}
                className="flex-1 py-2.5 bg-background text-foreground font-bold uppercase tracking-widest text-xs border-2 border-foreground hover:bg-secondary transition-colors"
              >
                Continue
              </button>
              <button
                onClick={onQuit}
                className="flex-1 py-2.5 bg-destructive text-destructive-foreground font-bold uppercase tracking-widest text-xs border-2 border-destructive hover:bg-destructive/90 transition-colors"
              >
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      <TimerControls
        state={state}
        exercise={exercise}
        phase={phase}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        handleExerciseDone={handleExerciseDone}
        handleGoBack={handleGoBack}
        handleSkip={handleSkip}
        handleSkipOptional={handleSkipOptional}
        handleSkipPhase={handleSkipPhase}
      />
    </div>
  );
}

// ─── Orchestrator ──────────────────────────────────────────────────────────

export default function WorkoutTimer() {
  const { data: repoData, loading, error, schemaUnsupported } = useRepoData();
  return (
    <RepoDataGate loading={loading} error={error} schemaUnsupported={schemaUnsupported}>
      {repoData && <WorkoutTimerContent repoData={repoData} />}
    </RepoDataGate>
  );
}

function WorkoutTimerContent({ repoData }: { repoData: RepoData }) {
  const data = repoData.workouts as WorkoutsData;
  const params = useParams<{ id: string }>();
  const workoutId = params.id;

  const workout = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const session = data.sessions.find(
      (s) => s.id === workoutId && s.session_date === today,
    );
    if (session) return session;
    return data.templates.find((t) => t.id === workoutId) ?? null;
  }, [workoutId]);

  const [screen, setScreen] = useState<"overview" | "active" | "complete">("overview");
  const [elapsed, setElapsed] = useState(0);

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold mb-2">Workout not found</p>
          <Link href="/workouts">
            <button className="text-sm text-primary underline">
              Back to workouts
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {screen === "overview" && (
        <WorkoutOverview workout={workout} onStart={() => setScreen("active")} />
      )}
      {screen === "active" && (
        <ActiveTimer
          workout={workout}
          onComplete={(e) => {
            setElapsed(e);
            setScreen("complete");
          }}
          onQuit={() => setScreen("overview")}
        />
      )}
      {screen === "complete" && (
        <WorkoutComplete workout={workout} elapsed={elapsed} />
      )}
    </>
  );
}
