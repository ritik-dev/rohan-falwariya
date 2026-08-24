#!/usr/bin/env bash
# Graphify — builds a queryable knowledge graph of this repo so Claude Code can
# understand it without reading every file (the project claims up to ~70x fewer
# tokens on large repos). https://graphify.net
#
# Needs network + Python 3.10+. Run it once, from the project root.
set -euo pipefail

command -v python3 >/dev/null || { echo "Python 3.10+ required"; exit 1; }

python3 -m pip install --upgrade graphifyy     # package is graphifyy, CLI is graphify
graphify install                               # installs the Claude Code integration
graphify .                                     # build the graph for this repo

echo
echo "Done. Output in graphify-out/:"
echo "  graph.html        interactive map — open it in a browser"
echo "  GRAPH_REPORT.md   the written analysis"
echo "  graph.json        queryable data Claude Code reads"
echo
echo "Re-run 'graphify .' after significant changes — it caches incrementally."
