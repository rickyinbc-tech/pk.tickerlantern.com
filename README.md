# Poker Lantern

A browser-only Texas Hold'em learning calculator with English (`index.html`) and Traditional Chinese (`zh.html`) pages. Both pages share `poker.js` (engine, also run as a Web Worker) and `app.js` (UI logic with all visible text for both languages in its `TEXT` object). The language switch carries the current hand between versions within the same browser tab.

Open the site through a local HTTP server (for example `python3 -m http.server --directory public`). Run `node test.js` for evaluator, range, enumeration and sampling checks; it also fails if `public/` is out of sync with the source files.

## What it calculates

- **Equity** against 1–8 opponents. Heads-up on the flop, turn or river it is exact (every legal opponent hand and runout); otherwise it is Monte Carlo with a 95% sampling margin shown.
- **Opponent range**: random hands or the top X% of starting hands, ordered PokerStove-style by all-in equity against one random hand (`tools/build-hand-order.js`). The same preflop range is given to every opponent and is not narrowed by postflop betting.
- **Facing a bet**: break-even equity = call ÷ (pot after call − rake), showdown EV, and the implied-odds amount needed when equity falls short.
- **No bet to call (postflop)**: a sizing table with the fold frequency a bluff needs, B ÷ (P + B), and the equity a caller needs, B ÷ (P + 2B).
- **Preflop opens**: a rule-of-thumb comparison of the hand's raw-equity rank with rough 6-max opening widths by seat. Pairs and suited connected hands are flagged as borderline in late position because raw equity undervalues them.
- **Hand-type distribution** at the river (exact or estimated).

Advice is a conditional heuristic, not solver output. It ignores future betting beyond the stated simplifications, side pots, tournament payouts (ICM) and player tendencies.

After changing a source file, copy it to `public/` (`cp index.html zh.html app.js poker.js language.js style.css public/`) and rerun `node test.js`.
