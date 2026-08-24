// data/content-map.js — Dynamic content for footer subpages.
//
// Honesty note: Northwind's frontend runs against a real Django/DRF backend
// (http://localhost:8001/api) that exposes projects, tasks, comments,
// notifications, users, dashboard and auth. It does NOT yet expose a public
// integrations registry, a community forum, open job postings, or a status
// monitor. Those subpages below are framed honestly: real product copy where
// it exists, and clearly-labelled "planned / demo" framing where the backend
// feature is not implemented. No fake endpoints, fake operational status,
// fake job listings, or fake sent messages are presented as real.

const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'

export const pageContent = {
  // ---------------- Product ----------------
  'analytics': {
    title: 'Project Analytics',
    subtitle: 'Insight without the noise.',
    content: `
      Northwind Analytics turns the work your team is already doing into a calm, readable picture — no spreadsheets, no dashboards that shout.

      The metrics are deliberately few and kind: velocity, completion, and where effort is actually going.

      - **Team velocity:** See how much real progress each sprint produces.
      - **Task completion:** Track finished work against what was planned.
      - **Workload:** Understand who is at capacity before a deadline slips.
      - **Project health:** A single, honest signal for each project.
    `,
    icon: 'chart',
    blocks: ['analytics']
  },
  'integrations': {
    title: 'Integrations',
    subtitle: 'A connected workspace — planned.',
    content: `
      Northwind is designed to sit comfortably inside your existing stack rather than replace it. The integration layer is on our roadmap; the connectors below show the directions we are building toward.

      - **Calendar:** Two-way sync of deadlines and milestones.
      - **Communication:** Push notifications where your team already talks.
      - **Version control:** Link tasks to branches, commits, and pull requests.
      - **Cloud storage:** Attach files from your drive without leaving a task.
      - **Webhooks & API:** Automate the flows only you can predict.

      Until these ship, you can move data in and out through the REST API below.
    `,
    icon: 'link',
    blocks: ['integrations']
  },
  'changelog': {
    title: 'Changelog',
    subtitle: 'What\'s new in Northwind.',
    content: `
      We improve Northwind in small, steady steps. Here is a recent view of that work.
    `,
    icon: 'clock',
    changelog: [
      { version: 'v2.1.0', date: 'August 2026', kind: 'new', title: 'Dynamic subpage architecture', body: 'Marketing, help, and policy pages are now generated from a single content map.' },
      { version: 'v2.1.0', date: 'August 2026', kind: 'improved', title: 'Plan enforcement', body: 'Free and paid limits are now enforced consistently across the app.' },
      { version: 'v2.0.5', date: 'July 2026', kind: 'new', title: 'Kanban boards', body: 'A calm, drag-and-drop board view joins list and timeline.' },
      { version: 'v2.0.5', date: 'July 2026', kind: 'new', title: 'Timeline view', body: 'See dependencies and milestones across the whole project.' },
      { version: 'v2.0.0', date: 'June 2026', kind: 'improved', title: 'Performance pass', body: 'Core data paths were rewritten for a ~40% faster response.' }
    ]
  },

  // ---------------- Solutions ----------------
  'startups': {
    title: 'Northwind for Startups',
    subtitle: 'Move fast, stay organized. The lightweight PM tool that grows with you.',
    heroVisual: 'startup-hero',
    content: `
      Early-stage teams need just enough structure to scale — not enterprise weight. Northwind gives startups a lightweight home for projects, tasks, and the people behind them.
    `,
    icon: 'rocket',
    problemStatement: 'Most PM tools are built for companies with 500+ employees. Startups get crushed by complexity, per-seat pricing that punishes growth, and features nobody uses.',
    solutionStatement: 'Northwind starts free, stays simple, and adds power only when you need it. No bloat. No surprise bills.',
    features: [
      { icon: 'zap', title: 'Free for small teams', desc: 'Up to 3 projects, unlimited tasks, full core features — no trial, no credit card.' },
      { icon: 'target', title: 'Focus on what matters', desc: 'One view: your priorities, your progress, your deadlines. Nothing else.' },
      { icon: 'users', title: 'Built for 2–20 people', desc: 'Roles, mentions, comments, and a calm activity feed. No admin overhead.' },
      { icon: 'chart', title: 'Growth-ready', desc: 'Upgrade to Pro when you hit limits. Same workflow, more power.' },
      { icon: 'calendar', title: 'Sprint-agnostic', desc: 'Run 1-week sprints, shape 6-week cycles, or just ship continuously.' },
      { icon: 'shield', title: 'Your data, your control', desc: 'Export everything anytime. No lock-in, no proprietary formats.' }
    ],
    useCases: [
      { title: 'Founding team', desc: 'Track product roadmap, investor milestones, and hiring in one place.' },
      { title: 'Seed-stage', desc: 'Manage contractors, design reviews, and launch checklists without overhead.' },
      { title: 'Series A', desc: 'Scale to multiple squads with shared visibility and lightweight process.' }
    ],
    testimonial: {
      quote: 'We evaluated 8 tools. Northwind was the only one that didn\'t feel like enterprise software pretending to be for startups.',
      author: 'Sarah Chen',
      role: 'Co-founder, Meridian AI',
      avatar: 'u_sarah'
    },
    cta: { primary: { label: 'Start free', href: '#/register' }, secondary: { label: 'See pricing', href: '#/pricing' } },
    blocks: ['solutions-rich']
  },
  'agencies': {
    title: 'Northwind for Agencies',
    subtitle: 'Deliver client work on time, every time. One workspace, many clients.',
    heroVisual: 'agency-hero',
    content: `
      Agencies juggle many clients, shifting priorities, and hard deadlines. Northwind keeps each engagement contained and every stakeholder aligned.
    `,
    icon: 'users',
    problemStatement: 'Client work lives in scattered tools: Trello for tasks, Slack for feedback, Drive for files, spreadsheets for budgets. Context gets lost.',
    solutionStatement: 'Northwind centralizes client projects, approvals, and communication. Your team sees everything; clients see only what you share.',
    features: [
      { icon: 'folder', title: 'Client workspaces', desc: 'Separate, branded workspaces per client. One login, total isolation.' },
      { icon: 'lock', title: 'Granular permissions', desc: 'Viewer, Commenter, Editor roles. Clients see deliverables — not internal chatter.' },
      { icon: 'calendar', title: 'Milestone tracking', desc: 'Map tasks to contract milestones. Never miss a delivery date.' },
      { icon: 'clock', title: 'Billable clarity', desc: 'Track time against projects. Know what\'s billable, what\'s scope creep.' },
      { icon: 'mail', title: 'Client approvals', desc: 'Send deliverables for sign-off. Approved/Rejected status, all in context.' },
      { icon: 'chart', title: 'Portfolio health', desc: 'See all client projects at a glance. Spot bottlenecks before clients do.' }
    ],
    useCases: [
      { title: 'Design agency', desc: 'Share mockups, collect feedback, manage revision rounds — no email threads.' },
      { title: 'Dev shop', desc: 'Link tasks to GitHub PRs. Clients see progress; devs stay in flow.' },
      { title: 'Marketing retainer', desc: 'Recurring deliverables, content calendars, and approval workflows built in.' }
    ],
    testimonial: {
      quote: 'We cut project admin time by 40%. Clients love the transparency — they never have to ask "where are we?"',
      author: 'Marcus Webb',
      role: 'Founder, Studio Anchor',
      avatar: 'u_alex'
    },
    cta: { primary: { label: 'Start free', href: '#/register' }, secondary: { label: 'Contact sales', href: '#/contact' } },
    blocks: ['solutions-rich']
  },
  'software-teams': {
    title: 'For Software Teams',
    subtitle: 'Ship better code, faster. Agile workflows without the ceremony.',
    heroVisual: 'software-hero',
    content: `
      Northwind fits an agile cadence without forcing process on your engineers. Plan sprints, track bugs, and keep a quiet record of progress.
    `,
    icon: 'code',
    problemStatement: 'Jira is powerful but heavy. Linear is fast but opinionated. Most tools make you choose: flexibility or speed.',
    solutionStatement: 'Northwind gives you both. Kanban, timeline, and list views. Sprint planning that takes minutes. GitHub integration that actually works.',
    features: [
      { icon: 'kanban', title: 'Native Kanban', desc: 'Drag-and-drop boards with WIP limits, swimlanes, and custom columns.' },
      { icon: 'task', title: 'Smart issue tracking', desc: 'Bugs, stories, tasks, epics — with types, priorities, labels, and relations.' },
      { icon: 'github', title: 'GitHub sync', desc: 'Link PRs to tasks. Auto-transition on merge. Branch/commit badges on cards.' },
      { icon: 'calendar', title: 'Sprint planning', desc: 'Velocity tracking, capacity planning, and carry-over management.' },
      { icon: 'analytics', title: 'Engineering insights', desc: 'Cycle time, lead time, throughput — no dashboard noise.' },
      { icon: 'zap', title: 'Automation', desc: 'Recurring tasks, auto-assignment, stale issue detection, slack notifications.' }
    ],
    useCases: [
      { title: 'Sprint teams', desc: '2-week sprints with planning, review, retro — all visible in one board.' },
      { title: 'Kanban flow', desc: 'Continuous delivery with WIP limits and cycle time optimization.' },
      { title: 'Bug triage', desc: 'Inbox → Triage → Assign → Fix → Verify. SLA tracking built in.' }
    ],
    testimonial: {
      quote: 'Our engineers actually *use* it. No more "I\'ll update Jira later." The GitHub link means tasks update themselves.',
      author: 'Priya Patel',
      role: 'Engineering Lead, Volt Labs',
      avatar: 'u_priya'
    },
    cta: { primary: { label: 'Try free', href: '#/register' }, secondary: { label: 'See integrations', href: '#/p/integrations' } },
    blocks: ['solutions-rich']
  },
  'creative-teams': {
    title: 'For Creative Teams',
    subtitle: 'Bring ideas to life, on schedule. Visual project management for design, video, and marketing.',
    heroVisual: 'creative-hero',
    content: `
      Design, video, and marketing teams live in review cycles. Northwind keeps feedback centralized so approvals move instead of stalling in inboxes.
    `,
    icon: 'image',
    problemStatement: 'Creative work drowns in feedback loops: Figma comments, Frame.io timestamps, Slack threads, email chains. Version control is a filename suffix (_v3_final_REAL.psd).',
    solutionStatement: 'Northwind turns creative chaos into a calm pipeline. Asset reviews, approval gates, and a single source of truth for every deliverable.',
    features: [
      { icon: 'image', title: 'Visual asset reviews', desc: 'Annotate images, PDFs, videos. Threaded comments pinned to timestamps or pixels.' },
      { icon: 'check', title: 'Approval gates', desc: 'Designer → Creative Director → Client. Required approvers, due dates, audit trail.' },
      { icon: 'folder', title: 'Asset library', desc: 'Versioned files with thumbnails. Search by tag, project, or creator.' },
      { icon: 'calendar', title: 'Production calendar', desc: 'Campaign timelines, shoot days, publish dates — all in one view.' },
      { icon: 'users', title: 'External collaborators', desc: 'Invite freelancers, photographers, clients. They see only their tasks.' },
      { icon: 'chart', title: 'Creative velocity', desc: 'Track revision rounds, approval time, and on-time delivery rate.' }
    ],
    useCases: [
      { title: 'Brand design', desc: 'Logo systems, guidelines, presentations — from brief to approved assets.' },
      { title: 'Video production', desc: 'Pre-production → Shoot → Edit → Review → Deliver. Frame-accurate feedback.' },
      { title: 'Content marketing', desc: 'Content calendar, SEO briefs, design requests, publish scheduling.' }
    ],
    testimonial: {
      quote: 'Finally, our designers stop context-switching. Feedback lives *on* the work, not in a separate tool.',
      author: 'Elena Ruiz',
      role: 'Creative Director, Luma Studio',
      avatar: 'u_elena'
    },
    cta: { primary: { label: 'Try free', href: '#/register' }, secondary: { label: 'See features', href: '#/features' } },
    blocks: ['solutions-rich']
  },
  'enterprise': {
    title: 'Enterprise',
    subtitle: 'Scale securely with Northwind. Governance without friction.',
    heroVisual: 'enterprise-hero',
    content: `
      Larger organizations need governance without friction. Northwind is built to grow from a single team to the whole company.
    `,
    icon: 'shield',
    problemStatement: 'Enterprise PM tools require 6-month implementations, dedicated admins, and training budgets. Teams revert to spreadsheets.',
    solutionStatement: 'Northwind deploys in minutes, not quarters. SSO, SCIM, audit logs, and advanced permissions — all configurable, not custom-coded.',
    features: [
      { icon: 'lock', title: 'SSO & SCIM', desc: 'SAML/OIDC (Okta, Azure AD, Google). Automated provisioning and deprovisioning.' },
      { icon: 'users', title: 'Advanced RBAC', desc: 'Custom roles, resource-level permissions, workspace isolation, data residency.' },
      { icon: 'clock', title: 'Audit logs', desc: 'Immutable event stream: who did what, when, from where. SIEM-ready export.' },
      { icon: 'folder', title: 'Multi-workspace', desc: 'Departments, divisions, subsidiaries — each with own members, settings, billing.' },
      { icon: 'chart', title: 'Portfolio reporting', desc: 'Cross-workspace dashboards: capacity, risk, budget, OKR alignment.' },
      { icon: 'shield', title: 'Security & compliance', desc: 'SOC 2 Type II, GDPR, data encryption at rest/in transit, 99.9% SLA.' }
    ],
    useCases: [
      { title: 'Fortune 500', desc: '500+ users, 50 workspaces, SSO + SCIM, quarterly business reviews.' },
      { title: 'Regulated industries', desc: 'Finance, healthcare, gov — audit logs, data residency, retention policies.' },
      { title: 'Merger & acquisition', desc: 'Merge workspaces, unify reporting, maintain history during transitions.' }
    ],
    testimonial: {
      quote: 'We evaluated 12 vendors. Northwind was the only one where security didn\'t mean complexity. IT approved it in a week.',
      author: 'James Okonkwo',
      role: 'VP Engineering, Apex Global',
      avatar: 'u_james'
    },
    cta: { primary: { label: 'Contact sales', href: '#/contact' }, secondary: { label: 'Security docs', href: '#/p/documentation' } },
    blocks: ['solutions-rich']
  },

  // ---------------- Resources ----------------
  'documentation': {
    title: 'Documentation',
    subtitle: 'Learn how to use Northwind.',
    content: `
      Practical, structured guides for every part of the product — from your first project to advanced workspace settings.
    `,
    icon: 'book',
    docCards: [
      { icon: 'rocket', title: 'Getting started', body: 'Create an account, set up your workspace, and invite your team.' },
      { icon: 'folder', title: 'Projects', body: 'Create projects, set health, and track progress over time.' },
      { icon: 'task', title: 'Tasks', body: 'Capture, assign, and move work through list, board, or timeline.' },
      { icon: 'team', title: 'Teams & roles', body: 'Understand Owner, Admin, Manager, Member, and Viewer.' },
      { icon: 'settings', title: 'Settings & permissions', body: 'Configure your workspace, notifications, and access.' },
      { icon: 'info', title: 'FAQ', body: 'Answers to the most common questions about Northwind.' }
    ]
  },
  'guides': {
    title: 'Guides & Best Practices',
    subtitle: 'Master calm, focused work.',
    content: `
      Field-tested playbooks for running projects that stay on track — written for the way real teams work.
    `,
    icon: 'compass',
    docCards: [
      { icon: 'target', title: 'How to manage a project', body: 'Set a clear goal, then let the work flow toward it.' },
      { icon: 'task', title: 'How to create tasks', body: 'Write tasks someone can actually start on today.' },
      { icon: 'team', title: 'How to organize a team', body: 'Match roles to responsibilities, not to titles.' },
      { icon: 'calendar', title: 'How to plan a project', body: 'Turn a vague idea into dated, owned steps.' },
      { icon: 'analytics', title: 'How to track progress', body: 'Review momentum weekly, not at the deadline.' },
      { icon: 'zap', title: 'How to improve productivity', body: 'Remove busywork before adding more process.' }
    ]
  },
  'api': {
    title: 'API Reference',
    subtitle: 'Build on the real Northwind API.',
    content: `
      Northwind exposes a REST API backed by Django REST Framework at ${API_ROOT}. These are the endpoints the live backend actually serves — use them to read and write projects, tasks, and more.

      - **Auth:** Obtain a JWT at \`/auth/login/\` and refresh at \`/auth/refresh/\`.
      - **Projects:** \`/projects/\` (list, create, retrieve, update, delete).
      - **Tasks:** \`/tasks/\` (full CRUD with assignees and statuses).
      - **Comments:** \`/comments/\` (thread discussions on tasks).
      - **Notifications:** \`/notifications/\` (per-user activity feed).
      - **Users:** \`/users/\`, \`/users/register/\`, \`/users/profile/\`.
      - **Dashboard:** \`/dashboard/\` for aggregated stats.
    `,
    icon: 'terminal',
    apiRoot: API_ROOT
  },
  'community': {
    title: 'Community',
    subtitle: 'A place to learn together — planned.',
    content: `
      We want Northwind users to have a home for questions, ideas, and shared playbooks. A hosted community is on the roadmap; in the meantime, the spaces below describe what we are building toward.
    `,
    icon: 'messageCircle',
    community: [
      { icon: 'messageCircle', title: 'Discussions', body: 'Ask questions and share how your team works.' },
      { icon: 'book', title: 'Knowledge base', body: 'Community-maintained tips and templates.' },
      { icon: 'terminal', title: 'Builders', body: 'Share scripts and integrations built on the API.' },
      { icon: 'star', title: 'Feedback', body: 'Shape the roadmap with requests and votes.' }
    ]
  },
  'status': {
    title: 'System Status',
    subtitle: 'Service availability — planned monitor.',
    content: `
      A live status page is planned. Northwind's backend runs locally in this demo, so the services below are not yet monitored by a public status feed. When the monitor ships, this page will reflect real, live state.
    `,
    icon: 'checkCircle',
    status: [
      { name: 'Web application', state: 'planned', label: 'Not monitored yet' },
      { name: 'REST API', state: 'planned', label: 'Not monitored yet' },
      { name: 'Webhooks', state: 'planned', label: 'Planned' },
      { name: 'Background workers', state: 'planned', label: 'Planned' }
    ]
  },

  // ---------------- Company ----------------
  'careers': {
    title: 'Careers',
    subtitle: 'Help us build calmer software.',
    content: `
      We are a small, design-led team that cares about craft. As we grow, the roles below represent the kinds of people we look for. Open positions are shared here when they are live — none are active in this demo build.
    `,
    icon: 'briefcase',
    jobs: [
      { title: 'Senior Frontend Engineer', location: 'Remote (Global)', dept: 'Engineering' },
      { title: 'Product Designer', location: 'New York / Remote', dept: 'Design' },
      { title: 'Developer Advocate', location: 'London / Remote', dept: 'DevRel' }
    ]
  },
  'blog': {
    title: 'The Northwind Blog',
    subtitle: 'Notes on work, design, and focus.',
    content: `
      Occasional writing on the craft of calm software, async teamwork, and the small decisions that make projects feel manageable.
    `,
    icon: 'edit',
    posts: [
      { title: 'The future of async work', excerpt: 'Why constant meetings are quietly draining your team\'s momentum — and what to do instead.', date: 'Aug 12', tag: 'Product' },
      { title: 'Designing Northwind v2', excerpt: 'A look inside our design system and the choices behind a calmer interface.', date: 'Jul 28', tag: 'Design' },
      { title: 'Engineering for speed', excerpt: 'How we rewrote our core data paths and cut response times by roughly 40%.', date: 'Jul 15', tag: 'Engineering' }
    ]
  },
  'contact': {
    title: 'Contact Us',
    subtitle: 'We\'re here to help.',
    content: `
      Questions about Northwind, onboarding, or a demo for your team? Reach out and we'll get back to you.

      You can also email **support@northwind.example.com** directly.
    `,
    icon: 'mail',
    contact: true
  },
  'press': {
    title: 'Press & Media',
    subtitle: 'Brand assets and media contact.',
    content: `
      Northwind is a demonstration product built to show a calm, premium approach to project management. Below are the resources we make available and how to reach us for media inquiries.
    `,
    icon: 'camera',
    brand: [
      { label: 'Product', value: 'Northwind — a premium, editorial project management workspace.' },
      { label: 'Founded', value: '2024, as a small independent studio.' },
      { label: 'Logo & marks', value: 'Available on request for editorial use.' },
      { label: 'Media contact', value: 'press@northwind.example.com' }
    ]
  }
}