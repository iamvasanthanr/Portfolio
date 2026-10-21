/**
 * data/projects.ts
 * Single source of truth for every sector's content.
 * Plain language, no internal jargon, no em-dashes.
 * The 3D world places a prop per sector; walking up opens a panel
 * that renders this content plus the sector's signature animation.
 */

export type AnimationKind = 'book' | 'tv' | 'ads' | 'agents' | 'about' | 'contact';
export type SectorKey = 'kindle' | 'prime' | 'ads' | 'agents' | 'about' | 'contact';

export interface StoryBlock {
  /** plain-English "what it is" */
  is?: string;
  /** what I owned */
  own?: string;
  /** what I optimized (tech detail welcome, but no internal names) */
  opt?: string;
  /** measurable impact */
  impact?: string;
}

export interface Project {
  /** which signature animation this sector shows */
  animation: AnimationKind;
  accent: number; // hex color for this sector's theme
  chip: string;
  title: string;
  lead: string;
  metrics: [string, string][];
  story?: StoryBlock;
  tech?: string[];
  /** raw HTML body for about/contact (no story blocks) */
  rawBody?: string;
}

export const PROJECTS: Record<SectorKey, Project> = {
  kindle: {
    animation: 'book',
    accent: 0xffb020,
    chip: 'Kindle, Content Protection, Gen-AI',
    title: 'Teaching AI to write the locks on e-books',
    lead:
      'Every Kindle book is sealed with a secret lock (an encryption algorithm) so it cannot be copied for free. These used to be written by hand, one at a time. I built a framework where AI invents, tests and benchmarks new ones automatically, and translates them so every device understands them.',
    metrics: [
      ['70K+', 'locks invented'],
      ['500K+', 'devices'],
      ['2mo to <30d', 'per new lock'],
    ],
    story: {
      is:
        'Every Kindle book carries a <strong>secret lock</strong> so it cannot be copied for free. Each lock is a small piece of code that scrambles the key. A <strong>2023 break-in</strong> cracked a batch of them, and after that engineers were <strong>hand-building each new lock</strong>, writing it twice (once per kind of device) and testing it, about <strong>2 months each</strong>, which left books exposed too long.',
      own:
        'I built the <strong>system that makes those locks automatically</strong>. I designed it end to end (reviewed with a Principal Engineer) and wrote its two brains: the part that <strong>picks which building blocks to use</strong> and the part that <strong>assembles them into a finished, working lock</strong>, exposed as a simple on-demand service.',
      opt:
        'It keeps a big library of lock "building blocks", some written by people, many <strong>invented by an AI</strong> that deliberately makes them twistier so they are harder to crack. For each new lock it <strong>picks a set that fits the limits</strong> (fast enough, small enough, complex enough, and different enough from past ones), <strong>chains them into real code</strong> for every device, and runs a <strong>compile, test and self-repair loop</strong> on every candidate, keeping only the ones that hold.',
      impact:
        'A new lock went from a <strong>~2-month</strong> hand-built effort to <strong>under 30 days</strong>, backed by a library of <strong>70K+</strong> validated algorithms so the platform never runs out of fresh, distinct locks. Shipped across Kindle platforms to <strong>500K+</strong> devices.',
    },
    tech: ['LLMs', 'Generative AI', 'C++ and Java auto-translate', 'Constraint-based selection', 'Serverless API', 'Compile-test-repair loop'],
  },

  prime: {
    animation: 'tv',
    accent: 0x22d3ee,
    chip: 'Prime Video, Subtitle Quality',
    title: 'Checking every subtitle before you see it',
    lead:
      'Lots of people watch with subtitles on. Before any subtitle reaches 100M+ customers it gets checked: in sync? right language? actually there? I led the ground-up rebuild of that quality platform across 70+ languages, replacing a 7-year-old system.',
    metrics: [
      ['97.8%', 'faster'],
      ['~$1.3M', 'saved / yr'],
      ['50M+', 'jobs migrated'],
    ],
    story: {
      is:
        'Before any subtitle reaches you it gets <strong>quality-checked</strong>: in sync with the speech? the right language? actually present? readable? I rebuilt the service that runs all <strong>47 of those checks</strong> on every subtitle file, across <strong>70+ languages</strong> at <strong>20 checks a second</strong>. The old one took <strong>~3 hours</strong> per batch.',
      own:
        'I <strong>led the launch</strong>: migrated <strong>50M+ jobs</strong> with <strong>zero customer impact</strong> (shadow testing plus a careful dial-up), moving all the existing checks for every team, then designed and shipped <strong>4 new detectors</strong> including catching <strong>wrong</strong>, <strong>missing</strong> and <strong>out-of-sync</strong> subtitles. Zero post-launch defects.',
      opt:
        'Instead of the old system constantly asking "are you done yet?", the work now <strong>announces itself when it is finished</strong>: an event-driven workflow runs the checks in parallel and retries only the one that fails. It <strong>only runs when there is work</strong> (scale-to-zero), and a <strong>cache that skips unchanged videos</strong> saved <strong>~$1.3M a year</strong> in AI processing.',
      impact:
        'End-to-end time <strong>3 hours to 8 minutes (97.8% faster)</strong>, <strong>~$1.3M/yr</strong> saved, <strong>50M+</strong> jobs migrated cleanly, and manual deployments <strong>down to 0</strong> via full automated testing and release. I also brought in <strong>AI spec-driven development</strong> that cut feature delivery from <strong>3 weeks to 1</strong>.',
    },
    tech: ['Java', 'Python', 'Event-driven workflows', 'ECS Fargate', 'DynamoDB', 'AI spec-driven dev'],
  },

  ads: {
    animation: 'ads',
    accent: 0xa78bfa,
    chip: 'Amazon Advertising, Contextual Targeting',
    title: 'Matching ads to what the page is actually about',
    lead:
      'For contextual ads to be relevant, the system has to understand a page\u2019s content in any language and match the right ad to it. I worked on expanding that targeting beyond English and cutting the pipeline that powers it.',
    metrics: [
      ['40 to 70%', 'ad match rate'],
      ['~60%', 'faster pipeline'],
      ['+68%', 'site coverage'],
    ],
    story: {
      is:
        'Contextual targeting reads the <strong>keywords and topics</strong> of a page and matches ads that genuinely fit. The challenge: it only worked well in <strong>English</strong>, and the pipeline that generated the targeting signals was slow.',
      own:
        'I owned the <strong>multilingual expansion</strong>, extending keyword generation from English to <strong>8 more languages</strong>, plus the analysis and changes that cut the pipeline\u2019s latency and a <strong>dual-model design</strong> recommendation.',
      opt:
        'I taught it to <strong>read a page in any language</strong> and pull out the words that matter (language analysis plus <strong>meaning-based matching</strong>, so it understands intent, not just exact words). I proposed running <strong>two smaller models</strong> (one for English, one for everything else) instead of one big one: same accuracy, but the service <strong>starts about 80% faster</strong>, and I rebuilt the slow data pipeline behind it.',
      impact:
        'Pipeline latency <strong>76h to 30h (~60% faster)</strong>, <strong>ad-match rate 40% to 70%</strong>, and targeting coverage <strong>+68% (3.2M to 5.4M sites/day)</strong> as support went from English to 8 more languages.',
    },
    tech: ['Python', 'NLP', 'Sentence embeddings', 'Dual-model design', 'ML data pipeline', '8+ languages'],
  },

  agents: {
    animation: 'agents',
    accent: 0x38e8ff,
    chip: 'Agentic AI',
    title: 'AI agents that do the repetitive work',
    lead:
      'A lot of engineering time goes to glue work, like pulling status from five different internal tools to write an on-call handover or a sprint report. I built AI agents that do it in seconds.',
    metrics: [
      ['95%+', 'less manual effort'],
      ['5', 'tools pulled from'],
      ['4 teams', 'adopted it'],
    ],
    story: {
      is:
        'Two <strong>AI agent workflows</strong>: one writes the weekly <strong>on-call handover</strong> by gathering from five internal systems (tickets, alerts, security and risk dashboards), the other generates <strong>sprint reports</strong> from the task tracker, each producing a clean, ready-to-share document.',
      own:
        'I designed and shipped the shared <strong>agent toolkit</strong> end to end and published it so the whole org could use it, and ran a knowledge-sharing session to get other teams adopting it.',
      opt:
        'A "manager" agent asks all <strong>5 tools at once</strong> (in parallel), then an AI writes the answers up into one tidy report, replacing a manual copy-paste-summarize ritual. On Prime Video I also shipped <strong>5+ AI "inspector" agents</strong> that catch wrong-language, missing or out-of-sync subtitles, and ran delivery with a workflow where <strong>AI writes and reviews the code against a written spec</strong>.',
      impact:
        'Manual effort cut <strong>95%+</strong> (about 1 hour down to under 1 minute), <strong>adopted by 4 teams</strong>, and the spec-driven approach let one engineer ship the output of 3 to 4 during the subtitle-platform rebuild.',
    },
    tech: ['AI agents', 'Tool orchestration', 'LLMs', 'Spec-driven dev', 'Org-wide rollout'],
  },

  about: {
    animation: 'about',
    accent: 0xffb020,
    chip: 'About',
    title: 'Hi, I\u2019m Vasanthan',
    lead:
      'A Software Development Engineer (SDE-2) at Amazon with 5+ years across Kindle, Advertising and Prime Video. I build backend and distributed systems, lately a lot of agentic AI and LLM infrastructure.',
    metrics: [
      ['5+', 'years at Amazon'],
      ['100M+', 'customers served'],
      ['7', 'major projects'],
    ],
    rawBody:
      '<div class="about-block"><strong>What I do:</strong> I turn slow, manual, expensive systems into fast, cheap, automatic ones (event-driven architectures, scale-to-zero services), and increasingly I design systems where <strong>AI agents do the heavy lifting</strong> while I own the architecture and the specs.</div>' +
      '<div class="about-block"><strong>Journey:</strong> SDE-1 (Jun 2021 to Jun 2024, Kindle and Amazon Advertising), then SDE-2 (Jun 2024 to present, Prime Video). A repeat <strong>0-to-1 builder</strong>: content protection across 4 platforms, anti-piracy watermarking at 100M+ scale, a generative-AI framework for encryption algorithms, and agentic automation adopted across the org.</div>' +
      '<div class="about-block"><strong>Toolkit:</strong> Java, Python, C/C++, TypeScript. AWS (Lambda, ECS/Fargate, DynamoDB, Step Functions, SQS/SNS, EventBridge). Distributed systems and event-driven architecture. Agentic AI, LLMs, RAG, NLP.</div>',
  },

  contact: {
    animation: 'contact',
    accent: 0x4ade80,
    chip: 'Contact',
    title: 'Let\u2019s talk',
    lead: 'Open to senior backend and AI-infrastructure roles. Fastest way to reach me is email, I reply quickly.',
    metrics: [],
    rawBody:
      '<div class="clinks">' +
      '<a class="clink" href="mailto:vasanthan25799@gmail.com"><span class="big">&#9993;&#65039;</span><span><span class="t">vasanthan25799@gmail.com</span><br><span class="s">Email me, I reply fast</span></span></a>' +
      '<a class="clink" href="https://linkedin.com/in/vasanthan-r" target="_blank" rel="noopener"><span class="big">in</span><span><span class="t">linkedin.com/in/vasanthan-r</span><br><span class="s">Connect on LinkedIn</span></span></a>' +
      '<a class="clink" href="tel:+919791160978"><span class="big">&#128222;</span><span><span class="t">+91 97911 60978</span><br><span class="s">Bengaluru, India</span></span></a>' +
      '<a class="clink" href="resume.pdf" download><span class="big">&#11015;&#65039;</span><span><span class="t">Download Resume</span><br><span class="s">PDF</span></span></a>' +
      '</div>',
  },
};
