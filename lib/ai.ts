import OpenAI from 'openai';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Travel',
  'Education',
  'Other',
] as const;

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  action?: string;
  confidence: number;
}

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    ...(process.env.OPENROUTER_API_KEY
      ? {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Pennywise',
          },
        }
      : {}),
  });
}

function getModel() {
  return process.env.AI_MODEL || (process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');
}

function cleanJson(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}

export async function generateExpenseInsights(expenses: ExpenseRecord[]): Promise<AIInsight[]> {
  const client = getClient();
  if (!client || expenses.length === 0) return [];

  const response = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.35,
    max_tokens: 700,
    messages: [
      {
        role: 'system',
        content: 'You are Pennywise, a thoughtful personal finance coach. Never give investment, tax, legal, or credit advice. Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Analyze these personal expenses. Return a JSON array with at most 3 objects in this exact shape: {"type":"warning|info|success|tip","title":"short title","message":"specific, kind observation using the supplied data","action":"one practical next step","confidence":0.0}. Do not invent transactions.\n\n${JSON.stringify(expenses)}`,
      },
    ],
  });

  const parsed: unknown = JSON.parse(cleanJson(response.choices[0]?.message.content || '[]'));
  if (!Array.isArray(parsed)) return [];

  return parsed.slice(0, 3).map((item, index) => {
    const insight = item as Partial<AIInsight>;
    return {
      id: `insight-${Date.now()}-${index}`,
      type: ['warning', 'info', 'success', 'tip'].includes(insight.type || '') ? insight.type! : 'info',
      title: insight.title?.slice(0, 70) || 'Spending snapshot',
      message: insight.message?.slice(0, 280) || 'Your latest spending is ready to review.',
      action: insight.action?.slice(0, 120),
      confidence: typeof insight.confidence === 'number' ? Math.min(1, Math.max(0, insight.confidence)) : 0.7,
    };
  });
}

export async function categorizeExpense(description: string): Promise<ExpenseCategory> {
  const client = getClient();
  if (!client) return 'Other';
  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0,
    max_tokens: 12,
    messages: [
      { role: 'system', content: `Classify an expense into exactly one of: ${EXPENSE_CATEGORIES.join(', ')}. Reply with only the category.` },
      { role: 'user', content: description.slice(0, 250) },
    ],
  });
  const category = completion.choices[0]?.message.content?.trim() as ExpenseCategory;
  return EXPENSE_CATEGORIES.includes(category) ? category : 'Other';
}

export async function generateAIAnswer(question: string, context: ExpenseRecord[]): Promise<string> {
  const client = getClient();
  if (!client) return 'Connect an AI provider to ask Pennywise about your spending.';
  const completion = await client.chat.completions.create({
    model: getModel(),
    temperature: 0.35,
    max_tokens: 260,
    messages: [
      { role: 'system', content: 'You are Pennywise, a personal expense assistant. Base answers only on provided transactions, be concise and helpful, and avoid investment, tax, legal, or credit advice.' },
      { role: 'user', content: `Question: ${question.slice(0, 300)}\n\nTransactions: ${JSON.stringify(context)}` },
    ],
  });
  return completion.choices[0]?.message.content?.trim() || 'I could not find an answer from your recent transactions.';
}
