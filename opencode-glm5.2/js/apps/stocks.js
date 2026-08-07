// ===================================================================
// Stocks
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons, iconSVG } from "../icons.js";

const stocks = [
  { sym: "AAPL", name: "Apple Inc.", price: 228.54, change: 1.42, pct: 0.62 },
  { sym: "MSFT", name: "Microsoft", price: 412.89, change: -2.15, pct: -0.52 },
  { sym: "GOOGL", name: "Alphabet", price: 168.32, change: 0.87, pct: 0.52 },
  { sym: "AMZN", name: "Amazon", price: 185.44, change: 2.31, pct: 1.26 },
  { sym: "TSLA", name: "Tesla", price: 248.12, change: -4.56, pct: -1.80 },
  { sym: "NVDA", name: "NVIDIA", price: 124.87, change: 5.34, pct: 4.47 },
  { sym: "META", name: "Meta Platforms", price: 512.45, change: 1.12, pct: 0.22 },
  { sym: "NFLX", name: "Netflix", price: 678.90, change: -3.45, pct: -0.51 },
];

const stocksApp = {
  id: "stocks",
  name: "Stocks",
  icon: icons.stocks,
  launch() {
    const existing = windowsForApp("stocks").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "stocks", app: "Stocks", title: "Stocks", width: 720, height: 500, contentClass: "dark-content" });
    win._sel = "AAPL";
    render(win);
  },
  menus: (win) => [{ label: "File", rows: [{ label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) }] }],
};

function render(win) {
  win.content.innerHTML = "";
  const root = el("div", { class: "app" });
  const sidebar = el("div", { class: "sidebar", style: { width: "260px" } });
  sidebar.append(el("div", { class: "sidebar-section", text: "My Symbols" }));
  stocks.forEach((s) => {
    const up = s.change >= 0;
    const item = el("div", { class: "sidebar-item" + (s.sym === win._sel ? " active" : ""), html: `<div style="flex:1"><div style="font-weight:600;font-size:14px">${s.sym}</div><div style="font-size:11px;opacity:0.5">${s.name}</div></div><div style="text-align:right"><div style="font-size:14px">${s.price.toFixed(2)}</div><div style="font-size:11px;color:${up ? "var(--ok)" : "var(--danger)"}">${up ? "+" : ""}${s.pct.toFixed(2)}%</div></div>` });
    item.addEventListener("click", () => { win._sel = s.sym; render(win); });
    sidebar.append(item);
  });

  const main = el("div", { style: { flex: "1", display: "flex", flexDirection: "column", padding: "24px" } });
  const sel = stocks.find((s) => s.sym === win._sel);
  const up = sel.change >= 0;
  main.append(el("div", { html: `<div style="font-size:14px;opacity:0.6">${sel.name}</div><div style="font-size:13px;opacity:0.5">${sel.sym}</div><div style="font-size:42px;font-weight:300;margin:8px 0">${sel.price.toFixed(2)}</div><div style="color:${up ? "var(--ok)" : "var(--danger)"};font-size:16px">${up ? "+" : ""}${sel.change.toFixed(2)} (${up ? "+" : ""}${sel.pct.toFixed(2)}%)</div>` }));

  // chart
  const canvas = el("canvas", { width: 500, height: 180, style: { width: "100%", marginTop: "24px" } });
  drawChart(canvas, up);
  main.append(canvas);

  const range = el("div", { style: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" } });
  ["1D","1W","1M","3M","1Y","ALL"].forEach((r, i) => range.append(el("button", { class: "btn", style: { background: i === 0 ? "rgba(255,255,255,0.15)" : "transparent", fontSize: "12px" }, text: r })));
  main.append(range);

  root.append(sidebar, main);
  win.content.append(root);
}

function drawChart(canvas, up) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const color = up ? "#30d158" : "#ff453a";
  const pts = [];
  let y = h / 2;
  for (let i = 0; i < 60; i++) {
    y += (Math.random() - 0.5) * 18 + (up ? 1.5 : -1.5);
    y = Math.max(20, Math.min(h - 20, y));
    pts.push({ x: (i / 59) * w, y });
  }
  // fill
  ctx.beginPath();
  ctx.moveTo(0, h);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.lineTo(w, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + "55"); grad.addColorStop(1, color + "00");
  ctx.fillStyle = grad; ctx.fill();
  // line
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
}

registerApp(stocksApp);
export default stocksApp;
