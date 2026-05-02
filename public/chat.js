let geminiText = '';
let llamaText = '';
let thinkingAI = null; // 'gemini' | 'llama' | null
let pulse = 0;
let isDone = false;
let running = false;

function setup() {
  createCanvas(600, 200).parent(document.getElementById('sketch-canvas'));
  textWrap(WORD);
}

function draw() {
  noStroke();

  // Gemini panel (left)
  if (thinkingAI === 'gemini') fill(66, 133, 244);
  else fill(180, 210, 255);
  rect(0, 0, 300, 200);

  // Llama panel (right)
  if (thinkingAI === 'llama') fill(234, 105, 29);
  else fill(255, 215, 170);
  rect(300, 0, 300, 200);

  // Divider
  stroke(200);
  line(300, 0, 300, 200);
  noStroke();

  // Pulse circle on the active side
  if (thinkingAI) {
    pulse = (pulse + 0.08) % TWO_PI;
    const r = 16 + sin(pulse) * 5;
    const cx = thinkingAI === 'gemini' ? 150 : 450;
    fill(255, 255, 255, 100);
    circle(cx, 172, r * 2);
  }

  // Names
  fill(255);
  textAlign(CENTER, TOP);
  textSize(15);
  text('Gemini', 150, 10);
  text('Llama 4', 450, 10);

  // Latest message previews
  fill(255);
  textAlign(LEFT, TOP);
  textSize(11);
  if (geminiText) text(geminiText, 10, 34, 278, 120);
  if (llamaText)  text(llamaText,  312, 34, 278, 120);

  // Status
  textAlign(CENTER, BOTTOM);
  textSize(11);
  if (thinkingAI === 'gemini') { fill(255); text('thinking…', 150, 196); }
  if (thinkingAI === 'llama')  { fill(255); text('thinking…', 450, 196); }
  if (isDone) { fill(80);  text('done', 300, 196); }
}

async function startChat() {
  if (running) return;
  running = true;
  isDone = false;
  geminiText = '';
  llamaText = '';
  document.getElementById('transcript').innerHTML = '';

  const topic  = document.getElementById('topic').value;
  const rounds = Math.max(2, parseInt(document.getElementById('rounds').value) || 6);
  let lastText = '';

  for (let i = 0; i < rounds; i++) {
    if (!running) break;

    const isGemini  = i % 2 === 0;
    const myName    = isGemini ? 'Gemini'  : 'Llama 4';
    const otherName = isGemini ? 'Llama 4' : 'Gemini';
    const endpoint  = isGemini ? '/api/gemini-chat' : '/api/cloudflare-chat';

    thinkingAI = isGemini ? 'gemini' : 'llama';

    let prompt = `You are ${myName}, having a conversation with ${otherName} about: "${topic}". `;
    if (lastText) prompt += `They just said: "${lastText}". `;
    prompt += 'Reply in 2-3 sentences.';

    const r = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt })
    });
    const data = await r.json();
    const text = data.error ?? data.text;
    lastText = text;

    if (isGemini) geminiText = text;
    else          llamaText  = text;

    thinkingAI = null;
    addMessage(isGemini ? 'gemini' : 'llama', myName, text);
  }

  isDone = true;
  running = false;
}

function stopChat() {
  running  = false;
  thinkingAI = null;
  isDone   = true;
}

function addMessage(cssClass, name, text) {
  const div = document.createElement('div');
  div.className = `message ${cssClass}`;
  const nameEl = document.createElement('strong');
  nameEl.textContent = name;
  const textEl = document.createElement('p');
  textEl.textContent = text;
  div.appendChild(nameEl);
  div.appendChild(textEl);
  document.getElementById('transcript').appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
}
