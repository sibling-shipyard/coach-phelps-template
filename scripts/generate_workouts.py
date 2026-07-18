"""Compile templates/*.json into ui/client/src/data/workouts.json.

Run this whenever templates change. Sessions are managed by the coach at session time
and stored in sessions/ — they are not included in the compiled output (the UI resolves
them at runtime against today's date).
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
TEMPLATES_DIR = REPO_ROOT / "templates"
OUTPUT_FILE = REPO_ROOT / "ui" / "client" / "src" / "data" / "workouts.json"

# Order templates are displayed in the UI (matches Workouts.tsx typeOrder)
DISPLAY_ORDER = ["calisthenics_a", "calisthenics_b", "strength_a", "strength_b", "foundation", "recovery"]


def load_templates() -> list[dict]:
    templates = []
    ids_seen = set()

    # Load in display order first, then any remaining templates alphabetically
    ordered_paths = []
    for tid in DISPLAY_ORDER:
        p = TEMPLATES_DIR / f"{tid}.json"
        if p.exists():
            ordered_paths.append(p)

    for p in sorted(TEMPLATES_DIR.glob("*.json")):
        if p not in ordered_paths:
            ordered_paths.append(p)

    for path in ordered_paths:
        data = json.loads(path.read_text())
        tid = data.get("id")
        if tid in ids_seen:
            continue
        ids_seen.add(tid)
        templates.append(data)

    return templates


def main():
    templates = load_templates()
    output = {"templates": templates, "sessions": []}
    OUTPUT_FILE.write_text(json.dumps(output, indent=2) + "\n")
    print(f"Generated {OUTPUT_FILE} with {len(templates)} templates")
    for t in templates:
        print(f"  {t['id']} — {t['title']} ({t['workout_type']})")


if __name__ == "__main__":
    main()
