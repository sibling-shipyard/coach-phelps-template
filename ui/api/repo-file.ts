/**
 * repo-file.ts — fetches the signed-in user's resolved repo's data/aggregate.json
 * via the GitHub Contents API. One call, one file, per the Repo-as-CDN model
 * (WEBSITE_UNIFICATION_PLAN.md Section 7) - not several raw files merged at
 * request time.
 */
import { decryptSession, parseCookies, SESSION_COOKIE } from "./_lib/session.js";

const GH_HEADERS = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

export default {
  async fetch(req: Request): Promise<Response> {
    const cookies = parseCookies(req);
    const raw = cookies[SESSION_COOKIE];
    if (!raw) return Response.json({ error: "Not authenticated" }, { status: 401 });

    const session = await decryptSession(raw);
    if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

    if (!session.repo_full_name) {
      return Response.json({ error: "No repo resolved yet - visit /api/list-my-repos first" }, { status: 400 });
    }

    const contentsRes = await fetch(
      `https://api.github.com/repos/${session.repo_full_name}/contents/data/aggregate.json`,
      { headers: GH_HEADERS(session.gh_token) }
    );

    if (contentsRes.status === 404) {
      return Response.json(
        { error: "data/aggregate.json not found in your repo - has it synced yet?" },
        { status: 404 }
      );
    }
    if (!contentsRes.ok) {
      return Response.json({ error: "Failed to fetch your data" }, { status: 502 });
    }

    const body = await contentsRes.json();
    // Contents API returns base64 content, newline-wrapped.
    let aggregate: unknown;
    try {
      const content = atob((body.content as string).replace(/\n/g, ""));
      aggregate = JSON.parse(content);
    } catch {
      return Response.json({ error: "data/aggregate.json is not valid JSON" }, { status: 502 });
    }

    return new Response(JSON.stringify(aggregate), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Data changes at most once/day, on sync - short cache is plenty.
        "Cache-Control": "private, max-age=180",
      },
    });
  },
};
