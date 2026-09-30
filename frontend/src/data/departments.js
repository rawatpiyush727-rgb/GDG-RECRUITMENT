// GDG On Campus – Department definitions for the 3-D showcase
// Cover images: AI/ML and Web Dev use generated images; others use canvas painters.

// ─── Custom cover painters ────────────────────────────────────────────────────

function paintDSA(ctx, w, h) {
  // Deep dark background with indigo-blue gradient
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0a0e2a');
  bg.addColorStop(1, '#111836');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Draw a glowing binary tree
  ctx.strokeStyle = 'rgba(66,133,244,0.6)';
  ctx.lineWidth = 3;
  function node(x, y, r) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(66,133,244,0.9)');
    g.addColorStop(1, 'rgba(66,133,244,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // Tree structure
  const cx = w / 2, rootY = h * 0.22, gap = 190, dy = 155;
  line(cx, rootY, cx - gap, rootY + dy); line(cx, rootY, cx + gap, rootY + dy);
  line(cx - gap, rootY + dy, cx - gap - 88, rootY + dy * 2); line(cx - gap, rootY + dy, cx - gap + 88, rootY + dy * 2);
  line(cx + gap, rootY + dy, cx + gap - 88, rootY + dy * 2); line(cx + gap, rootY + dy, cx + gap + 88, rootY + dy * 2);
  node(cx, rootY, 28);
  node(cx - gap, rootY + dy, 22); node(cx + gap, rootY + dy, 22);
  node(cx - gap - 88, rootY + dy * 2, 16); node(cx - gap + 88, rootY + dy * 2, 16);
  node(cx + gap - 88, rootY + dy * 2, 16); node(cx + gap + 88, rootY + dy * 2, 16);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 220px Arial Black';
  ctx.textAlign = 'center';
  ctx.fillText('DSA', cx, h * 0.74);

  // Subtitle
  ctx.fillStyle = 'rgba(66,133,244,0.9)';
  ctx.font = '600 52px Arial';
  ctx.fillText('Data Structures & Algorithms', cx, h * 0.83);

  // Bottom label
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 38px Arial';
  ctx.fillText('GDG ON CAMPUS  ·  DEPARTMENT', cx, h * 0.93);
}

function paintOperations(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1a1200');
  bg.addColorStop(1, '#0f0e00');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Gear-like circles
  function gear(x, y, r, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x1 = x + Math.cos(a) * r;
      const y1 = y + Math.sin(a) * r;
      const x2 = x + Math.cos(a) * (r + 30);
      const y2 = y + Math.sin(a) * (r + 30);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Pipeline flow
  ctx.strokeStyle = 'rgba(251,188,4,0.5)';
  ctx.lineWidth = 4;
  const steps = [w * 0.1, w * 0.3, w * 0.5, w * 0.7, w * 0.9];
  const py = h * 0.38;
  steps.forEach((x, i) => {
    const g = ctx.createRadialGradient(x, py, 0, x, py, 35);
    g.addColorStop(0, 'rgba(251,188,4,0.85)');
    g.addColorStop(1, 'rgba(251,188,4,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, py, 35, 0, Math.PI * 2); ctx.fill();
    if (i < steps.length - 1) {
      ctx.beginPath(); ctx.moveTo(x + 38, py); ctx.lineTo(steps[i + 1] - 38, py); ctx.stroke();
    }
  });

  gear(w * 0.2, h * 0.2, 90, '#fbbc04', 0.2);
  gear(w * 0.78, h * 0.15, 65, '#fbbc04', 0.15);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 170px Arial Black';
  ctx.textAlign = 'center';
  ctx.fillText('OPS', w / 2, h * 0.66);

  ctx.fillStyle = 'rgba(251,188,4,0.9)';
  ctx.font = '600 52px Arial';
  ctx.fillText('Operations', w / 2, h * 0.76);

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 38px Arial';
  ctx.fillText('GDG ON CAMPUS  ·  DEPARTMENT', w / 2, h * 0.93);
}

function paintProduction(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1a0a00');
  bg.addColorStop(1, '#0f0500');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // CI/CD pipeline stages
  const stages = ['BUILD', 'TEST', 'DEPLOY', 'LIVE'];
  const stageColors = ['#fbbc04', '#34a853', '#4285f4', '#ea4335'];
  const sx = w * 0.1, ex = w * 0.9, sy = h * 0.28;
  const segW = (ex - sx) / (stages.length - 1);

  ctx.lineWidth = 4;
  stages.forEach((label, i) => {
    const x = sx + i * segW;
    const color = stageColors[i];

    // Connector line
    if (i < stages.length - 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.moveTo(x + 40, sy); ctx.lineTo(x + segW - 40, sy); ctx.stroke();
    }

    // Node glow
    const g = ctx.createRadialGradient(x, sy, 0, x, sy, 50);
    g.addColorStop(0, color + 'cc');
    g.addColorStop(1, color + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, sy, 50, 0, Math.PI * 2); ctx.fill();

    // Label
    ctx.fillStyle = color;
    ctx.font = '700 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, sy + 90);
  });

  // Rocket
  ctx.fillStyle = 'rgba(234,67,53,0.12)';
  ctx.beginPath();
  ctx.moveTo(w / 2, h * 0.08);
  ctx.lineTo(w / 2 + 80, h * 0.22);
  ctx.lineTo(w / 2 - 80, h * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(234,67,53,0.5)';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 148px Arial Black';
  ctx.textAlign = 'center';
  ctx.fillText('PROD', w / 2, h * 0.66);

  ctx.fillStyle = 'rgba(234,67,53,0.9)';
  ctx.font = '600 52px Arial';
  ctx.fillText('Production', w / 2, h * 0.76);

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 38px Arial';
  ctx.fillText('GDG ON CAMPUS  ·  DEPARTMENT', w / 2, h * 0.93);
}

function paintWebDev(ctx, w, h) {
  // Dark navy-green background matching DSA style
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#060f0a');
  bg.addColorStop(1, '#0a1a10');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const GREEN = '52,168,83';

  function glowDot(x, y, r) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${GREEN},0.9)`);
    g.addColorStop(1, `rgba(${GREEN},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function glowLine(x1, y1, x2, y2, alpha) {
    ctx.strokeStyle = `rgba(${GREEN},${alpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Three rows of < / > bracket shapes, decreasing in size
  const rows    = [h * 0.12, h * 0.21, h * 0.30];
  const sizes   = [130, 95, 65];
  const alphas  = [0.55, 0.38, 0.22];

  rows.forEach((y, i) => {
    const s = sizes[i];
    const a = alphas[i];
    // < bracket
    glowLine(cx - s * 0.4, y,          cx - s * 1.4, y + s * 0.5, a);
    glowLine(cx - s * 1.4, y + s * 0.5, cx - s * 0.4, y + s,      a);
    // > bracket
    glowLine(cx + s * 0.4, y,          cx + s * 1.4, y + s * 0.5, a);
    glowLine(cx + s * 1.4, y + s * 0.5, cx + s * 0.4, y + s,      a);
    // / slash
    glowLine(cx + s * 0.12, y, cx - s * 0.12, y + s, a * 0.6);
    glowDot(cx - s * 1.4, y + s * 0.5, 14 - i * 2);
    glowDot(cx + s * 1.4, y + s * 0.5, 14 - i * 2);
  });

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 160px Arial Black';
  ctx.fillText('WEB', cx, h * 0.64);
  ctx.font = '900 155px Arial Black';
  ctx.fillText('DEV', cx, h * 0.755);

  // Subtitle
  ctx.fillStyle = `rgba(${GREEN},0.9)`;
  ctx.font = '600 48px Arial';
  ctx.fillText('Web Development', cx, h * 0.84);

  // Bottom label
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 36px Arial';
  ctx.fillText('GDG ON CAMPUS  ·  DEPARTMENT', cx, h * 0.93);
}

function paintAIML(ctx, w, h) {
  // Deep dark indigo background matching DSA style
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#050a1e');
  bg.addColorStop(1, '#0a1028');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const BLUE = '66,133,244';

  function glowNode(x, y, r) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
    g.addColorStop(0,   `rgba(${BLUE},1)`);
    g.addColorStop(0.35,`rgba(${BLUE},0.4)`);
    g.addColorStop(1,   `rgba(${BLUE},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  function edge(x1, y1, x2, y2, alpha) {
    ctx.strokeStyle = `rgba(${BLUE},${alpha})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Clean 3-layer neural net positioned in the upper portion
  const L = [
    { x: cx - 240, ys: [h*0.09, h*0.18, h*0.27, h*0.36],        r: 12 },
    { x: cx,       ys: [h*0.07, h*0.16, h*0.25, h*0.34, h*0.43], r: 16 },
    { x: cx + 240, ys: [h*0.13, h*0.26, h*0.39],                  r: 12 },
  ];

  // Edges first (behind nodes)
  L.forEach((layer, li) => {
    if (li < L.length - 1) {
      const next = L[li + 1];
      layer.ys.forEach(ny => {
        next.ys.forEach(my => edge(layer.x, ny, next.x, my, 0.15));
      });
    }
  });

  // Nodes
  L.forEach(layer => layer.ys.forEach(y => glowNode(layer.x, y, layer.r)));

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 200px Arial Black';
  ctx.fillText('AI', cx, h * 0.66);
  ctx.font = '900 120px Arial Black';
  ctx.fillText('& ML', cx, h * 0.77);

  // Subtitle
  ctx.fillStyle = `rgba(${BLUE},0.9)`;
  ctx.font = '600 44px Arial';
  ctx.fillText('Artificial Intelligence & ML', cx, h * 0.85);

  // Bottom label
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 36px Arial';
  ctx.fillText('GDG ON CAMPUS  ·  DEPARTMENT', cx, h * 0.93);
}

// ─── Department data ──────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  {
    id: 'dsa',
    title: 'DSA',
    author: 'GDG On Campus',
    year: '2025',
    stars: 5,
    deadline: '2026-12-31T23:59:59Z',
    desc: 'Master Data Structures & Algorithms from arrays and trees to dynamic programming and graph theory. Sharpen your problem-solving skills for competitive programming and technical interviews.',
    spineBg: '#0a0e2a',
    spineInk: '#4285F4',
    spineFont: '900 48px Arial Black',
    backBg: '#0a0e2a',
    backInk: '66,133,244',
    edge: '#1e2a6e',
    front: paintDSA,
    chapters: ['Arrays & Strings', 'Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching', 'Greedy Algorithms', 'Competitive Coding'],
  },
  {
    id: 'web',
    title: 'Web Development',
    author: 'GDG On Campus',
    year: '2025',
    stars: 5,
    deadline: '2026-12-31T23:59:59Z',
    desc: 'Build modern, responsive web applications from fundamentals to full-stack. Explore HTML, CSS, JavaScript, React, Node.js, and the latest frameworks powering the web.',
    spineBg: '#0a1a10',
    spineInk: '#34A853',
    spineFont: '700 38px Arial',
    backBg: '#0a1a10',
    backInk: '52,168,83',
    edge: '#1a4028',
    front: paintWebDev,
    chapters: ['HTML & CSS Fundamentals', 'JavaScript Deep Dive', 'React & Frameworks', 'Backend with Node.js', 'Databases & APIs', 'Deployment & DevOps'],
  },
  {
    id: 'aiml',
    title: 'AI & ML',
    author: 'GDG On Campus',
    year: '2025',
    stars: 5,
    deadline: '2026-12-31T23:59:59Z',
    desc: 'Explore the world of Artificial Intelligence and Machine Learning. From neural networks and transformers to real-world model deployment — build intelligent systems with Google AI tools.',
    spineBg: '#001428',
    spineInk: '#4285F4',
    spineFont: '700 40px Arial',
    backBg: '#001428',
    backInk: '66,133,244',
    edge: '#0a2040',
    front: paintAIML,
    chapters: ['ML Fundamentals', 'Neural Networks', 'Computer Vision', 'NLP & LLMs', 'TensorFlow & PyTorch', 'AI Deployment'],
  },
  {
    id: 'ops',
    title: 'Operations',
    author: 'GDG On Campus',
    year: '2025',
    stars: 5,
    deadline: '2026-12-31T23:59:59Z',
    desc: 'The engine behind every GDG event. Operations manages logistics, community coordination, event planning, and partnership outreach — ensuring everything runs seamlessly.',
    spineBg: '#1a1200',
    spineInk: '#FBBC04',
    spineFont: '700 42px Arial',
    backBg: '#1a1200',
    backInk: '251,188,4',
    edge: '#3d2e00',
    front: paintOperations,
    chapters: ['Event Planning', 'Community Management', 'Partnerships & Outreach', 'Logistics & Coordination', 'Budget & Resources', 'GDG Guidelines'],
  },
  {
    id: 'prod',
    title: 'Production',
    author: 'GDG On Campus',
    year: '2025',
    stars: 5,
    deadline: '2026-12-31T23:59:59Z',
    desc: 'From concept to launch. The Production department handles content creation, video production, photography, social media, and all creative output that amplifies the GDG brand.',
    spineBg: '#1a0500',
    spineInk: '#EA4335',
    spineFont: '700 38px Arial',
    backBg: '#1a0500',
    backInk: '234,67,53',
    edge: '#3d1000',
    front: paintProduction,
    chapters: ['Content Strategy', 'Video Production', 'Photography & Design', 'Social Media', 'Branding & Identity', 'Multimedia Storytelling'],
  },
];
