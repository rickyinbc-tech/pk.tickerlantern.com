# Poker Lantern

A browser-only Texas Hold'em learning calculator. Open `index.html` through a local HTTP server. Run `node test.js` for evaluator and simulation checks. Equity is Monte Carlo against uniformly random opponent hands, not a solver. Advice and sizing are explicitly conditional heuristics; the call ceiling assumes a fixed pot, all-in showdown, and no rake.

The site includes English and Traditional Chinese versions. The language switch carries the current hand between versions within the same browser tab.
