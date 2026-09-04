<!-- ============================================================= -->
<!--  Walid Adra — GitHub Profile README                            -->
<!--  Brand: walidadra.dev + webrift.dev — electric blue on black   -->
<!--  Terminal / HUD identity · monospace · zero purple             -->
<!-- ============================================================= -->

<div align="center">

<a href="https://walidadra.dev">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="./assets/header-light.svg" />
    <img alt="Walid Adra — full-stack and platform engineer" src="./assets/header-dark.svg" width="100%" />
  </picture>
</a>

<br/>

<a href="https://git.io/typing-svg"><img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=20&duration=3000&pause=900&color=2979FF&center=true&vCenter=true&width=620&lines=systems+that+hold+under+load;AI-integrated+%C2%B7+multi-tenant+%C2%B7+real-time;the+guardrails+are+the+work;available+for+contract+work" alt="typing" /></a>

<br/>

<a href="https://walidadra.dev"><img src="https://img.shields.io/badge/PORTFOLIO-walidadra.dev-0055FF?style=for-the-badge&labelColor=0A0A0E" alt="Portfolio" /></a>
<a href="https://walidadra.dev/engineering.html"><img src="https://img.shields.io/badge/ENGINEERING-notes-2979FF?style=for-the-badge&labelColor=0A0A0E" alt="Engineering notes" /></a>
<a href="https://webrift.dev"><img src="https://img.shields.io/badge/WEBRIFT-webrift.dev-10B981?style=for-the-badge&labelColor=0A0A0E" alt="WebRift" /></a>
<a href="https://www.linkedin.com/in/walid-adra-452363273/"><img src="https://img.shields.io/badge/LINKEDIN-walid--adra-4D94FF?style=for-the-badge&labelColor=0A0A0E" alt="LinkedIn" /></a>
<a href="mailto:w22a.work@gmail.com"><img src="https://img.shields.io/badge/EMAIL-contact-EDEDED?style=for-the-badge&labelColor=0A0A0E" alt="Email" /></a>

</div>

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ whoami`

Full-stack and platform engineer in **Tripoli, Lebanon**, working remote across EMEA hours.

I build systems where being wrong has a cost — money moving, personal data, a decision about a person — and I own them from schema to deploy, including the access model and the infrastructure under it. I run **[WebRift](https://webrift.dev)**, a studio shipping production platforms for founders.

Most of this year went into two AI platforms under NDA, so they appear here without their client, product name or market. The engineering behind them is written up in full: **[walidadra.dev/engineering](https://walidadra.dev/engineering.html)**.

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ cat capabilities.txt`

| | |
| :-- | :-- |
| **Multi-tenant &amp; regulated** | row-level security on every tenant table, append-only audit, capability grants, residency gates that survive a change of cloud |
| **AI-integrated products** | agent graphs, retrieval across vector and graph stores, real-time voice, human approval gates on anything the model can't get wrong |
| **Platform &amp; infrastructure** | containers, infrastructure as code, CI gating typecheck / lint / tests / secret scanning / static analysis |
| **Interfaces that hold up** | data-dense operator consoles, bilingual EN/AR with real RTL, installable PWAs, motion and 3D |

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ cat stack.txt`

<div align="center">

<img src="https://skillicons.dev/icons?i=ts,react,nextjs,nodejs,python,fastapi,postgres,redis,docker,terraform" alt="stack" />

</div>

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ ls ~/projects`

<details open>
<summary><b>🧠 AI Marketing-Intelligence Platform</b> — under NDA · live</summary>

<br/>

Reads a client's analytics and commerce accounts, proposes campaigns against what it finds, and manages them on connected ad accounts. Nothing reaches a live ad account without two separate human approvals — one on the idea, one on the finished creative. Data residency is enforced at the call site rather than at the host, so the guarantee survives a migration between clouds.

| | |
| :-- | :-- |
| **Stack** | Python 3.13 · FastAPI · LangGraph · Postgres + pgvector · BigQuery · dbt · React 19 · Expo · Terraform |
| **Role** | Full-stack &amp; platform — service, console, mobile, schemas, infra, CI/CD |
| **Scale** | 1,053 commits authored · 346 Python modules · 9 CI/CD workflows · 11 ADRs |
| **Status** | 🟢 Live · one client · client and product withheld |

</details>

<details>
<summary><b>🎙️ Bilingual AI Voice-Interview Engine</b> — under NDA · built end to end</summary>

<br/>

Conducts real voice interviews in Arabic and English and returns evidence-cited assessments. Every conversational turn commits before the next is spoken and position is derived from the transcript, so a process killed mid-interview resumes exactly where it stopped. RLS on every org-scoped table, and CI runs the suite a second time with the superuser bypass removed — a policy that only passes as superuser proves nothing.

| | |
| :-- | :-- |
| **Stack** | Next.js 16 · React 19 · Drizzle · Postgres · Python · Pipecat · better-auth |
| **Role** | Solo — full stack, schema to interview room |
| **Scale** | 501 commits authored · 29 screens · 23 migrations · 72 test suites · 4 CI gates |
| **Status** | 🔵 Built end to end · not yet deployed, and it says so |

</details>

<details>
<summary><b>🐟 Mahramji</b> — restaurant platform, live on the client's domain</summary>

<br/>

A seafood restaurant on the Mina corniche in Tripoli. Guests scan a QR code and read the menu in English or Arabic, priced in dollars or lira. A waiter still takes the order — that is how the restaurant works, and the software had no business changing it. The owner runs the whole site from a dashboard, without me.

| | |
| :-- | :-- |
| **Stack** | Next.js 16 · React 19 · Supabase · TOTP 2FA · RLS · Vercel |
| **Role** | Solo — design &amp; build |
| **Scale** | 172 commits · 67 dishes · 9 ordered migrations · 90 tests |
| **Status** | 🟢 Live → [almahramji.com](https://almahramji.com) · source private |

</details>

<details>
<summary><b>🧾 Ordering &amp; Delivery Platform</b> — full-stack, solo</summary>

<br/>

Customer storefront, staff back-office, and the operational plumbing between them. Per-tab permissions carried in a signed token so a floor account can't reach the books, Redis in front of a hot menu, web push to a phone on the counter, and checkout that hands off to WhatsApp and cash on delivery because that is how this market pays.

| | |
| :-- | :-- |
| **Stack** | Next.js 16 · React 19 · Supabase · Postgres · Redis · Web Push · JOSE |
| **Role** | Solo — schema to deploy |
| **Scale** | 114 commits · 13 screens · 22 API routes |
| **Status** | 🟢 Shipped · client withheld · source private |

</details>

<details>
<summary><b>🛰️ WebRift</b> — agency brand &amp; website</summary>

<br/>

The home of my studio — a hand-built animated site, no framework, no build step.

| | |
| :-- | :-- |
| **Stack** | JavaScript · GSAP · Lenis · CSS3 |
| **Role** | Solo — design &amp; development |
| **Status** | 🟢 Live → [webrift.dev](https://webrift.dev) · [source](https://github.com/Walidd22/webrift-website) |

</details>

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ cat constraints.txt`

The four systems above have almost nothing in common. What they share is this list — rules each one is held to, stated as what the system is *not* allowed to do, because a rule enforced by good intentions is one you find out about in an incident report.

```
C-01  No automated system spends a client's money on its own.
C-02  Regulated data does not leave the jurisdiction it was collected in.
C-03  Row-level security nobody has attacked is a comment, not a control.
C-04  History is append-only — audit writes go through triggers, not app code.
C-05  Access is a grant, never a URL somebody could guess.
C-06  A value that maps to money comes from a closed registry, never free text.
C-07  Long-running state is derived, never remembered.
C-08  What isn't built is visibly absent, never simulated.
```

All eight, with the mechanism that enforces each → **[walidadra.dev/engineering](https://walidadra.dev/engineering.html)**

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ git log --author="Walid Adra"`

```log
* founder     Founder & Full-Stack Engineer · WebRift
|               production platforms for founders — architecture to deploy
|
* current     Full-Stack & Platform Engineer · AI platforms (NDA)
|               decisioning services, operator consoles, infra and CI/CD
|
* contract    Lead Frontend Engineer · real-time trading platform
|               owned frontend delivery under deadline — live market surfaces
|
* commission  Full-Stack Engineer · ordering & delivery platform
|               schema to deploy, then maintained in production
|
* internship  Software Engineering Intern · Telecloud Vision, Beirut
                first production code — code review, git flow, real users
```

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ git log --merged --author="Walid Adra" --not-mine`

Work shipped into repositories I do not own.

| | |
| :-- | :-- |
| **[claude-video-vision](https://github.com/jordanrendric/claude-video-vision)** | [#23](https://github.com/jordanrendric/claude-video-vision/pull/23) &mdash; merged |
| **Fix** | Whisper transcription failed on local runs: `--language auto` is not a valid value, and an unpinned `--output_dir` left artefacts where the caller could not find them. Dropped the flag, pinned the directory. |

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ cat focus.yaml`

```yaml
building:  AI platforms under NDA · WebRift client work
focus:     multi-tenant & regulated systems · AI integration · platform delivery
stack:     TypeScript · React · Next.js · Node · Python · FastAPI · Postgres · Terraform
open_to:   contract & freelance · remote · EMEA hours
```

<img src="./assets/divider.svg" width="100%" alt="" />

## `$ ./stats.sh --last-year`

Most of the last year went into private client repositories; the totals below include them.


<picture>
  <source media="(prefers-color-scheme: light)" srcset="./assets/stats-light.svg" />
  <img alt="GitHub stats — 1762 contributions, 181 peak day, 108 active days, 35d streak, 10 repos" src="./assets/stats-dark.svg" width="100%" />
</picture>

<img src="./assets/divider.svg" width="100%" alt="" />

<a href="https://walidadra.dev">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="./assets/footer-light.svg" />
    <img alt="build · ship · maintain · repeat" src="./assets/footer-dark.svg" width="100%" />
  </picture>
</a>
