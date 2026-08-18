# SIH 2026 — CodeStorm Presentation Script

**Team:** CodeStorm · **Product:** SkillSaarthi (skillसारथी) · **PS ID:** 25094
**Theme:** Education & Skill Development · **Live Demo:** https://skillsaarthi.vercel.app

**Total runtime:** ~7 minutes (Q&A after)

---

## Speaker Line-up & Timings

| # | Speaker | Role | Time |
|---|---------|------|------|
| 1 | Speaker A | Hook + Problem | 0:00 – 1:00 |
| 2 | Speaker B | Our Solution + 3-Layer System | 1:00 – 2:15 |
| 3 | Speaker C | Live Demo Walkthrough | 2:15 – 3:45 |
| 4 | Speaker D | Technical Architecture + Uniqueness | 3:45 – 4:45 |
| 5 | Speaker E | Feasibility, Business Model, Risk | 4:45 – 5:45 |
| 6 | Speaker F | Impact + Conclusion + Ask | 5:45 – 7:00 |

> **Prep tips:** Rehearse the transitions (each speaker ends with a call-back line). The demo speaker (C) must run the full flow 3 times on rehearsal day — signup → onboarding → recommend → roadmap → what-if. Have the fallback story ready if the network fails.

---

## SPEAKER A — The Hook & The Problem (0:00 – 1:00)

Good morning everyone. The Smart India Hackathon. Sixteen hundred problem statements. Thousands of teams. And yet — for every Indian student sitting in this room or any college, the biggest unsolved question isn't an algorithm. It's three tiny questions.

*Which career is right for me? What skills do I actually need? And what am I missing right now?*

Let me show you how broken this is. India Skills Report 2025 — from AICTE and Wheebox — tells us **only half of engineering graduates are employable**. Half. Not because they're not talented, but because no one tells them *what to learn*. Generic career advice says "learn coding." YouTube says "do AI." Nobody gives a data-driven, phased answer.

The result? **Fragmentation.** Career info is scattered across a dozen websites. **Uncertainty.** Students guess. They waste tuition on irrelevant courses. They lose months before placement season. This is not a talent problem — it is an **information problem**. And it's exactly what our problem statement asked us to solve.

My teammate will now show you how we turned that chaos into a one-stop answer. Let me welcome Speaker B, and **SkillSaarthi** — the one-stop personalized career and education advisor.

---

## SPEAKER B — Our Solution: The 3-Layer Intelligence System (1:00 – 2:15)

Thank you, A. So instead of *one-size-fits-all counselling*, SkillSaarthi gives every student an **actionable, data-driven learning roadmap**. And it does it through what we call a **3-Layer Intelligence System**.

**Layer 1 — The Data Engine.** Our Appwrite backend securely captures a student's education, self-assessed skills, interests, assessment scores — *and* it can automatically parse their public GitHub activity and even a PDF resume. No tedious manual entry.

**Layer 2 — The Match & Gap Layer.** A hybrid scoring engine — Python + FastAPI — evaluates the profile against **13+ strict career datasets**. It doesn't just say "try software engineering." It says precisely *which* careers fit, and **exactly which skills are missing** — with a 6-factor weighted formula: 40% skill match, 20% interests, 15% assessment, the rest education, goals and experience.

**Layer 3 — The Action Layer.** This is where the magic happens. Dynamic, **phased learning roadmaps** are generated **in under 1.5 seconds** — linking to real courses and relevant internships.

And our two **unique innovations**: the **What-If Simulator** — students can ask *"what if I learn Docker?"* and watch their career match scores shift *before* investing time. And **Automated Profiling** — AI that reads your GitHub and resume so the system knows you, without you filling twenty forms.

Enough theory. Let me open the product — Speaker C, the floor is yours.

---

## SPEAKER C — Live Demo Walkthrough (2:15 – 3:45)

> **The demo is the heart of the presentation. Practice it cold. If you can't go live, drive it from screenshots/screen-recording.**

Thank you, B. Let me show you SkillSaarthi in action — live, right now at **skillsaarthi.vercel.app**.

**Step 1 — Sign up & onboarding.** [20 sec] We sign up as a student. Watch the onboarding wizard adapt — it walks us through education level, skills with proficiency, interests, and a 10-question career assessment. Everything in one place. No fragmentation.

**Step 2 — Get recommendations.** [25 sec] One click. Here come the ranked careers — Full Stack Developer 87%, Software Engineer 82%, Backend 76%. And this is beautiful — every score is *explainable*. The app tells us *why* each career matches: your React skills are strong, your interests point to web development.

**Step 3 — Skill gaps.** [20 sec] We click one career. It shows a clean breakdown: *JavaScript — strong. Node.js — developing. Docker — beginner.* This is the gap analysis that generic advisors never give us.

**Step 4 — The roadmap.** [25 sec] One more click — and in under 1.5 seconds we get a **phased plan**: Phase 1, advanced JavaScript. Phase 2, Node and Express. Phase 3, SQL. Right up to Phase 6, resume and interview prep. Every task is trackable — start, complete, even reorder.

**Step 5 — The killer feature.** [20 sec] The **What-If Simulator**. What if I add *Python at level 4*? Watch the rankings shift in real time. That's *safe experimentation* — the real profile is never touched.

And if we had time: upload a resume, it auto-extracts skills with confidence; connect your GitHub, it builds a technical profile automatically.

Speaker D, behind these clicks is an architecture I think the judges will love.

---

## SPEAKER D — Technical Architecture & Uniqueness (3:45 – 4:45)

Thank you, C. Here's the engine room — a **Tri-Service microarchitecture**:

- **React + Tailwind** frontend — deployed on Vercel.
- **Node.js + Express** backend — the orchestrator, all business logic — on Render.
- **Python + FastAPI** AI service — the brain — on Render.
- And **Appwrite Cloud** handles authentication, database, storage, realtime, messaging.

Three decoupled services, one product. And three engineering decisions that make us *different*:

**One — the Cold-Start Scorer.** Most recommendation systems die without huge datasets. Ours is a **hybrid weighted formula** — 40/20/15/10/10/5 across skills, interests, assessment, education, goals, experience — so it's accurate from day one, with **zero historical data needed**.

**Two — Deterministic Roadmaps.** Full multiphase synthesis executes in ~1.5 seconds with complete progress-state persistence.

**Three — Resilience, by design.** We built for the real world: inconsistent, letter-spaced PDFs? Our custom `densify_text` normalizer pre-processes glyphs before keyword extraction. AI service down? An automatic fallback engine in Node returns deterministic estimates tagged `fallback` — the app *never* goes dark. Skill drift in industry? Automated feed importers with a **30-day listing TTL** keep the catalog fresh.

And the quality bar — **44 passing automated tests** across the AI service: ranking, explainability, resume parsing, comparison, what-if simulation.

Speaker E — here's how we make this viable, not just impressive.

---

## SPEAKER E — Feasibility, Business Model & Risk (4:45 – 5:45)

Thank you, D. An impactful solution must be *sustainable*. Here's the ecosystem we're building.

**Business model — four revenue streams:**

1. **B2C Freemium** — free gap analysis and roadmaps for everyone; premium subscriptions unlock the What-If sandbox and ATS resume analysis.
2. **B2B College TPO Portals** — batch-level skill analytics and curriculum-gap dashboards for university placement cells. This is a *very* large market in India.
3. **Hiring Pipeline** — monetized candidate matching that feeds skill-verified talent to recruitment partners.
4. **Sponsored Industry Projects** — B2B partners host real-world challenges and mini-hackathons for direct talent scouting.

**Target market:** we're designed to scale across India's **1 to 1.5 lakh higher-education students** every year navigating non-standardized curricula.

**Feasibility — already proven.** This is not a mock-up. The product is built, deployed, and live across four production services. The recommendation engine, roadmap generator, resume and GitHub analysis, career comparison, internships — all working today.

**Risk — we planned for it.** PDF, AI outage, skill drift — every one has a tested mitigation. Judges, D just showed you three of them.

**National alignment:** this is exactly what *Skill India* and NEP 2020's tech-enabled learning vision demand — a verifiable, resilient, tech-powered workforce. Speaker F, the final word.

---

## SPEAKER F — Impact, Alignment & The Close (5:45 – 7:00)

Thank you, E. Let me leave you with three numbers and one promise.

**The impact:**

1. **Social** — SkillSaarthi democratizes personalized career guidance. It ends *analysis paralysis* — turning vague ambition into a clear, phase-by-phase roadmap. Think of the undergraduate who finally knows exactly what to build this semester.
2. **Economic** — we reduce the national skill gap by aligning learning directly with market demand. That means less wasted tuition, faster time-to-placement, and — today 50% of engineers aren't employable; we're built to move that number.
3. **Institutional** — we empower university TPO cells with **batch-level analytics**, letting colleges find curriculum gaps and fix them in real time.

**The promise:** one platform. Understand the student → recommend careers → find gaps → build the roadmap → track progress → reassess. A continuous loop that grows with the student — and our roadmap grows too: onboarding skill verification, and a 24/7 AI career counsellor in the future.

The problem statement asked for a One-Stop Personalized Career & Education Advisor. **SkillSaarthi delivers it — live, scalable, and built for India.**

Team Codestorm. *Dharnish parivartan ka saarthi — SkillSaarthi.* Thank you. We'd love your questions.

---

## Backup — Judging Prediction / Q&A Cheat Sheet

**"Where does the data come from?"**
13+ career datasets curated in `ai-service/app/recommendation/careers.py` plus the Appwrite `careers` and `career_skills` collections (required_level + importance, 1–5). Research grounded in India Skills Report 2025, NEP 2020, IEEE NLP parsing literature.

**"Why is the scoring 'hybrid' not pure ML?"**
Cold-start problem. A 6-factor weighted formula (40/20/15/10/10/5) is accurate from day one without massive datasets, and it's fully explainable — every score ships with `breakdown`, `reasons`, and `next_steps`. An ML layer is the future evolution.

**"What if the AI service goes down mid-demo?"**
The Node backend auto-falls back to a deterministic rule-based engine tagged `source: "fallback"`; UI shows an "Estimated · AI offline" badge; the app keeps working.

**"How do you handle bad resumes?"**
`pypdf` text extraction + custom `densify_text` normalizer fixes letter-spaced fonts (`D e v e l o p e r` → `Developer`), then confidence-scored keyword extraction.

**"How fresh are internships?"**
Automated importers (file feed or Remotive API) with dedup + admin approval gate + 30-day expiry TTL.

**"What differentiates you from LinkedIn/path-based tools?"**
Automated GitHub/resume profiling, the What-If simulator, deterministic 1.5s roadmaps, and TPO/batch-level institutional analytics — none of the existing tools combine all four.

**"Deployment?"**
Frontend → Vercel, Node backend → Render, AI service → Render (Python 3.12 pinned), data/auth → Appwrite Cloud. All four live right now.