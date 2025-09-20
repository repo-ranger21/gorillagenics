# gpicks.py
# Guerillagenics 3-Pick Builder: EV, win prob, correlation, and slip validation
# Usage:
#   python gpicks.py --csv picks.csv --slip "1,3,5"
#   python gpicks.py --csv picks.csv --suggest 10 --script "BUF_control" --export out.csv

import argparse
import math
import sys
from dataclasses import dataclass
from typing import List, Optional, Tuple, Dict
import pandas as pd

# --- Stat-type sigma defaults (tunable): std dev as % of line or absolute fallback ---
SIGMA_RULES = {
    # stat_type: (percent_of_line, absolute_floor)
    "receiving_yards": (0.28, 9.0),
    "receptions": (0.38, 1.2),
    "rushing_yards": (0.30, 10.0),
    "rush_rec_yards": (0.27, 12.0),
    "passing_yards": (0.22, 18.0),
    "passing_tds": (0.55, 0.6),
    "rushing_tds": (0.70, 0.5),
    "fantasy_points": (0.40, 4.0),
}

# --- Simple volatility tags by role archetype (enhance over time) ---
ARCH_VOL = {
    "alpha_wr": 0.9,   # high usage, lower variance
    "slot_wr": 1.0,
    "field_stretcher": 1.2,
    "rb1": 0.95,
    "rb2": 1.1,
    "pass_rb": 1.05,
    "te1": 1.05,
    "te2": 1.25,
    "qb": 0.9,
    "other": 1.1,
}

# --- Correlation priors by pair of stat types within a game script ---
# Positive numbers mean outcomes tend to hit together.
# Negative numbers mean they tend to oppose each other.
# Keys are tuples (stat_a, stat_b, script_name)
CORR_PRIORS = {
    ("passing_yards", "receiving_yards", "shootout"): 0.45,
    ("passing_yards", "receptions", "shootout"): 0.40,
    ("passing_yards", "receiving_yards", "BUF_control"): 0.30,
    ("rushing_yards", "passing_yards", "BUF_control"): -0.10,
    ("rushing_yards", "receptions", "BUF_control"): 0.05,
    ("rush_rec_yards", "passing_yards", "shootout"): 0.25,
    ("rush_rec_yards", "receiving_yards", "shootout"): 0.20,
    ("receptions", "receiving_yards", "neutral"): 0.35,
    ("rushing_yards", "rush_rec_yards", "neutral"): 0.30,
}

@dataclass
class Pick:
    id: int
    player: str
    team: str
    opponent: str
    stat_type: str           # e.g., receiving_yards, receptions, rush_rec_yards
    line: float
    projection: float
    role_archetype: str      # e.g., alpha_wr, rb1, te1
    script_hint: str         # e.g., shootout, BUF_control, neutral

    # Computed
    ev_pct: float = 0.0
    win_prob: float = 0.0
    rec: str = ""
    sigma: float = 0.0
    role_tag: str = ""       # Anchor / Correlation / Low-Variance

def normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

def get_sigma(stat_type: str, line: float, role_archetype: str) -> float:
    pct, floor = SIGMA_RULES.get(stat_type, (0.30, 10.0))
    vol_mult = ARCH_VOL.get(role_archetype, 1.1)
    base = max(line * pct, floor)
    return base * vol_mult

def compute_win_prob(line: float, proj: float, sigma: float, direction: str) -> float:
    # P(X > line) for Over, P(X < line) for Under under Normal(proj, sigma)
    z = (line - proj) / sigma
    if direction.lower() == "over":
        return 1.0 - normal_cdf(z)
    else:
        return normal_cdf(z)

def classify_role(ev_pct: float, win_prob: float, stat_type: str, role_archetype: str) -> str:
    # Anchor: strong edge + probability
    if ev_pct >= 12.0 and win_prob >= 0.62:
        return "Anchor"
    # Low-Variance: receptions, TE1 short aDOT, RB1 rush modest line with win_prob >= 0.58
    if (stat_type in ["receptions", "rushing_yards", "receiving_yards"] and
        role_archetype in ["te1", "rb1", "slot_wr"] and win_prob >= 0.58):
        return "Low-Variance"
    return "Correlation"

def score_pick(p: Pick) -> Pick:
    p.sigma = get_sigma(p.stat_type, p.line, p.role_archetype)
    direction = "Over" if p.projection >= p.line else "Under"
    p.rec = direction
    p.win_prob = compute_win_prob(p.line, p.projection, p.sigma, direction)
    # EV% as relative gap, capped for sanity
    gap = (p.projection - p.line)
    denom = max(abs(p.line), 1e-6)
    p.ev_pct = max(min((gap / denom) * 100.0, 60.0), -60.0)
    p.role_tag = classify_role(p.ev_pct, p.win_prob, p.stat_type, p.role_archetype)
    return p

def pair_corr(a: Pick, b: Pick, script_name: str) -> float:
    key = (a.stat_type, b.stat_type, script_name)
    rev = (b.stat_type, a.stat_type, script_name)
    return CORR_PRIORS.get(key, CORR_PRIORS.get(rev, 0.0))

def slip_quality(picks: List[Pick], script_name: str) -> Dict[str, float]:
    # Role mix
    anchors = sum(1 for p in picks if p.role_tag == "Anchor")
    lows = sum(1 for p in picks if p.role_tag == "Low-Variance")
    cors = sum(1 for p in picks if p.role_tag == "Correlation")
    role_score = (anchors >= 1) + (lows >= 1) + (cors >= 1)

    # Correlation sum
    corr_sum = 0.0
    for i in range(len(picks)):
        for j in range(i + 1, len(picks)):
            corr_sum += pair_corr(picks[i], picks[j], script_name)

    # EV and probability
    avg_ev = sum(p.ev_pct for p in picks) / len(picks)
    avg_prob = sum(p.win_prob for p in picks) / len(picks)

    # Heuristic overall score
    overall = 0.4 * (avg_prob * 100) + 0.3 * (avg_ev + 100) + 0.3 * (corr_sum * 100 / 3)
    return {
        "anchors": anchors,
        "low_variance": lows,
        "correlation_picks": cors,
        "corr_sum": corr_sum,
        "avg_ev_pct": avg_ev,
        "avg_win_prob": avg_prob,
        "overall_score": overall,
        "grade": "A" if (role_score == 3 and corr_sum >= 0.35 and avg_prob >= 0.63) else
                 "B" if (role_score >= 2 and corr_sum >= 0.20 and avg_prob >= 0.60) else
                 "C"
    }

def suggest_slips(df: pd.DataFrame, top_k: int, script_name: str) -> pd.DataFrame:
    # Evaluate all 3-combinations and rank by overall score
    from itertools import combinations
    picks = [row_to_pick(r) for _, r in df.iterrows()]
    picks = [score_pick(p) for p in picks]
    rows = []
    for a, b, c in combinations(picks, 3):
        q = slip_quality([a, b, c], script_name)
        rows.append({
            "ids": f"{a.id},{b.id},{c.id}",
            "players": f"{a.player} | {b.player} | {c.player}",
            "avg_win_prob": round(q["avg_win_prob"] * 100, 2),
            "avg_ev_pct": round(q["avg_ev_pct"], 2),
            "corr_sum": round(q["corr_sum"], 3),
            "overall_score": round(q["overall_score"], 1),
            "grade": q["grade"]
        })
    out = pd.DataFrame(rows).sort_values(["grade", "overall_score", "corr_sum"], ascending=[True, False, False])
    # reorder with grade priority A>B>C
    grade_order = {"A": 0, "B": 1, "C": 2}
    out["grade_rank"] = out["grade"].map(grade_order)
    out = out.sort_values(["grade_rank", "overall_score"], ascending=[True, False]).drop(columns=["grade_rank"])
    return out.head(top_k)

def row_to_pick(r: pd.Series) -> Pick:
    return Pick(
        id=int(r["id"]),
        player=str(r["player"]),
        team=str(r.get("team", "")),
        opponent=str(r.get("opponent", "")),
        stat_type=str(r["stat_type"]),
        line=float(r["line"]),
        projection=float(r["projection"]),
        role_archetype=str(r.get("role_archetype", "other")),
        script_hint=str(r.get("script_hint", "neutral"))
    )

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True, help="CSV with columns: id,player,team,opponent,stat_type,line,projection,role_archetype,script_hint")
    ap.add_argument("--slip", help="Comma-separated IDs for a 3-pick slip (e.g., '1,2,3')")
    ap.add_argument("--suggest", type=int, default=0, help="Suggest top-K 3-pick slips")
    ap.add_argument("--script", default="neutral", help="Script for correlation priors (shootout, BUF_control, neutral)")
    ap.add_argument("--export", help="Export table to CSV")
    args = ap.parse_args()

    try:
        df = pd.read_csv(args.csv)
    except Exception as e:
        print(f"Failed to read CSV: {e}")
        sys.exit(1)

    if args.slip:
        ids = [int(x.strip()) for x in args.slip.split(",")]
        sub = df[df["id"].isin(ids)].copy()
        if len(sub) != 3:
            print("Please provide exactly three IDs.")
            sys.exit(1)
        picks = [score_pick(row_to_pick(r)) for _, r in sub.iterrows()]
        rows = []
        for p in picks:
            rows.append({
                "id": p.id,
                "player": p.player,
                "stat": p.stat_type,
                "line": p.line,
                "projection": p.projection,
                "sigma": round(p.sigma, 2),
                "win_prob%": round(p.win_prob * 100, 2),
                "ev%": round(p.ev_pct, 2),
                "rec": p.rec,
                "role": p.role_tag,
            })
        out = pd.DataFrame(rows)
        q = slip_quality(picks, args.script)
        print("\n--- 3-Pick Evaluation ---")
        print(out.to_string(index=False))
        print("\nSlip Metrics:",
              f"\n - Anchors: {q['anchors']}",
              f"\n - Low-Variance: {q['low_variance']}",
              f"\n - Corr Sum: {round(q['corr_sum'],3)}", 
              f"\n - Avg Win Prob: {round(q['avg_win_prob']*100,2)}%", 
              f"\n - Avg EV: {round(q['avg_ev_pct'],2)}%", 
              f"\n - Overall Score: {round(q['overall_score'],1)}", 
              f"\n - Grade: {q['grade']}")
        if args.export:
            out.to_csv(args.export, index=False)
            print(f"\nExported picks to {args.export}")

    if args.suggest:
        print("\n--- Suggested 3-Pick Slips ---")
        suggestions = suggest_slips(df, args.suggest, args.script)
        print(suggestions.to_string(index=False))
        if args.export:
            suggestions.to_csv(args.export, index=False)
            print(f"\nExported suggestions to {args.export}")

if __name__ == "__main__":
    main()