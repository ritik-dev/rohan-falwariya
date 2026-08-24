# Graphify setup (Windows PowerShell). Needs network + Python 3.10+.
# Run from the project root:  .\scripts\setup-graphify.ps1
$ErrorActionPreference = "Stop"

python -m pip install --upgrade graphifyy   # package is graphifyy, CLI is graphify
graphify install                            # Claude Code integration
graphify .                                  # build the graph for this repo

Write-Host ""
Write-Host "Done. Output in graphify-out\:"
Write-Host "  graph.html        interactive map"
Write-Host "  GRAPH_REPORT.md   written analysis"
Write-Host "  graph.json        queryable data Claude Code reads"
