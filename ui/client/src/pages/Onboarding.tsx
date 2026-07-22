import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface RepoResult {
  candidates?: string[];
  repo_full_name?: string;
  reason?: "no_owned_repos" | "no_marker_match";
  error?: string;
}

const EMPTY_STATE_COPY: Record<string, { heading: string; body: string }> = {
  no_owned_repos: {
    heading: "No repo granted yet",
    body: "You haven't granted Coach Phelps access to any of your own repos. Sign up again and pick one during install.",
  },
  no_marker_match: {
    heading: "Not set up yet",
    body: "None of the repos you granted access to have a SOUL.md and training/challenge_v2.json. Finish setting one up, then sign in again.",
  },
};

export default function Onboarding({ switchMode = false }: { switchMode?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    fetch(`/api/list-my-repos${switchMode ? "?switch=1" : ""}`)
      .then(async (res) => {
        const data: RepoResult = await res.json();
        if (data.repo_full_name && !switchMode) {
          window.location.href = "/";
          return;
        }
        if (data.candidates) {
          setCandidates(data.candidates);
          setReason(data.reason ?? null);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to look up your repos.");
        setLoading(false);
      });
  }, [switchMode]);

  async function selectRepo(fullName: string) {
    setSelecting(true);
    const res = await fetch(`/api/list-my-repos?select=${encodeURIComponent(fullName)}`);
    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Couldn't select that repo - try again.");
      setSelecting(false);
    }
  }

  const emptyCopy = reason ? EMPTY_STATE_COPY[reason] : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="border-2 border-foreground p-8 w-full max-w-sm text-center space-y-4">
        {loading && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Looking for your coach repo…
          </p>
        )}

        {!loading && error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && candidates.length === 0 && (
          <>
            <h2 className="text-xl font-bold uppercase tracking-widest">
              {switchMode ? "Nothing else to switch to" : emptyCopy?.heading ?? "No repo found"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {switchMode
                ? "This is the only coach-phelps repo granted to your account."
                : emptyCopy?.body ??
                  "None of the repos you granted access to have a SOUL.md and training/challenge_v2.json."}
            </p>
            {switchMode && (
              <Button asChild variant="outline" className="w-full">
                <a href="/">Back to dashboard</a>
              </Button>
            )}
          </>
        )}

        {!loading && !error && candidates.length > 0 && (
          <>
            <h2 className="text-xl font-bold uppercase tracking-widest">
              {switchMode ? "Switch to which repo?" : "Which repo is yours?"}
            </h2>
            <div className="space-y-2">
              {candidates.map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  disabled={selecting}
                  onClick={() => selectRepo(c)}
                  className="w-full justify-start rounded-none border-2 border-foreground font-mono text-xs"
                >
                  {c}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
