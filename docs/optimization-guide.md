# Optimization Methods — AI Context Guide

> **Purpose:** This document provides AI assistants with accurate technical context about the optimization methods in the TradingView Assistant extension. When a user asks which method to use or how to plan a backtest, use this document to ask the right questions and propose a concrete plan.

---

## Methods Overview

| Method key | JS function | Stops when | Uses paramPriority | Remembers best state |
|---|---|---|---|---|
| `random` | `optAllRandomIteration` | Cycles exhausted | No | No |
| `random improvement` | `optRandomIteration` | Cycles exhausted | No | Yes |
| `sequential` | `optSequentialIteration` | All params scanned | **Yes** | Yes |
| `brute force` | `optBruteForce` | All combinations tested | **Yes** | Yes |
| `annealing` | `optAnnealingIteration` | Cycles exhausted | No | Yes |

---

## Method Details

### `random`
- Each iteration: picks **all parameters randomly**, independent of any previous result.
- No memory. Never converges. Useful only as a baseline.
- **When to use:** You want to explore the full space uniformly, or compare against other methods.

### `random improvement` *(default)*
- Init: all params picked randomly.
- Each iteration: picks **one random param**, assigns a random value **different from current best**. Keeps new state only if result is better.
- Stays near best found state. Can get stuck in local optima.
- **When to use:** 3–5 params, large search space, medium cycle budget.

### `sequential`
- Scans each param one at a time in `paramPriority` order, testing all values in range.
- When the best value for param N is found, moves to param N+1 using that best value as base.
- Terminates early (returns `null`) when all params are scanned — cycles is just an upper bound.
- **Risk:** if params are interdependent, fixing one before optimizing the next gives suboptimal results.
- **When to use:** 2–3 params that are mostly independent. Params with higher impact → lower priority number (scanned first).

### `brute force`
- Tests every combination in `paramPriority` order (nested loop over all params).
- Terminates early when all combinations are exhausted.
- Guaranteed to find global optimum within the range.
- **When to use:** 1–2 params with small range (< 20 values/param). Total combinations < 500.

### `annealing`
- Temperature schedule: `T = T × (1 - 1/cycles)` — linear cooling.
- When `T` is high (early): changes **all params** simultaneously (exploration).
- When `T` is low (late): changes **one param** at a time (exploitation, like `random improvement`).
- Accepts worse solutions with probability `exp(-ΔE / T)` — helps escape local optima.
- **When to use:** 5+ params, or params that are interdependent. Needs enough cycles to cool slowly.
- **Raw benchmark data** (from `annealing.js`, 10 values/param grid, averaged over 10 runs, goal = find global optimum):

  | Params (dims) | Avg iterations to converge |
  |---|---|
  | 1 | ~42 |
  | 2 | ~58 |
  | 3 | ~66 |
  | 4 | ~217 |
  | 5 | ~451 |
  | 6 | ~1,224 |
  | 7 | ~4,296 |
  | 8 | ~16,584 |
  | 9 | ~65,736 |
  | 10 | ~262,344 |

  Pattern: iterations scale approximately as `4^(n-2)` for n ≥ 3. Use this to estimate cycles budget before running. If the required iterations exceed your time budget, reduce the number of params or shrink the range per param.

---

## Quick Decision Tree

```
How many params to optimize?
│
├── 1–2 params
│   └── Range per param?
│       ├── < 20 values → brute force (exhaustive, guaranteed optimal)
│       └── ≥ 20 values → sequential
│
├── 3–4 params
│   └── Are params independent of each other?
│       ├── Yes → sequential or random improvement
│       └── No (interdependent) → annealing
│
└── 5+ params
    └── annealing (random improvement will likely stall)
```

---

## Cycles — Recommended Values

| Method | Formula | Example |
|---|---|---|
| `brute force` | = total combinations | 5 params × 10 values = 100,000 → set 100,000 |
| `sequential` | = sum of all range sizes | params [10, 8, 6] → 24 cycles minimum |
| `random improvement` | ≈ 10% of total combinations (min 50) | 1,000 combinations → 100 cycles |
| `annealing` | ≈ num_params × 50 (min 100) | 5 params → 250 cycles |
| `random` | As high as budget allows | 200–500+ |

> **Note:** For `sequential` and `brute force`, the UI displays the total combination count. Set cycles to that number or higher.

> **Annealing & cooling:** If cycles is too low, temperature drops too fast and the method behaves like `random improvement`. Rule of thumb: annealing needs at least `num_params × 30` cycles to be meaningfully different from random improvement.

---

## paramPriority — For `sequential` and `brute force`

- Set via drag-and-drop in the UI.
- **Priority 1** = scanned first. Put the param with the **highest expected impact** at priority 1.
- For `brute force`, priority determines nesting order (outermost loop = last priority, innermost = first priority).
- Wrong priority does not break correctness for `brute force`, but affects `sequential` quality significantly.

---

## Filter — Use Before Running

- Filter excludes results where a chosen metric is below (or above) a threshold.
- Example: set "Total Closed Trades ≥ 30" to avoid overfitting on few trades.
- Filtered results are **still saved to CSV** with a "Skipped for..." comment — useful for analysis.
- Recommendation: always set a minimum trade count filter equal to ~2× the number of params being optimized.

---

## Recommended 2-Round Workflow

### Round 1 — Explore
| Setting | Value |
|---|---|
| Method | `random improvement` or `annealing` |
| Range | Default (±100% of current value) |
| Cycles | 100–200 |
| Goal | Identify promising region of parameter space |

### Round 2 — Refine
| Setting | Value |
|---|---|
| Method | `sequential` or `brute force` |
| Range | ±20–30% around best result from Round 1 |
| Cycles | Full exhaustive (total combinations) |
| Goal | Find precise optimum within narrowed range |

---

## Analyzing Partial Results & Recommending Next Steps

Use this section when a user already has CSV results from a previous run (e.g., `random` or `random improvement`) and wants AI to analyze the data and suggest what to do next.

### Step 1 — Questions AI Should Ask to Get the Data

Ask the user to provide (paste or upload):
1. **Top N rows** from the CSV sorted by the optimization metric (descending for maximize, ascending for minimize). N = 10–20 is enough.
2. **Total rows in the CSV** (how many combinations were tested).
3. **Param names** and **full range** (min, max, step) for each param being optimized.
4. **Total combinations possible** = product of all range sizes (or have the user report it from the UI).
5. **Which metric** was optimized (e.g., Net Profit, Sharpe Ratio).
6. **Filter applied?** (e.g., min trades). If yes, how many rows were filtered out?

### Step 2 — Coverage Analysis

Calculate: `coverage = rows_tested / total_combinations × 100%`

| Coverage | Interpretation |
|---|---|
| < 5% | Very sparse — best result is likely far from global optimum |
| 5–20% | Partial — good directional signal, not reliable for precise values |
| 20–50% | Moderate — top results are meaningful for narrowing range |
| > 50% | Dense — switch to `brute force` or `sequential` to finish exhaustively |

### Step 3 — Identify Hot Zones in the Data

For each param, look at the **top 10–20% of results** by metric value:
- Find the **min and max** of each param in that top subset.
- This defines the "hot zone" — the narrowed range for Round 2.
- If a param's hot zone spans its full original range → that param may not matter much, or more data is needed.

**Example analysis prompt for AI:**
> "Given these top 20 rows, for each param column compute: min, max, and most frequent value. Flag params where top results cluster tightly (range < 30% of original) as 'influential'. Flag params where top results spread across the full range as 'low signal'."

### Step 4 — Recommend Next Action

Based on coverage and hot zone analysis:

| Situation | Recommended next action |
|---|---|
| Coverage < 10%, hot zones unclear | Run more `random` cycles (add to existing results, same range) |
| Coverage < 10%, at least 1–2 params show tight hot zone | Switch to `annealing` with narrowed range for those params |
| Coverage 10–50%, hot zones found for most params | Run `sequential` or `brute force` within hot zones (Round 2) |
| Coverage > 50% | Run `brute force` with hot zone ranges to finish exhaustively |
| Top results all have same value for 1 param | Fix that param, remove from optimization, re-run with fewer params |

### Step 5 — Propose Concrete Settings

When recommending Round 2, give the user exact numbers:

```
Method:  sequential (or brute force if total combinations < 500)
Params:  [list influential params only]
Ranges:
  param_A: [hot_zone_min, hot_zone_max, original_step]
  param_B: [hot_zone_min, hot_zone_max, original_step]
New total combinations: X × Y = Z
Cycles: Z (exhaustive) or Z × 0.3 (if Z > 1000, use annealing instead)
paramPriority: most influential param first
Filter: keep same as Round 1
```

### Step 6 — Merging Results

- The extension accumulates results across runs (stored in browser storage).
- Reloading or re-running **appends** to existing results, not replaces.
- So Round 1 + Round 2 results will both appear in the final CSV download.
- AI should remind user to download CSV after Round 1 before starting Round 2 with different range settings, because changing ranges resets the param range config.

---

## Q&A — Questions AI Should Ask Before Recommending

When a user asks "which method should I use?" or "how should I plan my test?", ask:

1. **How many params** are you optimizing? (e.g., 2, 5, 10)
2. **How many values per param** in your range? (step size × range width)
3. **How strongly coupled are the params?** All params share the same objective, so they all "interact" to some degree. What matters is: *if you fix param A at a mid-range value, does the optimal value of param B shift significantly?* Strong coupling (e.g., `ema_fast`/`ema_slow` where only the gap matters, or `stop_loss`/`take_profit` ratio) → use `annealing`. Weak coupling (params from different indicator groups) → `sequential` is sufficient.
4. **Speed or quality?** (fast exploration vs. exhaustive search)
5. **Have you run a test before?** (to decide if Round 2 refinement applies)
6. **Minimum trade count?** (for setting the filter threshold)

---

## Warnings from Code

- **`sequential` without paramPriority set:** UI may not enforce order — verify in the strategy params panel before running.
- **Large space + few cycles:** UI shows a warning (`iondvSpaceWarn`). Cycles < 10% of total combinations → results will be sparse.
- **Annealing with cycles < `num_params × 30`:** temperature cools too fast; behaves identically to `random improvement`.
- **`brute force` on large space:** 5 params × 20 values = 3.2M combinations. At ~2–5 seconds/test, this is 1,800+ hours. Reduce range first.
- **paramConditions** (param dependency rules): only `random` (`optAllRandomIteration`) uses `paramConditions` to skip invalid combinations. Other methods ignore it.
