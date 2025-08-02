import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<Response> {
  try {
    const { summary } = await req.json();

    if (!summary || summary.trim().length === 0) {
      return NextResponse.json({ error: 'Summary is missing or empty' }, { status: 400 });
    }

    const prompt = `
You are a smart quiz generator.

Based on the following summary, generate exactly 3 multiple-choice questions in this exact JSON format:

[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "should be a complete Option from above"
  }
]

Answers should be exact same word as one of the options.
Do not include any extra text or markdown. Return only the JSON array.

Summary:
${summary}
`.trim();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    console.log('📋 Generated Quiz:', content);

    return NextResponse.json({ quiz: content });
  } catch (err) {
    console.error('❌ Quiz generation error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
