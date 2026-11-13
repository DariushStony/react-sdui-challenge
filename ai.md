# AI Usage Report

## 1. Tools & Models

| Tool / Product | Model | Purpose | Frequency |
| --- | --- | --- | --- |
| Claude Code (desktop app, "Code" tab) | Claude Sonnet 5.5 (`claude-sonnet-5-5`) | Research, discovery interview, documentation, scaffolding, implementation, tests, debugging, reviews, and browser checks | Continuous, 2026-11-13 |
| Claude Code sub-agents | Same model | 8 delegated runs: 6 research and code-reading tasks, 2 independent code reviews | 8 times |
| ChatGPT | GPT-6 (web) | Created the master prompt used to guide Claude Code's planning, discovery, and deliverables | 3 times |
| Archify (Claude Code diagram skill) | n/a | Created five interactive diagrams for the local explainer page | Once |
| Claude's built-in browser pane | n/a | Tested the running application at mobile and desktop widths, including tabs, console, and interactions | Several times per phase |
| Playwright + axe-core (outside the repository) | n/a | Tested the application in real Chrome, Firefox, and WebKit, and performed accessibility scans across 14 page states at 2 viewport widths | A few passes |
| RTK (Rust Token Killer) | n/a | Reduced shell command output before it was read by the model | Every shell command, automatically |

No autocomplete tools (Copilot, Cursor, or similar) were used.

---

## 2. Stages of Development

### Planning / Requirements Analysis

- I did not let the assistant make decisions independently. I provided a detailed master prompt, written with ChatGPT, instructing it to investigate the repository, conduct a discovery interview in small batches, present options and recommendations, maintain a decision log, and avoid coding until requirements were clear.
- It asked questions in short rounds covering field types, validation libraries, file handling, mock strategy, design systems, and folder conventions. Each answer became a numbered decision (51 decisions in total). Nothing was considered final until I explicitly approved it.
- I requested a document-first workflow, modelled on another project of mine. The deliverables included a PRD, technical design, API contract, ADRs, test strategy, test cases, a requirement-to-test traceability matrix, and an implementation plan.
- I reviewed and approved each document before proceeding. All documents were committed before implementation started.
- The main principles throughout this stage were small phases, structured questioning, and approval gates.

### Research

- Before making architectural decisions, I asked the assistant to investigate how others had approached the same public challenge, with the goal of identifying gaps and opportunities.
- It delegated repository analysis to sub-agents, which examined public implementations and produced a private research summary outside the repository. The summary was not committed or added to `.gitignore`.

### Scaffolding / Boilerplate

- Tooling was selected during the discovery interview and implemented in Phase 0: pnpm, strict TypeScript, Vite, oxlint (type-aware), Stylelint, Prettier, Husky with lint-staged, and GitHub Actions.
- Before relying on potentially risky assumptions, I requested short technical spikes to verify them on my machine. These included multipart handling in jsdom, MSW 3 option names, import-boundary enforcement with oxlint, and npm compatibility.
- Some initial assumptions were incorrect and were corrected through experiments before the related decisions were documented. For example, type-aware lint rules were initially considered unavailable, and an MSW 3 option had been renamed.

### Implementation

- Development was delivered across 14 phases (0–13), followed by several polish rounds.
- Each phase followed a test-first workflow: write a failing test, implement the solution, and run `pnpm run check`.
- At the end of each phase, the assistant stopped and waited for my approval. I then used "Approve and commit", after which it created small, focused commits.
- Nearly all code and documentation were AI-generated. My contributions included architectural decisions, the decision log, folder and naming conventions (kebab-case, one export per file), the principle of exporting only what is actually needed, choosing a reusable renderer package, and approving each phase.

**Final implementation results:**

- A pnpm workspace containing a reusable library (`packages/renderer`) and a demo application (`apps/demo`).
- Two public package entry points with 20 public exports.
- 113 commits made under my identity.
- 1,010 tests across 76 files.
- 100% line coverage for pure logic.
- Application JavaScript bundle size of 132.7 kB gzip, within the 150 kB budget.

**Additional polish rounds:**

Each of the following changes started with a short prompt:

- Added a fallback for the mock implementation (ADR-0018).
- Bundled and applied the Vazirmatn font throughout the application (ADR-0019).
- Added a coloured JSON view with a dedicated background in the Playground (ADR-0020).

### Debugging

Several real issues were discovered during development. All were fixed and, where applicable, covered by tests.

**1. Multipart requests in jsdom**

The tests initially could not send multipart requests because jsdom's `File` and `FormData` implementations differ from Node's. The issue was identified during the initial spike and fixed with a small compatibility shim and a self-test that fails loudly if the behaviour breaks.

**2. File renaming script damaged source files**

A mass-renaming script for enforcing kebab-case and one-export-per-file conventions damaged several files because it relied on regular expressions to modify TypeScript. I restored the affected files from Git and repeated the operation using a proper syntax parser. A test now enforces these conventions to prevent regression.

**3. TanStack Query and offline requests**

An offline test demonstrated that TanStack Query's default behaviour could leave a request hanging when the browser reported that it was offline.

**4. Keyboard accessibility in the Playground**

An accessibility scan in real Chrome identified that the request preview was not reachable using a keyboard. It was fixed by replacing the inaccessible interaction with a labelled, read-only text area.

**5. MSW in Claude's embedded browser**

The browser pane inside the Claude desktop application could not register a service worker, even though the same implementation worked in Chrome, Firefox, and WebKit. This led to ADR-0018: when the service worker cannot start, the page handles `fetch` requests directly using the same handlers.

**6. Font inheritance**

When applying Vazirmatn throughout the application, the assistant discovered that the design token already referenced the font, but the font itself was never loaded. It also found that browser form controls (inputs, selects, and buttons) do not automatically inherit the page font. The font was bundled, and `font: inherit` was applied to form controls, with tests added.

**7. Linux-only CI failure**

The first GitHub push passed CI, but a subsequent run failed on Linux because an import referenced `Vazirmatn-variable-font-face.css` while the actual filename was `Vazirmatn-Variable-font-face.css`. macOS had not exposed the case-sensitivity issue. The problem was fixed test-first, with a new test comparing filenames character by character.

**8. JSON view rendering issues**

Two issues appeared only in real browsers:

- The coloured JSON layer was taller than the underlying text area in Chrome and WebKit because the text area was inline and left an extra gap underneath.
- The JSON box had lost its visible border because a transparent border shared between both layers obscured the actual border.

Both were fixed, and a test was added for the border issue.

**9. Incorrect Node.js version assumption**

The assistant initially claimed that an older Node.js version was sufficient. Running the tests proved otherwise, and the minimum supported version was corrected.

### Testing

- The AI generated tests based on a written test plan that I reviewed and approved.
- Requirement IDs were mapped to test IDs through a traceability matrix.
- Logic tests were written first, and the initial failing test runs were observed before implementation.
- I did not accept test coverage at face value. The suite sends real multipart request bodies through MSW, contains no snapshot tests, and maps requirements to their corresponding tests.

**Additional verification:**

- axe-core accessibility scans in real Chrome across 14 application states, with zero violations after one accessibility fix.
- Smoke tests in Chrome, Firefox, and WebKit at desktop and mobile viewport sizes.
- GitHub Actions runs the complete check, build, bundle-size budget, package packing test, and coverage verification with pnpm.
- The CI pipeline also runs checks with npm on every push.
- The final commit passed all checks. There was one failed CI run during development, caused by the filename case-sensitivity issue described earlier.
- A clean `npm install` was also tested manually in a separate copy of the project.

### Documentation

All project documentation was initially drafted by the assistant in English and reviewed by me. The documents included:

- PRD
- Technical Design
- API Contract
- 20 Architecture Decision Records (ADRs)
- Test Strategy
- Test Cases
- Requirement-to-Test Traceability Matrix
- Implementation Plan
- README

I also required the reasoning behind important decisions to be documented in code comments where appropriate.

The technical design, test strategy, and implementation plan were updated again at the end to reflect the final implementation.

For my own preparation, the assistant also created:

- A local explainer page in Persian, containing five diagrams, architectural decisions, and interview questions.
- A reference draft of this report.

Both were kept outside the repository. This report was written by me.

### Code Review / Refactoring

- Two independent code review passes were delegated to separate sub-agents: one reviewed the completed application, and the other reviewed the library as a publishable package.
- The second review identified 10 findings. Each finding was independently checked against the source code or through an experiment before any changes were made.

Examples of issues identified and fixed:

- A missing `"use client"` directive.
- Type declarations that failed under NodeNext.
- Form values being lost when a host rebuilt an equivalent model.
- A locked file field that still allowed users to remove its value.

My own additional review rounds, initiated with "Keep polishing", produced some of the largest refactors:

- Enforcing folder-per-module conventions.
- Introducing a swappable UI kit.
- Reducing the public API from 76 exports to 20.

---

## 3. Prompts

The following section documents the main prompts I used, with their original Persian wording and a short explanation of their purpose.

### Prompt #1 — Project Discovery & Engineering Research

**Stage:** Planning / Research

**Prompt:**

```text
Project Discovery & Engineering Research

Act as a Senior Staff Frontend Engineer, Software Architect, and Technical Researcher.

Our goal is to deeply understand the problem, research existing approaches, identify gaps and opportunities, and eventually deliver an exceptional engineering solution.

Phase 1 — Repository & Requirement Discovery

Start by thoroughly inspecting the repository:

<https://github.com/ArmanCreativeSolutions/react-sdui-challenge>

Review its README, requirements, source code, architecture, dependencies, Git history, and available documentation.

Then ask me all essential clarification questions, one at a time or in logical groups.

Don't make assumptions or decide on architecture, stack, scope, or implementation before requirements are clear.

Phase 2 — Deep Research

After clarifying the requirements, investigate all publicly available related implementations and resources:

- GitHub repositories, forks, branches, commits, and PRs.
- Existing implementations and live demos.
- Developer approaches and technical decisions.
- Official documentation and engineering resources.

Analyze actual source code whenever possible, not just README files.

For each implementation, evaluate:

- Architecture and code quality
- Component design and data flow
- Type safety and extensibility
- Performance and accessibility
- Error handling and edge cases
- Testing and documentation
- UX and maintainability

Provide evidence and direct links. Never fabricate findings or assume inaccessible information.

Phase 3 — Comparative Analysis

Identify:

- What others did well.
- What they missed or implemented poorly.
- Common mistakes and overlooked edge cases.
- Architectural and technical weaknesses.
- Opportunities to build something better.

Compare alternative approaches, explain trade-offs, and identify meaningful ways to improve the final solution.

Phase 4 — Recommendations & Decision

Deliver a comprehensive research report containing:

1. Research findings
2. Comparative analysis
3. Identified gaps
4. Potential solutions
5. Architecture alternatives
6. Pros, cons, and trade-offs
7. Risks and recommendations

Every recommendation must have a clear technical justification.

Critical Rules

- Research before implementation.
- Evidence over assumptions.
- Simplicity over unnecessary complexity.
- Strict TypeScript and maintainable architecture.
- Challenge my assumptions; don't blindly agree.
- Keep me involved in important decisions.
- Don't modify files or write code during research.

STOP after presenting the research and recommendations. Wait for my approval before making any implementation decisions.

First Action

Inspect the repository, understand the challenge, and ask your first clarification questions.

Don't jump to solutions. First understand the problem, then research, compare, and decide together.
```

**Result:**

The assistant investigated the repository, asked clarification questions, and delegated research tasks to sub-agents that examined public forks and produced a scored research summary outside the repository.

**Evaluation / Corrections:**

I corrected the scope in the next prompt because the initial research had focused too heavily on known forks.

### Prompt #2 — The Master Prompt

**Stage:** Planning / Requirements

**Prompt:**

Approximately 18,000 characters, written with ChatGPT and provided to Claude Code in full, followed by an additional instruction from me.

The opening and most important instructions:

```text
این مستر پرامپتی هست که من از صحبت با chatgpt گرفتم هیچ چیزی رو نهایی فرض نکن
میخوام دقت بکنی
که هر چیزی که دارم میگم رو باید بر اساس نیازمندی این تسک questioning بکنی
رقبا و گپ‌هاشون رو در نظر بگیری
...
Role: Senior Product Engineer & Software Architect
... You are NOT being asked to start coding immediately. ...
... Ask questions in small, logically grouped batches. Wait for my answers ...
... Do not write, generate, rewrite, or modify `ai.md`. ...
... Do not start coding. Do not generate `ai.md`. ...
```

My additional instruction at the end was to follow a document-first workflow, similar to another project of mine, using IEEE-style documentation before implementation:

```text
اینم میخوام بدونی که میخوام با یک ساختار کاملا document base پیش بریم
دقیقا مثل saaf app که توی desktop هست
یکسری دایکومنت کاملا بر اساس استاندارد IEEE
...
اول اینارو بنویسم
و بعد بر اساس اینا بیاییم و پروژه رو شروع به توسعه بکنیم
```

**Result:**

The assistant investigated the repository, conducted discovery interviews in small rounds, presented options and recommendations, maintained a decision log, and then prepared the PRD, technical design, 13 initial decision records (20 by the end), API contract, test strategy, test cases, traceability matrix, and implementation plan.

**Evaluation / Corrections:**

I reviewed and approved each document before moving to the next stage. Risky assumptions were tested through technical spikes before being accepted.

Several recommendations were changed by me during the discovery process. The initial assumptions about the minimum Node.js version and type-aware linting were also corrected through experiments.

### Prompt #3 — Naming, Structure & Reusability

**Stage:** Implementation

**Prompt:**

```text
اسم فایل‌ها باید kebab-case باشه
هر فایل باید با فایل‌های مرتبطش در کنار هم باشن و در یک فولدر مثلا
index.html
styles.module.css
دقت بکن که هر فایل فقط و فقط باید یک named export داشته باشه و همه export ها اونجا باید انجام بشن
اصلا نباید inline named export داشته باشیم
در حالت موبایل وب و دسکتاپ وب میخوام که تست بکنی
همه ورژن‌های از پکیج‌ها تا node تا pnpm. و... باید آخرین ورژن باشن
دقت بکن که این چیزی که نوشتیم میخوام مثل یک ابزار قابل استفاده باشه و reusable باشه (اینو از بقیه بخش‌ها جدا بکن و هر سوالی داری بپرس) فرضا اگر تصمیم گرفتم به عنوان یه پکیج منتشر بکنم بتونم بعدا کد‌هاش رو جدا بکنم و پکیج بکنم و توی پروژه دیگه استفاده بکنم (پس بنابراین میخوام که از Design Patternها و اصول SOLID استفاده شده باشه توش و همه مسایل مهندسی نرم افزار رعایت شده باشه)

برای تست هم حتما بیا و از chrome mcp استفاده بکن و توی browser تستش بکن
```

**Meaning:**

Enforce kebab-case naming, keep related files together, require one named export per file, test on mobile and desktop, use current package and tooling versions, and design the renderer as a reusable and independently publishable package. Apply SOLID principles and established software engineering practices, and test in a real browser.

**Result:**

The assistant asked four clarification questions covering browser selection, packaging, design-system strategy, and export conventions.

It then implemented three phases:

- Phase 11: Workspace separation into a reusable library and demo application.
- Phase 12: Swappable UI kit and message catalogs.
- Phase 13: Source conventions and enforcement.

Each phase was documented through its own decision record.

**Evaluation / Corrections:**

- Ran `pnpm run check` after each phase.
- Added `conventions.test.ts` to detect violations of the file and export rules.
- Packed the library, installed it with npm in an empty project, and verified its types.
- Tested the application in the browser pane at 375 px and desktop width.

The initial conversion script damaged some files and was replaced with a syntax-parser-based approach. Since the Chrome MCP connection was unavailable, the built-in browser pane was used with my approval, while Playwright covered Chrome, Firefox, and WebKit.

### Prompt #4 — Debugging & Delivery

**Stage:** Debugging / Delivery

**Prompt:**

```text
چندتا کار میخوام انجام بدی
دیگه fork و push بکن
نیازی به VoiceOver نیست
نیازی به تست روی safari نیست
تست CI رو داشته باش لطفا

قبل از اکشن بر داشتن هر سوالی که داری بپرس تا توضیح بدم
و بعد اکشن بردار
و اینو بررسی بکن که چرا MSW کار نمیکنه و درست initialize نمیشه
```

**Meaning:**

Fork and push the project, skip VoiceOver and Safari testing, configure CI, and investigate why MSW was not initializing correctly. Ask any necessary questions before taking action.

**Result:**

After clarification, the assistant reproduced the MSW issue and established that MSW itself was working correctly; the limitation was specific to service-worker registration in Claude's embedded browser.

A fallback was implemented test-first (ADR-0018), followed by the fork and push, a successful initial CI run, this report draft, and the local explainer page.

**Evaluation / Corrections:**

The issue was reproduced and its cause verified. The worker script was served correctly, and the same smoke test passed in Chrome, Firefox, and WebKit.

The fallback was tested in both development and production builds across three browser engines.

The first SSH push attempt hung, and the HTTPS push was rejected because the GitHub login lacked the required workflow scope. A subsequent SSH retry succeeded.

### Prompt #5 — Typography & JSON Syntax Highlighting

**Stage:** Implementation / UI

**Prompt:**

```text
میخوام برای کل پروژه و همه از فونت Vazir استفاده بکنی
و همچنین برای بخش آزمایشگاه و فرم JSON خوب میشه که یه syntax highlighter داشته باشیم
```

**Meaning:**

Use the Vazir font throughout the application and add syntax highlighting to the Playground's JSON editor.

**Result:**

The assistant bundled Vazirmatn, the maintained successor to Vazir, from a pinned package. It also implemented a lightweight 40-line JSON lexer behind a real text area rather than introducing a full code-editor library.

Two decision records were added (ADR-0019 and ADR-0020), along with 31 new tests.

**Evaluation / Corrections:**

- Tests were written first.
- Computed fonts were checked for the body, input, select, and button elements in Chrome, Firefox, and WebKit.
- Accessibility scans were run at desktop and mobile widths.
- Clean npm installation and GitHub Actions were verified.

The debugging issues are described in Section 2. The assistant also recommended keeping code monospace and using Vazirmatn instead of the older Vazir. Both decisions were open to my approval or rejection.

### Prompt #6 — JSON View Background

**Stage:** Implementation / UI

**Prompt:**

```text
set a background color for JSON view
```

**Result:**

A soft blue-grey background was added to the JSON view. A test was introduced to calculate the contrast ratio of every colour used in the relevant stylesheets, enforcing 4.5:1 for text and 3:1 for borders.

**Evaluation / Corrections:**

A screenshot in real Chrome revealed that the box had no visible border. This led to a fix, followed by contrast tests, browser checks, accessibility scans, and the full project check.

The missing border was a regression introduced during the previous implementation and was fixed as part of this round.

### Short Control Prompts

| Prompt | Count | Stage | Purpose |
| --- | --- | --- | --- |
| `Yes, decide approach` | 1 | Planning | Approved the proposed approach after research |
| `Spike first, then docs` | 1 | Planning | Required risky assumptions to be verified experimentally before documentation |
| `Start PRD`, `Start Phase 0` | 2 | Planning / Scaffolding | Explicitly started documentation and implementation |
| `Approve and commit` | 20 | All | Approved each phase or polish round and authorised small commits under my identity |
| `Keep polishing` | 2 | Review | Requested additional quality and refinement passes |
| `Push now` | 2 | Delivery | Explicitly authorised publishing to my fork |

The assistant asked for approval before every push, so nothing was published without my explicit permission.

---

## 4. Token Usage Monitoring

### Monitoring Method

- I used CodeBurn and also asked Claude Code to report its own usage.
- The figures below were calculated from the session's log file rather than estimated.
- RTK (`rtk gain`) was used to track command-output savings. Its counters cover all my projects, not just this one.

### Helper Prompts and Global Instructions

I did not use a dedicated prompt for token counting. Instead, I asked the assistant whenever I wanted to inspect usage.

The standing instructions that shaped its responses were defined in my global `CLAUDE.md`:

```text
- Be brief. Straight to the point, no filler, no restating my question back to me.
- Explain ELI5: plain words + one small concrete example.
- Explain the overall structure and what changed — not a line-by-line walkthrough.
- Long or exhaustive output only when I explicitly ask for it.
- Subagent reports (review / audit / debug / perf): relay a short ranked summary; full detail only on request.
- In code: comments only where the why isn't obvious. No banner comments, no restating what the code does.
```

### Token Management Strategies

- **Concise responses:** Short, structured answers by default, with exhaustive explanations only when explicitly requested.
- **RTK:** Automatically compressed noisy shell command output, such as installations, test runs, and Git operations, before the model read it.
- **Sub-agents:** Delegated broad research and independent reviews to sub-agents, keeping their detailed working notes out of the main conversation and returning only relevant summaries.
- **Document-first workflow:** Used small implementation phases and written plans to avoid repeatedly deriving decisions from conversation history. The decision log and project documents acted as persistent sources of truth.
- **Context compaction:** The conversation was compacted twice as it grew. The resulting summaries preserved important rules, decisions, and project state.

### Rough Total Usage

The following figures are based on the main Claude Sonnet 5.5 session log, calculated on 2026-11-13:

| Metric | Approximate Usage |
| --- | ---: |
| Model turns | 894 |
| Output tokens | 1.49 million |
| Prompt cache writes | 2.53 million |
| Cache reads | 421 million |
| Uncached input tokens | 1.9 thousand |
| Additional sub-agent output tokens | 357 thousand |

The cache-read figure represents the conversation context being read across model turns. These reads are cached and therefore have a different cost profile from uncached input tokens.

The eight sub-agents contributed approximately 357,000 additional output tokens.

---

## Notes & Reflections

### Where AI Was Indispensable

The biggest advantage was breadth.

Producing 20 decision records, a requirement traceability matrix, 1,010 tests, and a reusable package would have been difficult for one person to complete in two days.

The assistant also identified issues I might not have considered independently, including a keyboard accessibility problem discovered through automated scanning and type declarations that failed under NodeNext.

### Where AI Slowed Me Down or Made Mistakes

AI was not always correct, and some of its outputs required additional verification:

- It made assumptions before testing, including the minimum Node.js version and MSW option names.
- A mass-renaming script damaged source files.
- It reported the build as successful after a macOS run, while CI later exposed a Linux-specific filename case issue.
- Producing extensive documentation consumed time that could otherwise have been spent on the product itself. I eventually reduced the scope to address this.

### Where I Chose Not to Delegate Decisions

I deliberately retained ownership of:

- Architectural decisions.
- Decisions about what should become public API.
- The timing of publishing and pushing changes.
- Git identity and commit approvals.
- The content and authorship of this report.

### How I Maintained Control

I maintained control through explicit approval gates at every phase, a decision log, test-first development, independent code reviews, and direct verification of technical claims through experiments and real browser testing.

The assistant was responsible for accelerating research, implementation, and verification. I remained responsible for the engineering decisions, evaluating the evidence, and accepting the final results.
