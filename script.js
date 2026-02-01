// --- 0. PRELOADER LOGIC ---
window.addEventListener("load", () => {
    setTimeout(() => {
        document.body.classList.remove('loading-state');
        document.body.classList.add('body-loaded');
    }, 2800);
});

// --- 0.5 DARK MODE TOGGLE ---
const toggleBtn = document.getElementById('themeToggle');
const body = document.body;

// Check for saved preference
if (localStorage.getItem('theme') === 'dark') {
    body.setAttribute('data-theme', 'dark');
    toggleBtn.innerText = '☀️';
}

toggleBtn.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        toggleBtn.innerText = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        toggleBtn.innerText = '☀️';
        localStorage.setItem('theme', 'dark');
    }
});

// --- 0.6 DISABLE RIGHT-CLICK ON PDF ---
document.addEventListener('contextmenu', event => {
    if (event.target.closest('#securePDF')) {
        event.preventDefault();
        alert("Protected Document: Download Disabled");
    }
});

// --- 1. NEW FRUIT SCANNER LOGIC (Specific to YOLO Classes) ---
const trainedFruits = [
    { name: 'Apple', icon: '🍎' }, { name: 'Watermelon', icon: '🍉' },
    { name: 'Mango', icon: '🥭' }, { name: 'Strawberry', icon: '🍓' },
    { name: 'Banana', icon: '🍌' }, { name: 'Orange', icon: '🍊' },
    { name: 'Pineapple', icon: '🍍' }, { name: 'Grape', icon: '🍇' }
];
let totalCount = 0;
let fruitCounts = {};

function addFruit() {
    totalCount++;
    const fruit = trainedFruits[Math.floor(Math.random() * trainedFruits.length)];
    if (!fruitCounts[fruit.name]) { fruitCounts[fruit.name] = 0; }
    fruitCounts[fruit.name]++;
    const el = document.createElement('div');
    el.classList.add('fruit-icon');
    el.innerText = fruit.icon;
    el.style.top = Math.random() * 80 + 10 + "%";
    el.style.left = Math.random() * 80 + 10 + "%";
    document.getElementById('scannerArea').appendChild(el);
    updateResultsUI();
}

function updateResultsUI() {
    document.getElementById('totalDisplay').innerText = totalCount;
    const listContainer = document.getElementById('breakdownList');
    listContainer.innerHTML = '';
    const sortedKeys = Object.keys(fruitCounts).sort();
    sortedKeys.forEach(key => {
        const count = fruitCounts[key];
        const icon = trainedFruits.find(f => f.name === key).icon;
        const item = document.createElement('div');
        item.className = 'breakdown-item';
        item.innerHTML = `<span>${icon} ${key}</span><span style="font-weight:700; color:var(--primary);">${count}</span>`;
        listContainer.appendChild(item);
    });
}

function resetCount() {
    totalCount = 0;
    fruitCounts = {};
    document.getElementById('totalDisplay').innerText = "0";
    document.getElementById('breakdownList').innerHTML = '<div style="grid-column: span 2; text-align: center; font-size: 0.8rem; opacity: 0.6; margin-top: 20px;">Waiting for input...</div>';
    document.querySelectorAll('.fruit-icon').forEach(e => e.remove());
}

// --- 2. INTERACTIVE F1 GRAPH GENERATOR ---
const f1Container = document.getElementById('f1GraphContainer');
const tooltip = document.getElementById('graphTooltip');
const tooltipLabel = tooltip.querySelector('.tooltip-label');
const tooltipScore = tooltip.querySelector('.tooltip-score');

// Data extracted roughly from image_78720c.png
const modelData = [
    { name: 'Apple', color: '#2196F3', f1: 0.88, drop: 0.85 },
    { name: 'Watermelon', color: '#FF9800', f1: 0.92, drop: 0.88 },
    { name: 'Mango', color: '#4CAF50', f1: 0.97, drop: 0.90 }, // Highest curve
    { name: 'Strawberry', color: '#F44336', f1: 0.92, drop: 0.82 },
    { name: 'Banana', color: '#9C27B0', f1: 0.93, drop: 0.85 },
    { name: 'Orange', color: '#795548', f1: 0.91, drop: 0.88 },
    { name: 'Pineapple', color: '#E91E63', f1: 0.79, drop: 0.65 }, // Lowest curve
    { name: 'Grape', color: '#9E9E9E', f1: 0.85, drop: 0.75 },
    { name: 'ALL CLASSES', color: '#0047AB', f1: 0.89, drop: 0.82, id: 'all' }
];

function createF1Graph() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 600 400");
    svg.setAttribute("preserveAspectRatio", "none");
    const axisPath = document.createElementNS(ns, "path");
    axisPath.setAttribute("d", "M50,350 L550,350 M50,350 L50,50");
    axisPath.setAttribute("class", "axis-line");
    svg.appendChild(axisPath);
    const xLabel = document.createElementNS(ns, "text");
    xLabel.setAttribute("x", "300"); xLabel.setAttribute("y", "380");
    xLabel.setAttribute("text-anchor", "middle"); xLabel.setAttribute("class", "axis-text");
    xLabel.textContent = "CONFIDENCE";
    svg.appendChild(xLabel);
    const yLabel = document.createElementNS(ns, "text");
    yLabel.setAttribute("x", "20"); yLabel.setAttribute("y", "200");
    yLabel.setAttribute("text-anchor", "middle"); yLabel.setAttribute("transform", "rotate(-90 20,200)");
    yLabel.setAttribute("class", "axis-text");
    yLabel.textContent = "F1 SCORE";
    svg.appendChild(yLabel);

    modelData.forEach(item => {
        const path = document.createElementNS(ns, "path");
        let d = "M50," + (350 - (item.f1 * 300));
        for (let i = 0; i <= 100; i++) {
            let conf = i / 100;
            let x = 50 + (conf * 500);
            let currentF1 = item.f1;
            if (conf > item.drop) {
                let diff = conf - item.drop;
                // Sharper drop off logic
                currentF1 = item.f1 * (1 - Math.pow(diff * (1 / (1 - item.drop)), 2));
                if (currentF1 < 0) currentF1 = 0;
            }
            let y = 350 - (currentF1 * 300);
            d += ` L${x},${y}`;
        }
        path.setAttribute("d", d);
        path.setAttribute("class", "curve-path");
        path.setAttribute("stroke", item.color);
        if (item.id) path.setAttribute("data-id", item.id);
        path.addEventListener('mouseover', () => {
            tooltip.style.opacity = 1;
            tooltipLabel.innerText = item.name;
            tooltipLabel.style.color = item.color;
            tooltipScore.innerText = item.f1.toFixed(2);
        });
        path.addEventListener('mouseout', () => { tooltip.style.opacity = 0; });
        svg.appendChild(path);
    });
    f1Container.appendChild(svg);
}
createF1Graph();

// --- 3. LOSS GRAPH GENERATORS ---
function createLossGraph(containerId, dataPoints, maxY, colorClass, yLabelText) {
    const container = document.getElementById(containerId);

    // 1. Create a specific tooltip for this graph
    const tip = document.createElement('div');
    tip.className = 'graph-tooltip';
    tip.style.position = 'absolute'; tip.style.top = '10px'; tip.style.right = '10px'; tip.style.opacity = '0'; tip.style.transition = 'opacity 0.2s';
    const finalVal = dataPoints[dataPoints.length - 1].y.toFixed(3);
    tip.innerHTML = `<div class="tooltip-label" style="font-size:0.7rem">Final Loss</div><div class="tooltip-score">${finalVal}</div>`;

    // 2. Create SVG
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 400 300");
    svg.setAttribute("preserveAspectRatio", "none");

    const axisPath = document.createElementNS(ns, "path");
    axisPath.setAttribute("d", "M40,260 L360,260 M40,260 L40,40");
    axisPath.setAttribute("class", "axis-line");
    svg.appendChild(axisPath);

    const xLabel = document.createElementNS(ns, "text");
    xLabel.setAttribute("x", "200"); xLabel.setAttribute("y", "290");
    xLabel.setAttribute("text-anchor", "middle"); xLabel.setAttribute("class", "axis-text");
    xLabel.textContent = "EPOCHS (0-200)";
    svg.appendChild(xLabel);

    const yLabel = document.createElementNS(ns, "text");
    yLabel.setAttribute("x", "15"); yLabel.setAttribute("y", "150");
    yLabel.setAttribute("text-anchor", "middle");
    yLabel.setAttribute("transform", "rotate(-90 15,150)");
    yLabel.setAttribute("class", "axis-text");
    yLabel.textContent = yLabelText;
    svg.appendChild(yLabel);

    const path = document.createElementNS(ns, "path");
    let d = "";

    // Map data points to SVG coordinates
    dataPoints.forEach((point, index) => {
        let x = 40 + ((point.x / 200) * 320); // Scale x to width
        let y = 260 - ((point.y / maxY) * 220); // Scale y to height
        if (index === 0) d += `M${x},${y}`;
        else d += ` L${x},${y}`;
    });

    path.setAttribute("d", d);
    path.setAttribute("class", "loss-path " + colorClass);

    // 3. Add Interaction
    // We increase stroke width on hover and show tooltip
    path.style.cursor = 'pointer';
    path.style.transition = 'stroke-width 0.2s';

    path.addEventListener('mouseover', () => {
        tip.style.opacity = '1';
        path.style.strokeWidth = '5';
    });
    path.addEventListener('mouseout', () => {
        tip.style.opacity = '0';
        path.style.strokeWidth = '3';
    });

    svg.appendChild(path);
    container.appendChild(tip);
    container.appendChild(svg);
}

// Data approximation from image_f49a32.png
const boxLossData = [
    { x: 0, y: 1.1 }, { x: 10, y: 0.95 }, { x: 20, y: 0.88 }, { x: 50, y: 0.78 },
    { x: 100, y: 0.68 }, { x: 150, y: 0.62 }, { x: 180, y: 0.58 }, { x: 200, y: 0.54 }
];

const clsLossData = [
    { x: 0, y: 1.75 }, { x: 10, y: 0.8 }, { x: 30, y: 0.6 }, { x: 50, y: 0.5 },
    { x: 100, y: 0.42 }, { x: 150, y: 0.38 }, { x: 180, y: 0.35 }, { x: 200, y: 0.28 }
];

createLossGraph("boxLossContainer", boxLossData, 1.2, "box", "LOSS VALUE");
createLossGraph("clsLossContainer", clsLossData, 1.8, "cls", "LOSS VALUE");

// --- 4. SCROLL REVEAL ANIMATIONS ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
});
document.querySelectorAll('.roadmap-card, .glass-panel, .video-box, .loss-graph-box').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

// --- 5. PDF SWITCHER LOGIC ---
const pdfFiles = [
    "Final_Report.pdf",
    "Documents/Model_Training.pdf",
    "Documents/Model_Comparison.pdf",
    "Documents/Tensor_comparison.pdf",
    "Documents/Offline_chatbot.pdf"
];

function switchPDF(index) {
    const viewer = document.getElementById('pdfViewer');
    const buttons = document.querySelectorAll('.glass-btn');
    const activeBtn = buttons[index];

    // 1. Try to get the specific file from the button's href
    // 2. Fallback to the array if href is missing/empty
    let targetFile = activeBtn.getAttribute('href');

    if (!targetFile || targetFile === "") {
        targetFile = pdfFiles[index];
    }

    // Update PDF source if we have a valid target
    if (targetFile) {
        viewer.src = targetFile + "#toolbar=0&navpanes=0&scrollbar=0";
    }

    // Update active button state
    buttons.forEach((btn, idx) => {
        if (idx === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
