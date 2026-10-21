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
        'Every Kindle book carries a <strong>secret lock</strong> so it cannot be copied for free. Each lock is a small piece of code (an encryption algorithm) that scrambles the key. These were <strong>written and tuned by hand</strong>, one at a time, which was slow and did not scale.',
      own:
        'I built the <strong>system that makes those locks automatically</strong>. I designed it end to end (reviewed with a Principal Engineer) and wrote its two brains: the part that <strong>picks which building blocks to use</strong> and the part that <strong>assembles them into a finished, working lock</strong>, exposed as a simple on-demand service.',
      opt:
        'It keeps a big library of lock "building blocks", some written by people, many <strong>invented by an AI</strong> that deliberately makes them twistier so they are harder to crack. For each new lock it <strong>picks a set that fits the limits</strong> (fast enough, small enough, complex enough, and different enough from past ones), <strong>chains them into real code</strong> for every device, and runs a <strong>compile, test and self-repair loop</strong> on every candidate, keeping only the ones that hold.',
      impact:
        'A new lock went from a <strong>~2-month</strong> hand-built effort to <strong>under 30 days</strong>, backed by a library of <strong>70K+</strong> validated algorithms so the platform never runs out of fresh, distinct locks. Shipped across Kindle platforms to <strong>500K+</strong> devices.',
    },
    tech: ['LLMs', 'Generative AI', 'LangChain', 'C++ and Java auto-translate', 'Weighted-scoring selector', 'Serverless API'],
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
    tech: ['Java', 'Python', 'Event-driven DAG engine', 'ECS Fargate', 'DynamoDB', 'SageMaker', 'AI spec-driven dev'],
  },

  ads: {
    animation: 'ads',
    accent: 0xa78bfa,
    chip: 'Amazon Advertising, Contextual Targeting',
    title: 'Matching ads to what the page is actually about',
    lead:
      'Contextual ads only work if the system understands a page in any language and matches the right ad. I expanded that targeting beyond English and made the pipeline behind it much faster, serving 500M+ customers at 1,500 requests a second.',
    metrics: [
      ['40 to 70%', 'ad match rate'],
      ['76h to 30h', 'pipeline latency'],
      ['+68%', 'site coverage'],
    ],
    story: {
      is:
        'Contextual targeting reads the <strong>keywords and topics</strong> of a web page and matches ads that genuinely fit, at <strong>500M+ customers</strong>, <strong>1,500 requests/sec</strong> and <strong>150M+ ad requests a day</strong>. The catch: it only worked well in <strong>English</strong>, and the pipeline that generated the targeting signals was slow.',
      own:
        'I <strong>expanded the matching from English to 8 more languages</strong>, ran a data-driven model comparison, and recommended a <strong>dual-model design</strong> (one English, one multilingual) that preserved English accuracy. I also cut the pipeline latency and the service startup time.',
      opt:
        'I <strong>published predictions straight to a fast in-memory store (Redis)</strong> instead of a slow hand-off, which cut the pipeline from <strong>76 hours to 30 hours</strong>. I cut service <strong>startup time ~80%</strong> by <strong>packaging the model files into the container image</strong> instead of downloading them at boot.',
      impact:
        'Site coverage grew <strong>+68% (3.2M to 5.4M sites/day)</strong>, the <strong>ad-match rate went 40% to 70%</strong>, and the pipeline runs in <strong>under half the time</strong>, now across 9 languages.',
    },
    tech: ['Python', 'Transformer models', 'NLP', 'Dual-model design', 'Redis', 'Docker', '9 languages'],
  },

  agents: {
    animation: 'agents',
    accent: 0x38e8ff,
    chip: 'Agentic AI',
    title: 'AI agents that do the repetitive work',
    lead:
      'I build AI agents that do real engineering work: inspecting media quality and automating the glue work engineers hate. Two things stand out, a perception layer that lets agents "watch" video, and a toolkit that writes on-call handovers in seconds.',
    metrics: [
      ['~30x', 'lower AI cost'],
      ['95%+', 'less manual toil'],
      ['4 teams', 'adopted it'],
    ],
    story: {
      is:
        'On Prime Video I designed an <strong>AI perception layer</strong> (reviewed with a Principal Engineer) that lets AI agents <strong>inspect video, audio and subtitles</strong>, plus a shared <strong>agent toolkit</strong> used across <strong>8+ services</strong> that automates chores like the weekly on-call handover and sprint reports.',
      own:
        'I designed and built both end to end: the perception layer on an agent framework, and the toolkit that I <strong>published org-wide</strong> (adopted by <strong>4 teams</strong>). I ran a knowledge-sharing session to drive adoption.',
      opt:
        'The perception layer <strong>analyzes each video once and reuses it across 40 languages (40x saving)</strong>, runs agents only on the <strong>~3% of flagged assets</strong>, batches signals into one model call ($0.20 to $0.05) and caches results (hit rate <strong>5% to 60%</strong>), for about <strong>30x lower cost</strong>. I found <strong>69% of flagged defects were creative intent</strong> and built a vision+audio agent that separates them at <strong>84% precision</strong>, then cut per-job cost <strong>97% ($0.95 to $0.03)</strong> with a self-hosted open-source model.',
      impact:
        'The toolkit cut on-call handover effort <strong>95%</strong> (about an hour down to a minute) and helped resolve <strong>71 production tickets in 6 months</strong>; the perception work cut projected AI cost <strong>~30x</strong>. Agentic, spec-driven workflows now reshape how the team ships code.',
    },
    tech: ['AI agents', 'LLMs', 'Agent framework (Strands)', 'Model Context Protocol', 'Self-hosted LLM', 'Spec-driven dev'],
  },

  about: {
    animation: 'about',
    accent: 0xffb020,
    chip: 'About',
    title: 'Hi, I\u2019m Vasanthan',
    lead:
      'Backend engineer with 5+ years at Amazon building durable distributed services, data platforms and AI infrastructure for 100M+ customers across Prime Video, Kindle and Advertising.',
    metrics: [
      ['5+', 'years at Amazon'],
      ['100M+', 'customers served'],
      ['0-to-1', 'repeat builder'],
    ],
    rawBody:
      '<div class="about-block"><strong>What I do:</strong> a repeat <strong>0-to-1 builder</strong>. I led a ground-up rebuild of Prime Video\u2019s subtitle quality platform (97.8% faster, 99.4% cheaper), built greenfield anti-piracy and content-protection systems, a generative-AI algorithm framework, and agentic automation adopted across the org.</div>' +
      '<div class="about-block"><strong>How I work:</strong> I pioneer <strong>AI-native engineering</strong> practices, with agents and spec-driven workflows that reshape how the team designs, reviews and ships code.</div>' +
      '<div class="about-block"><strong>Journey:</strong> SDE-1 (Jun 2021 to Jun 2024, Kindle and Amazon Advertising), then SDE-2 (Jun 2024 to present, Prime Video and Advertising). B.Tech, College of Engineering Guindy (CGPA 9.39/10).</div>' +
      '<div class="about-block"><strong>Toolkit:</strong> Java, Python, C/C++, Go, TypeScript, Node.js, SQL. AWS (ECS/Fargate, Lambda, Step Functions, EventBridge, DynamoDB, S3, Redis, OpenSearch, SageMaker, Bedrock). Distributed systems, workflow orchestration, idempotency, sharding. Agentic AI, LLMs, RAG, MCP, NLP.</div>',
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
