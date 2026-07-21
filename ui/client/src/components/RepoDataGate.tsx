import type { ReactNode } from "react";

interface Props {
  loading: boolean;
  error: string | null;
  schemaUnsupported: boolean;
  children: ReactNode;
}

/** Loading/error/schema-mismatch states shared by every page reading useRepoData(). */
export function RepoDataGate({ loading, error, schemaUnsupported, children }: Props) {
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Loading your data…
        </p>
      </div>
    );
  }

  if (schemaUnsupported) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
        <div className="border-2 border-foreground p-8 w-full max-w-sm text-center space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-widest">Repo needs updating</h2>
          <p className="text-sm text-muted-foreground">
            Your repo's data format is newer than what this dashboard supports. Pull the
            latest template changes and sync again.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
        <div className="border-2 border-foreground p-8 w-full max-w-sm text-center space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-widest">Couldn't load your data</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
