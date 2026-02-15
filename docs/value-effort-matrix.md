# Value vs Effort Matrix

**Speechify Learning Companion - Feature Prioritization**

*David O | Pursuit AI Fellowship*

---

## Matrix Overview

| Quadrant | Action | Features |
|----------|--------|----------|
| High Value, Low Effort | **Do First** | Quiz generation, basic dashboard, auth |
| High Value, High Effort | Plan carefully | Full retention analytics, advanced TTS |
| Low Value, Low Effort | Do if time | Dark mode, CSV export |
| Low Value, High Effort | Defer | Mobile apps, social features |

---

## David O Scope - Prioritized Items

| Item | Value (1-10) | Effort (1-10) | Quadrant | Action |
|------|--------------|---------------|----------|--------|
| Auth + Database | 10 | 4 | High/Low | Do first |
| Session + Quiz APIs | 9 | 5 | High/Low | Do first |
| Dashboard analytics | 8 | 4 | High/Low | Do second |
| Score trends chart data | 7 | 3 | High/Low | Do second |
| Streak calculation | 6 | 4 | Medium | Do if time |
| MoSCoW / Value-Effort docs | 5 | 1 | High/Low | Done |

---

## Implementation Order

1. **Auth + DB** — Foundation for all endpoints
2. **Session + Quiz APIs** — Core data flow for learning companion
3. **Dashboard analytics** — Retention metrics (total quizzes, avg score)
4. **Score trends** — Last 7 sessions for chart
5. **Streak** — Consecutive days with quiz activity

---

## Decision Rationale

- **Learning Companion Mode** sits in **High Value, Low-Medium Effort**
- Quiz generation: Value 9/10, Effort 5/10 — leverages GPT API
- Basic dashboard: Value 7/10, Effort 4/10 — standard React charting
- Optimal quadrant for Week 4 sprint feasibility
