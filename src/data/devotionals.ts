// Static curated library of faith + finance devotionals.
// Selected deterministically by day-of-year so each day shows a consistent entry.

export interface Devotional {
  id: string;
  scripture: string;
  reference: string;
  devotional: string;
  reflection: string;
  prayer: string;
  theme:
    | "stewardship"
    | "generosity"
    | "discipline"
    | "wisdom"
    | "contentment"
    | "debt"
    | "legacy"
    | "trust"
    | "diligence"
    | "humility";
}

export const DEVOTIONALS: Devotional[] = [
  {
    id: "luke-16-10",
    scripture:
      "Whoever can be trusted with very little can also be trusted with much.",
    reference: "Luke 16:10",
    devotional:
      "Today's focus is stewardship. Before asking for more, reflect on how you are managing what is already in your hands.",
    reflection: "Am I spending from emotion, pressure, or purpose?",
    prayer:
      "Lord, help me manage my money with wisdom, discipline, and generosity.",
    theme: "stewardship",
  },
  {
    id: "prov-22-7",
    scripture: "The borrower is slave to the lender.",
    reference: "Proverbs 22:7",
    devotional:
      "Debt has a way of dictating choices. Every dollar you owe is a future decision already made for you. Reclaiming that freedom starts with one intentional payment.",
    reflection: "Where is debt stealing tomorrow's options from me?",
    prayer:
      "Father, give me discipline to chip away at debt and the courage to live within Your provision.",
    theme: "debt",
  },
  {
    id: "prov-13-22",
    scripture: "A good person leaves an inheritance for their children's children.",
    reference: "Proverbs 13:22",
    devotional:
      "Legacy is not just money — it is the values, plans, and order you leave behind. Today, take one small step to make tomorrow easier for those who come after you.",
    reflection: "What would I want my family to find if I were gone tomorrow?",
    prayer:
      "Lord, help me build something that outlasts me — in faith, in finances, and in family.",
    theme: "legacy",
  },
  {
    id: "phil-4-11",
    scripture:
      "I have learned to be content whatever the circumstances.",
    reference: "Philippians 4:11",
    devotional:
      "Contentment is a learned skill, not a feeling. Practice it today by naming three things you already have that money cannot buy.",
    reflection: "What am I chasing that I would not need if I were content?",
    prayer:
      "Jesus, teach me contentment so I can give freely and live lightly.",
    theme: "contentment",
  },
  {
    id: "prov-21-5",
    scripture:
      "The plans of the diligent lead to profit as surely as haste leads to poverty.",
    reference: "Proverbs 21:5",
    devotional:
      "Diligence is faith in motion. Slow, steady plans win — not impulse, not hype. Look at one financial decision today and ask: am I being diligent or just busy?",
    reflection: "Where am I rushing when I should be planning?",
    prayer:
      "Lord, slow me down. Make me diligent in the small things.",
    theme: "diligence",
  },
  {
    id: "2-cor-9-7",
    scripture:
      "Each of you should give what you have decided in your heart to give.",
    reference: "2 Corinthians 9:7",
    devotional:
      "Generosity is decided before the moment, not in it. Set a giving goal today so that when the opportunity comes, your answer is already yes.",
    reflection: "Have I decided in advance what generosity looks like for me?",
    prayer:
      "God, make me a cheerful, prepared giver — not a reluctant one.",
    theme: "generosity",
  },
  {
    id: "prov-3-9",
    scripture: "Honor the Lord with your wealth, with the firstfruits of all your crops.",
    reference: "Proverbs 3:9",
    devotional:
      "Tithing is less about the amount and more about the order. When God gets the first portion, the rest finds its proper place.",
    reflection: "What is getting my firstfruits right now?",
    prayer:
      "Father, let my giving lead my budgeting, not the leftovers.",
    theme: "generosity",
  },
  {
    id: "matt-6-21",
    scripture: "Where your treasure is, there your heart will be also.",
    reference: "Matthew 6:21",
    devotional:
      "Your bank statement is a spiritual document. It quietly reveals what you love most. Look at last week's spending and ask what story it tells about your heart.",
    reflection: "If a stranger read my spending, what would they say I treasure?",
    prayer:
      "Lord, align my treasure with what truly matters in Your kingdom.",
    theme: "wisdom",
  },
  {
    id: "prov-27-23",
    scripture: "Be sure you know the condition of your flocks, give careful attention to your herds.",
    reference: "Proverbs 27:23",
    devotional:
      "Your 'flocks' today are your accounts, bills, and assets. You cannot steward what you do not see. Take five minutes to look at the real numbers.",
    reflection: "When did I last actually look at my whole financial picture?",
    prayer:
      "Lord, give me clear eyes to see what I have and wisdom to manage it.",
    theme: "stewardship",
  },
  {
    id: "ps-127-1",
    scripture:
      "Unless the Lord builds the house, the builders labor in vain.",
    reference: "Psalm 127:1",
    devotional:
      "Hustle without surrender becomes burnout. Invite God into the spreadsheets, the goals, and the plan — He builds what lasts.",
    reflection: "Am I building with God or just for me?",
    prayer:
      "Lord, build my financial house. I refuse to labor in vain.",
    theme: "humility",
  },
  {
    id: "prov-11-25",
    scripture: "A generous person will prosper; whoever refreshes others will be refreshed.",
    reference: "Proverbs 11:25",
    devotional:
      "Generosity is not subtraction; it is multiplication. The more you pour out with open hands, the more capacity God grows in you.",
    reflection: "Whose day could I refresh this week with what I already have?",
    prayer:
      "Lord, make me a refresher — not a hoarder.",
    theme: "generosity",
  },
  {
    id: "luke-14-28",
    scripture:
      "Suppose one of you wants to build a tower. Won't you first sit down and estimate the cost?",
    reference: "Luke 14:28",
    devotional:
      "Jesus expects planning. A budget is not a cage — it is the cost-estimating Jesus called wise. Build the plan, then build the tower.",
    reflection: "What am I trying to 'build' without first counting the cost?",
    prayer:
      "Jesus, make me a planner, not a presumer.",
    theme: "wisdom",
  },
  {
    id: "matt-25-21",
    scripture:
      "Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.",
    reference: "Matthew 25:21",
    devotional:
      "Faithfulness in small budgets builds the muscle for large ones. Today's $5 decision is rehearsal for tomorrow's $50,000 one.",
    reflection: "Am I being faithful with the 'few things' right now?",
    prayer:
      "Lord, help me be faithful in the small so I am ready for the much.",
    theme: "stewardship",
  },
  {
    id: "1-tim-6-10",
    scripture:
      "The love of money is a root of all kinds of evil.",
    reference: "1 Timothy 6:10",
    devotional:
      "Money is a tool. Loving it bends the tool back on the user. Hold it loosely, use it wisely, and let love land on people instead.",
    reflection: "Where is money getting affection that belongs to people or to God?",
    prayer:
      "Father, keep my heart free from the love of money.",
    theme: "humility",
  },
  {
    id: "prov-16-3",
    scripture:
      "Commit to the Lord whatever you do, and He will establish your plans.",
    reference: "Proverbs 16:3",
    devotional:
      "Commitment is a quiet kind of trust. Hand God this month's plan before you measure its results.",
    reflection: "What financial plan have I never actually committed to God?",
    prayer:
      "Lord, I commit my plans to You. Establish what is from You; uproot what is not.",
    theme: "trust",
  },
];

/** Pick a deterministic devotional for a given date. */
export function getDevotionalForDate(date = new Date()): Devotional {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) / 86_400_000;
  const dayOfYear = Math.floor(diff);
  const idx = ((dayOfYear % DEVOTIONALS.length) + DEVOTIONALS.length) % DEVOTIONALS.length;
  return DEVOTIONALS[idx];
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
