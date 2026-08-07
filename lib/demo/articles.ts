import { calculateReadingTime } from "@/lib/article/reading-time";

export type DisclosureType =
  | "none"
  | "opinion"
  | "financial"
  | "affiliate"
  | "sponsored"
  | "ai_assisted";

export type DemoCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

export type DemoTag = { id: string; name: string; slug: string };

export type DemoArticle = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  category: DemoCategory;
  tags: DemoTag[];
  coverImageUrl: string;
  coverImageAlt: string;
  coverImageCaption: string;
  disclosure: DisclosureType;
  disclosureNote: string | null;
  isFeatured: boolean;
  publishedAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string | null;
  readingTimeMinutes: number;
};

export const demoAuthor = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "Topicora Editorial Desk",
  slug: "topicora-editorial-desk",
  bio: "Topicora’s editorial team explains useful ideas with context, care, and practical next steps.",
};

export const demoCategories: DemoCategory[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Technology & AI",
    slug: "technology-ai",
    description: "Clear explanations of the tools and systems shaping digital life.",
    sortOrder: 1,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    name: "Money & Work",
    slug: "money-work",
    description: "Practical frameworks for work, money, and better professional decisions.",
    sortOrder: 2,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    name: "Culture & Media",
    slug: "culture-media",
    description: "How media, platforms, and culture influence what we notice and value.",
    sortOrder: 3,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    name: "Everyday Life",
    slug: "everyday-life",
    description: "Thoughtful approaches to habits, attention, and ordinary choices.",
    sortOrder: 4,
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    name: "Practical Guides",
    slug: "practical-guides",
    description: "Repeatable, useful methods for navigating information and daily tasks.",
    sortOrder: 5,
  },
];

export const demoTags: DemoTag[] = [
  ["30000000-0000-4000-8000-000000000001", "artificial intelligence", "artificial-intelligence"],
  ["30000000-0000-4000-8000-000000000002", "search", "search"],
  ["30000000-0000-4000-8000-000000000003", "digital literacy", "digital-literacy"],
  ["30000000-0000-4000-8000-000000000004", "investing", "investing"],
  ["30000000-0000-4000-8000-000000000005", "financial literacy", "financial-literacy"],
  ["30000000-0000-4000-8000-000000000006", "business", "business"],
  ["30000000-0000-4000-8000-000000000007", "social media", "social-media"],
  ["30000000-0000-4000-8000-000000000008", "attention", "attention"],
  ["30000000-0000-4000-8000-000000000009", "online culture", "online-culture"],
  ["30000000-0000-4000-8000-000000000010", "productivity", "productivity"],
  ["30000000-0000-4000-8000-000000000011", "habits", "habits"],
  ["30000000-0000-4000-8000-000000000012", "decision making", "decision-making"],
  ["30000000-0000-4000-8000-000000000013", "fact checking", "fact-checking"],
  ["30000000-0000-4000-8000-000000000014", "media literacy", "media-literacy"],
  ["30000000-0000-4000-8000-000000000015", "research", "research"],
].map(([id, name, slug]) => ({ id, name, slug }));

const category = (slug: string) => demoCategories.find((item) => item.slug === slug)!;
const tags = (...slugs: string[]) => demoTags.filter((tag) => slugs.includes(tag.slug));

const aiSearch = `AI assistants are changing a familiar internet ritual. Instead of translating a question into a few keywords, opening several tabs, and assembling an answer, a person can describe what they need in ordinary language. The assistant may return an explanation, comparison, or plan in seconds. That convenience is real, but the interface also changes what users can see about how an answer was formed.

## From keywords to conversations

Traditional search asks the user to do part of the retrieval work. You choose terms, scan a results page, notice the source, and decide which link deserves attention. A conversational assistant accepts a longer prompt and can ask or infer what kind of response would be useful. It can also preserve context: after asking about a laptop, you can say “compare the battery life” without repeating the model names.

This feels less like operating an index and more like briefing a knowledgeable helper. Yet the assistant is still working from systems that retrieve, rank, and generate information. Fluency can make those hidden steps easy to forget. A well-written paragraph is not evidence that its underlying claim is correct.

## What becomes easier

Conversational search is especially helpful when a person does not know the vocabulary of a topic. A student can describe a coding error in plain English. A traveller can state dates, dietary needs, and a budget together. Someone reading a dense policy can request a simpler explanation before examining the original text.

Assistants are also good at transforming information. They can turn an explanation into a checklist, compare two concepts in a table, or propose follow-up questions. These are useful reductions in friction. They help people move from an unclear need to a more structured investigation, which is often the hardest first step.

## What can go wrong

The same compression that saves time can remove important context. The assistant may merge claims from sources with different levels of credibility, omit disagreement, or present an outdated detail without a visible date. Generative systems can also produce a plausible statement that is unsupported. This is not always obvious because confidence in the writing style does not reliably track confidence in the facts.

The risk rises when a question is ambiguous, recent, local, or consequential. Laws, product prices, exam rules, medical advice, and market information can change. A response that was once accurate may no longer be useful. Personal data is another concern: a convenient prompt box is not the right place for passwords, financial account details, confidential documents, or someone else’s private information.

## Source verification

Treat the answer as a map, not the destination. Ask which sources support the central claims, then open them. Prefer primary material when it exists: an official notification for a rule, a company filing for its reported finances, or the original research paper for a scientific finding. Check the publication date, the geographic scope, and whether the quoted conclusion matches the source.

For an important claim, find independent confirmation rather than several pages that repeat the same wording. Search for the precise statement outside the assistant. If a source cannot be located, narrow the request or consider the claim unverified. Screenshots and confident summaries are not substitutes for traceable evidence.

## Practical habits

Begin with a specific prompt that states your goal, relevant constraints, location, and desired format. Then ask the assistant to identify uncertainty and show its sources. Separate brainstorming from verification: it is reasonable to use an assistant to generate options, but evaluate the final choice with reliable material.

Slow down when the cost of being wrong is high. For health, legal, safety, or financial decisions, use qualified professional guidance and current primary sources. Finally, keep your own search skills active. Knowing how to inspect a domain, recognize an official document, and compare accounts remains valuable precisely because conversational interfaces make the process feel effortless.`;

const stockFramework = `A stock is a small ownership interest in a business, not a prediction ticket. That distinction gives beginners a more useful starting point. Instead of trying to guess where the price will move next week, they can ask what the company sells, how it finances itself, what could weaken it, and what expectations are already reflected in the price.

> **Financial disclosure:** This demonstration article is for general education and is not investment advice. Investing can lead to loss. Consider your circumstances and consult a qualified adviser where appropriate.

## Business model

Start by explaining the company in a few plain sentences. Who is the customer? What problem does the product solve? How does money arrive: a one-time sale, a subscription, an advertising fee, interest, or something else? A model you cannot describe is difficult to evaluate.

Look for the forces that affect demand and costs. A retailer depends on inventory and store economics; a lender depends on credit quality and funding; a software company may depend on renewals and product development. Read the annual report’s business section and risk factors. Investor presentations are useful, but remember that they are designed by management to explain the company favourably.

## Financial health

Review several years rather than a single quarter. Revenue shows the scale of sales, while profit measures what remains under accounting rules. Cash flow helps reveal whether operations are actually producing cash. None of these numbers is sufficient alone. Fast revenue growth paired with worsening cash needs tells a different story from measured growth funded by operations.

Debt deserves context. Compare borrowing with cash generation and the timing of repayments. Banks and other financial companies require different measures from manufacturers, so avoid applying one checklist mechanically. Read the notes to the financial statements when a number is unusually large or changes sharply.

## Competitive position

Ask why customers choose this company and what would make them leave. Possible advantages include distribution, a trusted brand, switching costs, regulation, scale, or a product that improves with participation. Then look for evidence. A claimed advantage matters only if it appears in customer retention, pricing power, margins, market position, or another relevant operating measure.

Competition is not limited to companies selling an identical product. A cheaper process, a new regulation, or a change in customer behaviour can alter the market. A durable company keeps investing while protecting the reason customers value it.

## Valuation

A strong business can still be a poor purchase at an extreme price. Valuation compares the market price with some measure of earnings, cash flow, assets, or future potential. Each measure has limitations. A price-to-earnings ratio is unhelpful when earnings are temporarily distorted; an asset measure may miss an important brand or network.

Use more than one scenario. What assumptions about growth, margins, and reinvestment would justify the current price? How sensitive is the conclusion if those assumptions soften? The aim is not to produce a perfectly precise fair value. It is to make the market’s expectations visible and decide whether they leave room for error.

## Risk

Write a short “what would prove me wrong” list before buying. Include business risks, financial risks, governance concerns, regulation, customer concentration, currency exposure, and the possibility that your information is incomplete. Separate temporary volatility from a permanent impairment of the business, while recognising that the distinction is clearest only in hindsight.

Position size is part of risk. Even careful analysis can fail, so diversification and an emergency fund matter. Money needed soon should not depend on a volatile asset recovering on schedule.

## Personal suitability

The final question is about the investor, not the company. Clarify the goal, time horizon, need for liquidity, ability to tolerate losses, and existing portfolio. A security that fits one person can be unsuitable for another.

Keep a decision journal with the evidence, assumptions, valuation range, risks, and reason for acting. Review it when facts change, not merely when the price moves. This framework cannot remove uncertainty. It can replace an impulsive forecast with a disciplined process—and make it easier to notice when you do not yet understand enough to invest.`;

const shortVideos = `Short-video feeds remove almost every pause between wanting stimulation and receiving it. A clip begins automatically, fills the screen, and gives way to another with one gesture. The content may be delightful, informative, irritating, or forgettable. What matters to the feed is that the next possibility is always close, making a stopping point surprisingly hard to find.

## Frictionless consumption

Older media often contains boundaries. A television episode ends. A newspaper has a final page. Even a web article requires a choice before the next one opens. An endless feed replaces those edges with continuity. Autoplay eliminates the first decision, and the vertical swipe makes the next item easier than deciding what to do instead.

Low friction is not inherently harmful. It helps people discover creators, learn a technique, or enjoy a brief break. The problem appears when convenience weakens intention. Opening an app for one message can become a long viewing session because the interface never asks the user to choose again.

## Novelty and uncertainty

Each swipe offers a small uncertainty: the next clip might be unusually funny, useful, or emotionally striking. Most clips need not be exceptional for the possibility to remain attractive. The sequence mixes predictable formats with unexpected rewards, so another attempt feels inexpensive.

Rapid novelty also narrows the time available for reflection. Before a viewer decides whether a clip was worth attention, the next one has already begun. This pace can make slower activities feel demanding immediately afterward, not because the activities changed, but because the comparison point did.

## Personalization

A feed learns from behaviour. Replays, pauses, skips, shares, follows, and other signals help it estimate what may hold a particular person’s attention. This can create a remarkably relevant stream without requiring explicit preferences. It can also amplify a passing curiosity into a dominant theme because the system observes behaviour, not the user’s broader intentions.

Personalization can narrow context. Seeing many similar clips may make a viewpoint seem more universal than it is. The system’s confidence can also be mistaken for self-knowledge: “the feed knows me” feels natural even though it mainly knows which content kept the session moving.

## Social cues

Visible reactions add another layer. Counts, comments, remixes, and familiar creators signal that a clip is part of a shared conversation. A viewer may stay not only for the content but to avoid missing a reference that friends will understand. Public metrics can make popularity look like quality, even when the two are unrelated.

Short video also compresses identity and community into recognisable patterns. Sounds, editing styles, jokes, and challenges make participation easy. These patterns can be creative and connective. They can also make repetition feel fresh because the social setting keeps changing.

## Healthier use

The most useful response is to add deliberate stopping points. Decide what the app is for before opening it: replying to a person, finding a recipe, or taking a ten-minute break. A timer can help, but a physical transition is stronger—stand up, put the phone elsewhere, or begin a prepared next activity when it rings.

Reduce accidental entry by disabling nonessential notifications and moving the app away from the first home screen. Use following or subscription views when they give more control than algorithmic discovery. Notice the situations that produce automatic use, such as waiting, fatigue, or avoiding an unclear task, and prepare a substitute that fits the same moment.

The goal need not be total abstinence. It is to restore a visible choice between one clip and the next. When the feed supplies no natural ending, users can deliberately design one of their own.`;

const twoMinuteRule = `The two-minute rule sounds wonderfully decisive: if a task takes less than two minutes, do it now. A related version says that a new habit should begin with an action that takes about two minutes. Both can be useful, but they solve different problems. Confusing them—or applying either without context—can turn a simple aid into another source of distraction.

## Two versions of the rule

The task-management version is a triage rule. When processing an inbox or list, a very small action may cost more to record, schedule, and rediscover than to complete. Sending a simple confirmation or filing a document can close an open loop immediately.

The habit version is about reducing the threshold for starting. “Read before bed” becomes “open the book and read one page.” The tiny action is not the whole ambition; it is an entry ramp. Repetition makes the starting cue familiar, after which the activity can expand naturally.

## Where it works

Immediate completion works best during a time already reserved for small administrative tasks. If you are processing messages, answering one that genuinely needs a short factual reply preserves momentum. The rule also helps with tasks that otherwise create disproportionate mental clutter, such as putting an item in its proper place after using it.

For habits, a two-minute beginning works when resistance is mostly about activation. Laying out exercise clothes, writing one sentence, or opening a study document makes the desired behaviour concrete. Success is easy to recognise, which helps establish consistency without demanding motivation at exactly the right moment.

## Where it fails

Time estimates are unreliable. A request that appears to need two minutes can uncover missing information, invite a follow-up, or create a new commitment. More importantly, a short task can still be expensive when it interrupts concentrated work. The cost includes noticing the task, switching context, and rebuilding a mental model afterward.

The rule can also reward visible busyness. Completing many tiny items feels productive, while an important ambiguous project remains untouched. For habits, making the action permanently tiny may protect a streak without creating meaningful progress. The small beginning must eventually connect to the larger practice.

## A better decision test

Add two questions to the estimate. First: am I already in a mode suited to this task? Second: will doing it now create more work or break valuable focus? If the task fits the current context and truly closes a loop, complete it. If it interrupts, capture it in a trusted place and return during an administrative block.

For a habit, define both a minimum and a normal version. The minimum keeps the routine alive on difficult days; the normal version moves the goal forward. “Open the notes and review one card” might be the minimum, while a focused twenty-minute review is the normal session.

## Experiment

Try the rule for one week with boundaries. Use it only while processing a list, tidying a space, or completing another batch of small work. During focused sessions, record minor tasks without acting on them. At the end of the day, note which quick actions stayed quick and which expanded.

For one desired habit, write the two-minute entry action, the normal session, and the cue that connects them. Review whether starting became easier and whether the activity grew beyond the minimum. Keep the rule if it reduces friction without fragmenting attention.

Productivity advice is most useful as a testable hypothesis. The two-minute rule is neither a universal law nor an empty myth. It is a compact tool whose value depends on timing, boundaries, and the kind of resistance you are trying to overcome.`;

const verifyViralClaim = `A viral post often arrives with an instruction disguised as emotion: be shocked, be angry, be afraid, or share immediately. Verification begins by refusing that pace. You do not need specialist software to check many claims. You need a repeatable sequence that separates what is shown from what is implied and looks for evidence outside the post itself.

## Pause

Do not share while the first emotional response is strongest. Save the post or copy its link. Ask what would happen if you waited ten minutes. Urgency is sometimes part of the manipulation, especially when a caption claims that information is being deleted or hidden.

Notice your own incentives. A claim that confirms an existing belief may receive less scrutiny than one that challenges it. Verification should not depend on whether you like the conclusion.

## Identify the original claim

Rewrite the claim as one sentence that could be checked. Separate the media from the caption. A real photograph may be paired with the wrong place, date, or explanation. A statistic may be genuine but used to imply a conclusion it does not measure.

Record specific names, dates, locations, organisations, and quoted phrases. These details become search terms. If the post makes several claims, evaluate them separately rather than treating the package as simply true or false.

## Find the primary source

Look for the material closest to the event: an official order, full speech, court document, dataset, company filing, research paper, or complete video. Search a distinctive phrase in quotation marks. Visit the institution’s real website directly instead of trusting a screenshot of its logo.

Primary does not mean infallible. It means you can see what was actually issued and assess its scope. Check whether the document has identifiers, links from an official index, and contact details that match the institution.

## Check date and context

Old material frequently returns as new. Find the earliest publication date you can and compare weather, clothing, landmarks, office-holders, and other contextual details. Read several paragraphs before and after a quoted line. Watch more than the clipped segment.

Ask whether the source applies to the same jurisdiction and population described in the post. A rule from one Indian state, for example, should not be presented as a nationwide change without evidence.

## Reverse-search media

For an image, use a reverse-image search service and inspect older appearances. Crop around distinctive regions if text or borders interfere. For video, capture clear frames from different moments and search those images. Look for the original uploader rather than the largest repost.

Editing is not the only risk. Authentic media can be mirrored, slowed, selectively trimmed, or placed beside unrelated audio. Compare landmarks, shadows, signs, and sequence with the claimed account.

## Compare independent reporting

Find reporting from organisations that conducted their own verification or cite different direct sources. Several sites repeating the same agency copy or social post are not independent confirmation. Prefer reports that show documents, explain methods, name accountable reporters, and correct errors transparently.

For specialist subjects, look for relevant expertise and disclosed limitations. A confident general commentator is not a substitute for someone who understands the field and can point to evidence.

## Decide whether to share

Classify the result honestly: verified, contradicted, misleading, unproven, or missing context. “Unproven” is a useful conclusion. The absence of disproof does not establish that a claim is true.

If you share a correction, link to the evidence and describe the error without unnecessarily republishing harmful media or personal information. If the claim concerns immediate safety, contact the responsible local authority through a verified channel.

Sometimes the best outcome is not sharing at all. Verification is not merely a technique for winning an argument. It is a small act of information hygiene that prevents your credibility—and other people’s attention—from being used to extend a misleading claim.`;

const makeArticle = (
  article: Omit<DemoArticle, "readingTimeMinutes">,
): DemoArticle => ({
  ...article,
  readingTimeMinutes: calculateReadingTime(article.contentMarkdown),
});

export const demoArticles: DemoArticle[] = [
  makeArticle({
    id: "40000000-0000-4000-8000-000000000001",
    authorId: demoAuthor.id,
    title: "How AI Assistants Are Changing Everyday Search",
    slug: "how-ai-assistants-are-changing-everyday-search",
    category: category("technology-ai"),
    tags: tags("artificial-intelligence", "search", "digital-literacy"),
    excerpt:
      "AI assistants are changing how people move from a question to an answer. Here is what that shift improves, what it hides, and how to verify the results.",
    contentMarkdown: aiSearch,
    coverImageUrl: "/demo/ai-search.svg",
    coverImageAlt:
      "Abstract illustration of a search box transforming into a conversational interface",
    coverImageCaption: "A conversational answer can shorten the path from question to context.",
    disclosure: "ai_assisted",
    disclosureNote:
      "AI tools assisted with structural review; the article was written, checked, and approved by the Topicora editorial desk.",
    isFeatured: true,
    publishedAt: "2026-08-04T04:30:00.000Z",
    updatedAt: "2026-08-04T04:30:00.000Z",
    seoTitle: "How AI Assistants Are Changing Search | Topicora",
    seoDescription:
      "Understand how conversational search changes discovery, where it can fail, and the habits that make AI-assisted answers safer to use.",
  }),
  makeArticle({
    id: "40000000-0000-4000-8000-000000000002",
    authorId: demoAuthor.id,
    title: "A Beginner’s Framework for Evaluating a Stock Without Predicting the Future",
    slug: "beginner-framework-for-evaluating-a-stock",
    category: category("money-work"),
    tags: tags("investing", "financial-literacy", "business"),
    excerpt:
      "Instead of guessing tomorrow’s price, beginners can learn to examine the business, its finances, valuation, risks, and their own objectives.",
    contentMarkdown: stockFramework,
    coverImageUrl: "/demo/stock-framework.svg",
    coverImageAlt:
      "Notebook showing a simple business-analysis checklist beside a financial chart",
    coverImageCaption: "A useful stock review starts with the business, not a price forecast.",
    disclosure: "financial",
    disclosureNote: "General educational content only; not investment advice.",
    isFeatured: false,
    publishedAt: "2026-08-01T04:30:00.000Z",
    updatedAt: "2026-08-01T04:30:00.000Z",
    seoTitle: "A Beginner’s Stock Evaluation Framework | Topicora",
    seoDescription:
      "A practical framework for examining a company’s business, finances, competitive position, valuation, risks, and personal suitability.",
  }),
  makeArticle({
    id: "40000000-0000-4000-8000-000000000003",
    authorId: demoAuthor.id,
    title: "Why Short Videos Feel So Difficult to Stop Watching",
    slug: "why-short-videos-are-difficult-to-stop-watching",
    category: category("culture-media"),
    tags: tags("social-media", "attention", "online-culture"),
    excerpt:
      "Short-video feeds combine low effort, rapid novelty, and uncertain rewards. Understanding the design can help users regain intentional control.",
    contentMarkdown: shortVideos,
    coverImageUrl: "/demo/short-videos.svg",
    coverImageAlt: "Smartphone displaying a sequence of abstract short-video cards",
    coverImageCaption: "An endless feed removes the natural boundaries that usually invite a pause.",
    disclosure: "none",
    disclosureNote: null,
    isFeatured: false,
    publishedAt: "2026-07-28T04:30:00.000Z",
    updatedAt: "2026-07-28T04:30:00.000Z",
    seoTitle: "Why Short Videos Are Difficult to Stop Watching | Topicora",
    seoDescription:
      "Explore how frictionless feeds, novelty, personalization, and social cues make short videos compelling—and how to use them intentionally.",
  }),
  makeArticle({
    id: "40000000-0000-4000-8000-000000000004",
    authorId: demoAuthor.id,
    title: "The Two-Minute Rule: Useful Tool or Productivity Myth?",
    slug: "two-minute-rule-productivity",
    category: category("everyday-life"),
    tags: tags("productivity", "habits", "decision-making"),
    excerpt:
      "The two-minute rule can reduce small-task clutter, but applying it indiscriminately can fragment attention.",
    contentMarkdown: twoMinuteRule,
    coverImageUrl: "/demo/two-minute-rule.svg",
    coverImageAlt: "Two-minute timer beside a short handwritten task list",
    coverImageCaption: "A quick-task rule works best when it respects the context of focused work.",
    disclosure: "opinion",
    disclosureNote: "This article presents an editorial interpretation of a productivity technique.",
    isFeatured: false,
    publishedAt: "2026-07-23T04:30:00.000Z",
    updatedAt: "2026-07-23T04:30:00.000Z",
    seoTitle: "The Two-Minute Rule: Tool or Productivity Myth? | Topicora",
    seoDescription:
      "Learn the two meanings of the two-minute rule, where each works, where it fragments attention, and how to test it safely.",
  }),
  makeArticle({
    id: "40000000-0000-4000-8000-000000000005",
    authorId: demoAuthor.id,
    title: "How to Verify a Viral Claim Before Sharing It",
    slug: "how-to-verify-a-viral-claim",
    category: category("practical-guides"),
    tags: tags("fact-checking", "media-literacy", "research"),
    excerpt:
      "A repeatable verification process can prevent an emotional post, edited clip, or misleading screenshot from becoming another unexamined share.",
    contentMarkdown: verifyViralClaim,
    coverImageUrl: "/demo/verify-claim.svg",
    coverImageAlt: "Magnifying glass inspecting a social-media post",
    coverImageCaption: "Verification starts by separating the evidence from the caption around it.",
    disclosure: "none",
    disclosureNote: null,
    isFeatured: false,
    publishedAt: "2026-07-18T04:30:00.000Z",
    updatedAt: "2026-07-18T04:30:00.000Z",
    seoTitle: "How to Verify a Viral Claim Before Sharing | Topicora",
    seoDescription:
      "Use a repeatable seven-step process to check a viral claim, trace primary sources, verify media, and decide whether to share.",
  }),
];
