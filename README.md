# Poker Lantern

A browser-only Texas Hold'em learning calculator with English (`index.html`) and Traditional Chinese (`zh.html`) pages. Both pages share `poker.js` (engine, also run as a Web Worker), `app.js` (hand-analysis UI with all visible text for both languages in its `TEXT` object), `kelly.js` (Kelly math), `kelly-ui.js` (Kelly calculator UI, text in its `KT` object), `sizing.js` (check-versus-bet math) and `sizing-ui.js` (its UI, text in its `SZ` object). The language switch carries the current hand between versions within the same browser tab.

Open the site through a local HTTP server (for example `python3 -m http.server --directory public`). Run `node test.js` for evaluator, range, enumeration, sampling and Kelly-formula checks; it also fails if `public/` is out of sync with the source files. Run `node test-ui.js` for browser UI checks of both language pages: it serves `public/` and `tools/ui-harness.html` on a temporary localhost port and drives them in headless Google Chrome (set `CHROME=/path/to/chrome` if Chrome is installed elsewhere).

## Automatic analysis and synchronization

- **No button needed.** The example is analyzed on load (after every section has attached its listeners), and the page re-analyzes whenever inputs settle. Select changes and committed edits apply at once; typed numbers wait 300 ms and typed cards 450 ms. **Analyze** still forces an immediate update.
- **Probabilities are separate from betting maths.** Results are cached by hole cards, board, number of opponents, range and precision (`probKey` in `app.js`). Changing only the pot, amount to call, stack, position, big blind, rake or bankroll reuses the identical result object. Win, tie and equity stay exactly the same (no resampling jitter) while the decision, Kelly and bet comparison recompute. The results panel says whether probabilities were newly calculated or reused, and lists what can and cannot change them.
- **No stale or out-of-order output.**
  - Every edit first marks all sections as updating.
  - A change that needs new probabilities clears every linked section (`pokerlantern:invalidate`) before the worker starts.
  - Obsolete workers are terminated, and a generation counter ignores any message from them.
  - A worker that finishes while an edit is still pending only caches its result. The pending update then shows it with the newest inputs.
  - Betting edits while the same cards are still being calculated just update the inputs the result will be shown with.
- **Typed cards.** A half-typed card (“As K”, “10”) counts as still typing: guidance, no error, and nothing is calculated from the older cards. Impossible text is an error. A select change clears only its own group's typing state, and unfinished text is never rewritten. Incomplete inputs (missing cards, 1–2 board cards, a blank pot, stack or big blind) show guidance and clear every linked section. Invalid inputs show an error and do the same. The placeholder shows the current (or typed) hole cards, not a fixed example.
- **Linked sections.**
  - Kelly resyncs its split-aware fixed-call model after every analysis that faces a bet. With no bet to call it keeps the manual example and explains why.
  - Bankroll and cap edits update Kelly immediately without any new analysis.
  - “Use my own p and b” persists through betting edits and resyncs on new cards, opponents, range or precision.
  - The bet comparison refreshes its context, amounts and EVs on every analysis. Its whole-range equity sync (default on, can be turned off) fills only equity fields you have not typed in, labels them “synced”, and notes that callers are usually stronger. Fold rates are never filled.
- **Language switch** carries every input, including the exact typed card text (even unfinished or invalid), the bankroll and cap, your own Kelly and comparison entries, and the equity-sync choice. The new page re-analyzes automatically, or waits with guidance if the inputs are incomplete.
- `window.PokerLanternState` exposes `idle()`, `shownKey()`, `cacheSize()` and an inert-by-default `setTestDelay(ms)` used by the browser tests to reproduce slow workers.

## What it calculates

- **Equity** against 1–8 opponents. Heads-up on the flop, turn or river it is exact (every legal opponent hand and runout); otherwise it is Monte Carlo with a 95% sampling margin shown.
- **Opponent range**: random hands or the top X% of starting hands, ordered PokerStove-style by all-in equity against one random hand (`tools/build-hand-order.js`). The same preflop range is given to every opponent and is not narrowed by postflop betting.
- **Facing a bet**: break-even equity = call ÷ (pot after call − rake), showdown EV, and the implied-odds amount needed when equity falls short.
- **No bet to call (postflop)**: a sizing table with the fold frequency a bluff needs, B ÷ (P + B), and the equity a caller needs, B ÷ (P + 2B).
- **Preflop opens**: a rule-of-thumb comparison of the hand's raw-equity rank with rough 6-max opening widths by seat. Pairs and suited connected hands are flagged as borderline in late position because raw equity undervalues them.
- **Hand-type distribution** at the river (exact or estimated).

## Check-versus-bet comparison (`sizing.js`, `sizing-ui.js`)

A limited teaching model for one first bet into one opponent after the flop, with no bet to call. It is not a solver.

- **Formulas** (incremental chips from this decision, pot P already in the middle, bet B matched by a call, no raises, no later betting, no rake): EV(bet) = F × P + (1 − F) × [e × (P + 2B) − B], and EV(check) = e_check × P (check through to showdown). Ties are already inside equity.
- **Your assumptions, never inferred.** For each size you enter an assumed fold rate F and your equity e against the hands that would call that size, plus your equity if you check. Nothing is pre-filled. “Copy showdown equity as a starting assumption” fills only empty equity fields (never fold rates), marks them “copied”, and notes that callers are usually stronger.
- **Sizes:** ⅓, ½, ¾ and 1× pot, plus all-in and a custom amount. Amounts are rounded to cents, and the shown amount is the computed amount. A size at or above the effective stack merges into all-in (listed). A size below the minimum bet (blank = 1 big blind; check your game's rules) is blocked. A short all-in below the minimum is allowed and explained. A custom amount above the stack or below the minimum is an error and is never silently capped.
- **Output per size:** the worked formula, the EV versus checking, the break-even fold rate (at least / at most / always / never), and the EV change per +10 fold points. The summary names the highest modelled EV among completed options only, with an explicit caveat, a ±10-point fold sensitivity check, and the list of options left out.
- **Applicability and sync.** Context (pot, effective stack, big blind, equity) comes from the latest analysis. Facing a bet, multiway and preflop spots show why the model does not apply and keep the existing call/fold analysis. Any hand change clears the comparison; your typed numbers stay, and equity copied from the old analysis is removed. Every new analysis recomputes. A language switch carries only your own entries and recalculates if the previous page had a current result.
- **Outside the model (stated on the page):** raises and minimum-raise or short-all-in reopening rules (your responsibility), later streets and implied odds, rake (a note appears if rake is entered), side pots and multiway, prior betting beyond P, position, and opponents' ranges changing with size (enter per-size assumptions). Kelly is not used to choose a bet size.

## Kelly criterion section

A teaching calculator for J. L. Kelly Jr., “A New Interpretation of Information Rate”, *Bell System Technical Journal* 35(4), 1956 ([Wiley](https://onlinelibrary.wiley.com/doi/10.1002/j.1538-7305.1956.tb03809.x)).

- Inputs: a separately entered **poker bankroll** (not the table or effective stack), win probability p, net winnings per 1 risked b, an optional push probability, and an optional, separately labelled **table-stack cap** that limits only the illustrated stake.
- Formula: f* = (b·p − q) ÷ b with q = 1 − p; with pushes, f* = (b·p − l) ÷ (b·(p + l)) where l = 1 − p − push. Shows quarter, half, full and 2× Kelly with the expected log growth for each, the substituted worked example and a p − 5-point sensitivity line. Zero or negative edge stakes nothing and shows the break-even p; a no-loss input warns that the formula stakes everything.
- **Automatic sync with the hand: a split-aware outcome model.** Every successful analysis where you face a bet builds the outcomes of the fixed call from the engine's results. The engine reports outright wins, splits by number of winners (`splits[n]`, where hero gets 1/n of the pot) and losses, exact for heads-up flop/turn/river and sampled otherwise. Per chip called, with final pot F = pot + call − rake: win (F − call) ÷ call; n-way split (F ÷ n − call) ÷ call; loss −1. Probabilities sum to 1, and E[r] × call equals the hand's showdown EV (equity × F − call) by construction, including rake and multiway splits. `Kelly.analyzeOutcomes` maximizes the concave G(f) = Σ πᵢ ln(1 + rᵢ f) on 0 ≤ f ≤ 1. Its result kinds are `edge` (interior root of G′, found by bisection), `noEdge` (E[r] ≤ 0, so f* = 0), `noLoss` (no negative outcome, so f* = 1) and `boundary` (negative outcomes but none below −1, with G′(1) ≥ 0, so the constrained optimum is f* = 1 and not a root of G′). This is labelled a hypothetical fixed-outcome teaching model: the real call is fixed (call or fold), and the model never recommends an adjustable wager. A sample that happened to show no outright loss never yields an automatic Kelly fraction: it is withheld and explained, with an illustrative fraction assuming a 3/N loss chance. A 100% result is shown only when exact enumeration proves no outcome loses the whole call, and only within the range entered. The page shows the outcome table, the EV identity, the general formula and a worked line, plus an exposure line comparing the fixed call with the bankroll. Your own classical p/b/push fields are hidden while synced and are never overwritten.
- **Sync states** (`kelly-ui.js`, shown in the `#kSync` status line): `manual` (no analysis yet), `synced`, `noCall` (no bet to call, so no fixed payout and no bet size inferred from equity), `noPayout`, `stale` (any hand input changed after an analysis) and `detached` (you pressed “Use my own p and b instead”). Outside `synced`, the classical calculator uses your own numbers; every new analysis resyncs.
- **Language switch** carries the hand inputs, bankroll, cap and your own p/b/push (the hand model is never stored). If the page you leave showed a current result, the new page recalculates it and resyncs; otherwise the Kelly section starts in `manual` mode.
- Kelly assumes a repeatable, independent, fixed-odds win-or-lose bet with known p and a freely chosen stake. Poker bets change opponents' calls, folds, ranges and payoffs, and split pots, rake, side pots and later streets change the payout. The page says this in both languages.

Advice is a conditional heuristic, not solver output. It ignores future betting beyond the stated simplifications, side pots, tournament payouts (ICM) and player tendencies.

Every local CSS/JS reference in both pages carries the same `?v=` version (the Web Worker reuses the page’s versioned `poker.js` URL). When changing any of those files, bump the version in both pages so returning visitors never mix cached old scripts with new HTML; `node test.js` checks that the references are versioned and consistent. After changing a source file, copy it to `public/` (`cp index.html zh.html app.js poker.js kelly.js kelly-ui.js sizing.js sizing-ui.js language.js style.css public/`) and rerun `node test.js` and `node test-ui.js`.

## Accessibility

Text colours meet WCAG AA contrast (4.5:1, or 3:1 for large text) on their actual backgrounds, and the text-style buttons (load example, clear community cards) have 44 px tap targets. `node test-ui.js` audits every visible text node for contrast, checks tap-target sizes, accessible names and horizontal overflow on both language pages at desktop and 375 px phone widths.
