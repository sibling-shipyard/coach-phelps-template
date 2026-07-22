import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="border-2 border-foreground p-8 w-full max-w-sm text-center space-y-4">
        <h1 className="text-xl font-bold uppercase tracking-widest">Coach Phelps</h1>
        <p className="text-sm text-muted-foreground">
          Already set up? Log in. First time, or adding another repo? Sign up.
        </p>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <a href="/api/auth-login">Log in with GitHub</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/api/auth-install">Sign up with GitHub</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
