import { generateRandomString, generateCodeChallenge } from "./_lib/pkce.js";
import { buildCookie, OAUTH_STATE_COOKIE } from "./_lib/session.js";

const CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID ?? "";
const APP_SLUG = process.env.GITHUB_APP_SLUG ?? "coach-phelps";
const OAUTH_STATE_MAX_AGE_SEC = 600; // 10 min - just needs to survive the redirect round trip

// The "Sign up" entry point - always goes through GitHub's install/manage picker, unlike
// auth-login.ts's plain /login/oauth/authorize (which skips straight past it for anyone
// already installed). Used both by first-time users (the only path that makes sense for
// them) and by already-installed users who want to add or switch which repo the App has
// access to - GitHub's own picker handles "not installed yet" vs. "manage existing
// installation" without us needing to distinguish the two ourselves.
//
// Sets its own state+PKCE cookie (same mechanism as auth-login.ts) so that whichever entry
// point the user came through, auth-callback.ts's state validation just works - no
// special-casing needed there.
export default {
  async fetch(req: Request): Promise<Response> {
    if (!CLIENT_ID) {
      return Response.json({ error: "GITHUB_APP_CLIENT_ID not configured" }, { status: 500 });
    }

    const state = generateRandomString(24);
    const codeVerifier = generateRandomString(48);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const url = new URL(req.url);
    const redirectUri = `${url.origin}/api/auth-callback`;

    const installUrl = new URL(`https://github.com/apps/${APP_SLUG}/installations/new`);
    installUrl.searchParams.set("state", state);

    // GitHub Apps configured with "Request user authorization (OAuth) during installation"
    // continue straight into the OAuth authorize step once install completes, using the
    // App's configured callback URL and client_id - passing these through here so that leg
    // carries the same PKCE challenge as a normal authorize request.
    installUrl.searchParams.set("redirect_uri", redirectUri);
    installUrl.searchParams.set("client_id", CLIENT_ID);
    installUrl.searchParams.set("code_challenge", codeChallenge);
    installUrl.searchParams.set("code_challenge_method", "S256");

    const tempValue = JSON.stringify({ state, codeVerifier });

    const headers = new Headers();
    headers.set("Location", installUrl.toString());
    headers.append("Set-Cookie", buildCookie(OAUTH_STATE_COOKIE, tempValue, OAUTH_STATE_MAX_AGE_SEC));

    return new Response(null, { status: 302, headers });
  },
};
