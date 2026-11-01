# Poker Lantern

A browser-only Texas Hold'em learning calculator with English (`index.html`) and Traditional Chinese (`zh.html`) pages. Both pages share `poker.js` (engine, also run as a Web Worker), `app.js` (hand-analysis UI with all visible text for both languages in its `TEXT` object), `kelly.js` (Kelly math) and `kelly-ui.js` (Kelly calculator UI, text in its `KT` object). The language switch carries the current hand between versions within the same browser tab.

Open the site through a local HTTP server (for example `python3 -m http.server --directory public`). Run `node test.js` for evaluator, range, enumeration, sampling and Kelly-formula checks; it also fails if `public/` is out of sync with the source files. Run `node test-ui.js` for browser UI checks of both language pages: it serves `public/` and `tools/ui-harness.html` on a temporary localhost port and drives them in headless Google Chrome (set `CHROME=/path/to/chrome` if Chrome is installed elsewhere).

## What it calculates

- **Equity** against 1–8 opponents. Heads-up on the flop, turn or river it is exact (every legal opponent hand and runout); otherwise it is Monte Carlo with a 95% sampling margin shown.
- **Opponent range**: random hands or the top X% of starting hands, ordered PokerStove-style by all-in equity against one random hand (`tools/build-hand-order.js`). The same preflop range is given to every opponent and is not narrowed by postflop betting.
- **Facing a bet**: break-even equity = call ÷ (pot after call − rake), showdown EV, and the implied-odds amount needed when equity falls short.
- **No bet to call (postflop)**: a sizing table with the fold frequency a bluff needs, B ÷ (P + B), and the equity a caller needs, B ÷ (P + 2B).
- **Preflop opens**: a rule-of-thumb comparison of the hand's raw-equity rank with rough 6-max opening widths by seat. Pairs and suited connected hands are flagged as borderline in late position because raw equity undervalues them.
- **Hand-type distribution** at the river (exact or estimated).

## Kelly criterion section

A teaching calculator for J. L. Kelly Jr., “A New Interpretation of Information Rate”, *Bell System Technical Journal* 35(4), 1956 ([Wiley](https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1956.tb03809.x)).

- Inputs: a separately entered **poker bankroll** (not the table or effective stack), win probability p, net winnings per 1 risked b, an optional push probability, and an optional, separately labelled **table-stack cap** that limits only the illustrated stake.
- Formula: f* = (b·p − q) ÷ b with q = 1 − p; with pushes, f* = (b·p − l) ÷ (b·(p + l)) where l = 1 − p − push. Shows quarter, half, full and 2× Kelly with the expected log growth for each, the substituted worked example and a p − 5-point sensitivity line. Zero or negative edge stakes nothing and shows the break-even p; a no-loss input warns that the formula stakes everything.
- Hand results are used **only when the reader presses “Use this hand’s call as an example”**, and only when facing a bet. p is set to the outright win rate (ties counted as losses), never to equity; b = (pot − rake) ÷ call. The note lists win, tie and equity separately along with every payout assumption. The exposure line compares the fixed call with the bankroll and says that a partial call is not possible: Kelly does not choose the call amount.
- Kelly assumes a repeatable, independent, fixed-odds win-or-lose bet with known p and a freely chosen stake. Poker bets change opponents' calls, folds, ranges and payoffs, and split pots, rake, side pots and later streets change the payout. The page says this in both languages.

Advice is a conditional heuristic, not solver output. It ignores future betting beyond the stated simplifications, side pots, tournament payouts (ICM) and player tendencies.

After changing a source file, copy it to `public/` (`cp index.html zh.html app.js poker.js kelly.js kelly-ui.js language.js style.css public/`) and rerun `node test.js` and `node test-ui.js`.
