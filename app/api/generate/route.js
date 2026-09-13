import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const SCHEMA = `{
  "id": "kebab-case-id",
  "name": "Short friendly topic name",
  "display": "the letters or symbol shown on the big tile (1-3 characters)",
  "sound": "/x/ style sound label, or a short label for non-phonics topics",
  "say": "a spelling a text-to-speech voice can read as the sound itself, e.g. 'buh' for b",
  "mouth": "one sentence about how to make the sound, or a one-sentence explanation",
  "chant": "a short rhyming line a child can chant",
  "position": "start | end",
  "trailName": "name of the group this topic belongs to",
  "words": [ { "word": "cat", "emoji": "🐱" } ],
  "questions": [
    {
      "kind": "letter | word | sound | gap | odd",
      "prompt": "the question, addressed to the child",
      "emoji": "optional emoji to show",
      "showWord": "optional word or masked word to show, e.g. c_t",
      "listen": "optional text to be read aloud as the prompt",
      "options": [ { "label": "cat", "emoji": "🐱" } ],
      "answer": "the label of the correct option",
      "hint": "a gentle nudge"
    }
  ]
}`;

function demoTopic(body) {
  const name = body.topic || 'New sound';
  const id = `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
  return {
    id,
    name,
    display: (body.letters || name.slice(0, 2)).toLowerCase(),
    sound: `/${(body.letters || name.slice(0, 1)).toLowerCase()}/`,
    say: body.letters || name,
    mouth: 'Say the sound slowly and listen to how your mouth moves.',
    chant: `${name}, ${name} — say it with me!`,
    position: 'start',
    trailName: body.trailName || 'Added by a grown-up',
    subject: body.subject || 'phonics',
    words: [
      { word: 'sample', emoji: '🌟' },
      { word: 'demo', emoji: '🎈' },
      { word: 'practice', emoji: '🎯' },
      { word: 'learn', emoji: '📚' },
    ],
    demo: true,
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Send the form as JSON.' }, { status: 400 });
  }

  const { subject = 'phonics', topic, letters = '', age = '5-7', notes = '', count = 5 } = body;

  if (!topic || !topic.trim()) {
    return NextResponse.json({ error: 'Tell me what the topic is first.' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // The app still works without a key — you get a starter topic to edit.
    return NextResponse.json({
      topic: demoTopic(body),
      note: 'No API key is set, so this is a blank starter topic. Add ANTHROPIC_API_KEY to write lessons with AI.',
    });
  }

  const prompt = `You write content for Sound Safari, a phonics and early-learning app for children aged ${age}.

Create ONE topic about: "${topic}"${letters ? ` (letters/graphemes: ${letters})` : ''}
Subject area: ${subject}
${notes ? `Extra instructions from the grown-up: ${notes}` : ''}

Rules:
- Words must be ones a child aged ${age} already knows, and short enough to sound out.
- Every word needs a single fitting emoji. Never repeat an emoji within the topic.
- Write exactly ${count} questions. Vary the kinds. Every question needs 4 options and exactly one correct answer, and "answer" must exactly match one option label.
- For "odd" questions, three options share the target sound and one does not.
- For "gap" questions, showWord is the word with the target letters replaced by underscores.
- Prompts talk directly to the child in warm, simple language. No more than 12 words per prompt.
- Give 6 words in "words".
- Chant should rhyme and be fun to say out loud.

Reply with JSON only. No markdown fences, no commentary. Use exactly this shape:
${SCHEMA}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `The AI service replied with ${res.status}.`, detail: detail.slice(0, 400) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('unparseable');
      parsed = JSON.parse(text.slice(start, end + 1));
    }

    parsed.id =
      parsed.id && String(parsed.id).trim()
        ? `custom-${String(parsed.id).toLowerCase().replace(/[^a-z0-9-]+/g, '-')}`
        : `custom-${Date.now().toString(36)}`;
    parsed.subject = subject;
    parsed.trail = `custom-${subject}`;
    parsed.trailName = parsed.trailName || 'Added by a grown-up';

    return NextResponse.json({ topic: parsed });
  } catch (err) {
    return NextResponse.json(
      { error: 'The lesson came back in a shape we could not read. Try again.' },
      { status: 502 }
    );
  }
}
