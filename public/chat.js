const SQ_W = 240;
const SQ_H = 175;

let squares = [];
let thinkingAI = null;
let pulse = 0;
let running = false;

function setup() {
  createCanvas(720, 480).parent(document.getElementById('sketch-canvas'));
  textWrap(WORD);
}

function draw() {
  background(15, 25, 15);

  for (const sq of squares) {
    fill(sq.r, sq.g, sq.b, 210);
    stroke(255, 25);
    strokeWeight(1);
    rect(sq.x, sq.y, SQ_W, SQ_H, 4);
    fill(255);
    noStroke();
    textSize(9);
    textAlign(LEFT, TOP);
    text(sq.text, sq.x + 7, sq.y + 7, SQ_W - 14, SQ_H - 14);
  }

  if (thinkingAI) {
    pulse = (pulse + 0.06) % TWO_PI;
    const sz = 10 + sin(pulse) * 4;
    if (thinkingAI === 'gemini') fill(46, 139, 87);
    else fill(220, 70, 20);
    noStroke();
    circle(width - 18, 18, sz * 2);
    fill(200);
    textSize(10);
    textAlign(RIGHT, CENTER);
    text(thinkingAI === 'gemini' ? 'Gemini…' : 'Llama…', width - 33, 18);
  }
}

async function startChat() {
  if (running) return;
  running = true;
  squares = [];

  const topic  = document.getElementById('topic').value;
  const rounds = Math.max(2, parseInt(document.getElementById('rounds').value) || 6);
  let lastText = '';

  for (let i = 0; i < rounds; i++) {
    if (!running) break;

    const isGemini = i % 2 === 0;
    const endpoint = isGemini ? '/api/gemini-chat' : '/api/cloudflare-chat';
    thinkingAI = isGemini ? 'gemini' : 'llama';

    let prompt = isGemini
      ? `You are a passionate lover of trees, forests, and all of nature. You cherish every leaf, root, and creature. The topic is: "${topic}". `
      : `You are a chaotic force who wants to burn everything down, especially forests and nature. You revel in fire and ash. The topic is: "${topic}". `;

    if (lastText) prompt += `The other AI just said: "${lastText}". `;
    prompt += 'Respond in character in 2-3 sentences.';

    const r = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, maxTokens: 200 })
    });
    const data = await r.json();
    const text = data.error ?? data.text;
    lastText = text;

    squares.push({
      x: random(0, width - SQ_W),
      y: random(0, height - SQ_H),
      r: isGemini ? 46  : 220,
      g: isGemini ? 139 : 70,
      b: isGemini ? 87  : 20,
      text
    });

    thinkingAI = null;
  }

  running = false;
}

function stopChat() {
  running    = false;
  thinkingAI = null;
}
