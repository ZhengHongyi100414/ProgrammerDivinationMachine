// 词库数据
let wordbank = null;
let prophecyHistory = [];

// DeepSeek美化API
async function beautifyWithDeepSeek(text) {
    const apiKey = 'sk-d8078214ffcc4e499fc26017abac534c';// 在此填写你的DeepSeek API Key
    if (!apiKey) {
        // 未填写API Key时直接返回原文
        return text;
    }
    const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: '你是一个善于美化和纠正语法的预言大师，请优化并修正下面的预言，使其更有仪式感和幽默感，若有语法错误请修正。' },
                { role: 'user', content: text }
            ],
            stream: false
        })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || text;
}

// 加载词库
fetch('wordbank.json')
    .then(res => res.json())
    .then(data => { wordbank = data; })
    .catch(() => { alert('词库加载失败！'); });

// DOM元素
const btn = document.getElementById('prophecy-btn');
const card = document.getElementById('prophecy-card');
const output = document.getElementById('prophecy-output');
const shareBtn = document.getElementById('share-btn');
const retryBtn = document.getElementById('retry-btn');
const asciiTitle = document.getElementById('ascii-title');
const matrixRain = document.getElementById('matrix-rain');

// 打字机音效（8-bit）
function beep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = 880 + Math.random() * 120;
        g.gain.value = 0.08;
        o.connect(g); g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.04);
        setTimeout(() => ctx.close(), 80);
    } catch (e) { }
}

// 随机抽取
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 生成预言
function generateProphecy() {
    if (!wordbank) return '词库未加载';
    const mystical = pick(wordbank.mysticalForces);
    const target = pick(wordbank.targets);
    const event = pick(wordbank.events);
    const attitude = pick(wordbank.attitudes);
    const item = pick(wordbank.items);
    return `${mystical} 预示 ${target} 将在 ${pick(["凌晨三点", "下一个迭代", "周五部署时", "代码评审期间", "你最不想的时候"])} ${event}。建议 ${attitude}，并携带 ${item}。`;
}

// 打字机动画（支持markdown渲染）
async function typeOutMarkdown(text, el) {
    el.innerHTML = '';
    let buffer = '';
    for (let i = 0; i < text.length; i++) {
        buffer += text[i];
        // 渲染markdown为HTML
        el.innerHTML = marked.parse(buffer);
        if (text[i] !== '\n' && text[i] !== ' ') beep();
        await new Promise(r => setTimeout(r, 28 + Math.random() * 22));
    }
}

// 显示咖啡杯彩蛋
function showCoffeeCup() {
    const cup = document.createElement('div');
    cup.className = 'coffee-cup';
    cup.innerHTML = `<svg viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="40" rx="14" ry="4" fill="#b967ff"/><rect x="10" y="16" width="28" height="18" rx="9" fill="#fff" stroke="#b967ff" stroke-width="2"/><rect x="34" y="20" width="6" height="10" rx="3" fill="#fff" stroke="#b967ff" stroke-width="2"/><ellipse cx="24" cy="16" rx="14" ry="6" fill="#fff" stroke="#b967ff" stroke-width="2"/></svg>`;
    // 随机边缘位置
    const side = Math.random() > 0.5 ? 'left' : 'right';
    cup.style[side] = '12px';
    cup.style.top = `${Math.random() * 60 + 10}%`;
    document.body.appendChild(cup);
    setTimeout(() => cup.remove(), 3200);
}

// 生成并展示预言
async function showProphecy() {
    card.classList.remove('hidden');
    let prophecy = generateProphecy();
    prophecy = await beautifyWithDeepSeek(prophecy); // DeepSeek美化
    prophecyHistory.push(prophecy);
    output.innerHTML = '';
    await typeOutMarkdown(prophecy, output);
    // 彩蛋：咖啡
    if (prophecy.includes('咖啡')) showCoffeeCup();
}

// 事件绑定
btn.onclick = showProphecy;
retryBtn.onclick = showProphecy;

// 分享功能
shareBtn.onclick = async () => {
    const text = output.textContent;
    if (!text) return;
    // 尝试复制文本
    try {
        await navigator.clipboard.writeText(`【程序员占卜机】\n${text}`);
        shareBtn.textContent = '已复制!';
        setTimeout(() => shareBtn.textContent = '分享', 1200);
    } catch {
        alert('复制失败，请手动复制');
    }
};

// 标题点击彩蛋：黑客帝国雨
let titleClicks = 0, rainActive = false;
asciiTitle.onclick = () => {
    titleClicks++;
    asciiTitle.classList.add('pixel-shake');
    setTimeout(() => asciiTitle.classList.remove('pixel-shake'), 220);
    if (titleClicks >= 3 && !rainActive) {
        rainActive = true;
        matrixRain.classList.remove('hidden');
        startMatrixRain();
        setTimeout(() => {
            matrixRain.classList.add('hidden');
            rainActive = false;
            titleClicks = 0;
        }, 6000);
    }
};

// 黑客帝国雨特效
function startMatrixRain() {
    const canvas = matrixRain;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    const fontSize = 22;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let frame = 0;
    function draw() {
        ctx.fillStyle = 'rgba(18,18,18,0.18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillStyle = '#00ff41';
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (Math.random() > 0.975 || drops[i] * fontSize > canvas.height) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        frame++;
        if (!matrixRain.classList.contains('hidden')) {
            requestAnimationFrame(draw);
        }
    }
    draw();
}

// 窗口大小变化时调整雨特效
window.addEventListener('resize', () => {
    if (!matrixRain.classList.contains('hidden')) startMatrixRain();
}); 