// ===================================================================
// Calculator
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { icons } from "../icons.js";

const calc = {
  id: "calculator",
  name: "Calculator",
  icon: icons.calculator,
  launch() {
    const existing = windowsForApp("calculator").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "calculator", app: "Calculator", title: "Calculator", width: 300, height: 460, resizable: false, contentClass: "dark-content" });
    renderCalc(win);
  },
  menus: (win) => [
    { label: "View", rows: [
      { label: "Basic", checked: true, action: () => {} },
      { label: "Scientific", disabled: true },
      { label: "Programmer", disabled: true },
    ]},
    { label: "Edit", rows: [{ label: "Copy", shortcut: "⌘C", action: () => { navigator.clipboard?.writeText(win._display || "0"); } }, { label: "Paste", shortcut: "⌘V", action: () => { navigator.clipboard?.readText().then(t => { win._display = String(parseFloat(t)||0); renderDisplay(win); }); } }] },
  ],
};

function renderCalc(win) {
  let display = "0";
  let prev = null;
  let op = null;
  let reset = false;
  let expr = "";
  win._display = display;

  const root = el("div", { class: "app", style: { background: "#1c1c1e", color: "#fff" } });
  const screen = el("div", { style: { padding: "20px 18px 10px", textAlign: "right" } });
  const exprEl = el("div", { style: { fontSize: "13px", opacity: "0.5", minHeight: "18px" }, text: "" });
  const dispEl = el("div", { style: { fontSize: "52px", fontWeight: "300", overflow: "hidden" }, text: display });
  screen.append(exprEl, dispEl);
  root.append(screen);

  const pad = el("div", { style: { flex: "1", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", padding: "1px", background: "#2c2c2e" } });
  const keys = [
    ["AC", "fn", "%"], ["AC", "±", "%", "÷"],
  ];
  // Layout (rows)
  const layout = [
    { l: "AC", t: "fn" }, { l: "±", t: "fn" }, { l: "%", t: "fn" }, { l: "÷", t: "op" },
    { l: "7" }, { l: "8" }, { l: "9" }, { l: "×", t: "op" },
    { l: "4" }, { l: "5" }, { l: "6" }, { l: "−", t: "op" },
    { l: "1" }, { l: "2" }, { l: "3" }, { l: "+", t: "op" },
    { l: "0", wide: true }, { l: "." }, { l: "=", t: "op" },
  ];
  function colorFor(k) {
    if (k.t === "op") return ["#ff9f0a", "#1c1c1e"];
    if (k.t === "fn") return ["#a5a5a5", "#000"];
    return ["#333335", "#fff"];
  }
  layout.forEach((k) => {
    const btn = el("button", { text: k.l, style: { gridColumn: k.wide ? "span 2" : "", background: colorFor(k)[0], color: colorFor(k)[1], fontSize: "24px", border: "none", cursor: "pointer", transition: "filter 0.08s" } });
    btn.addEventListener("mousedown", () => btn.style.filter = "brightness(1.3)");
    btn.addEventListener("mouseup", () => btn.style.filter = "");
    btn.addEventListener("mouseleave", () => btn.style.filter = "");
    btn.addEventListener("click", () => press(k.l));
    pad.append(btn);
  });
  root.append(pad);
  win.content.innerHTML = "";
  win.content.append(root);

  function renderDisplay() {
    let d = display;
    if (d.length > 9 && !d.includes("e")) {
      const n = parseFloat(d);
      d = Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0) ? n.toExponential(3) : n.toPrecision(9);
    }
    dispEl.textContent = d;
    exprEl.textContent = expr;
    win._display = display;
  }

  function compute(a, b, o) {
    a = parseFloat(a); b = parseFloat(b);
    switch (o) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? "Error" : a / b;
      case "%": return a % b;
    }
  }

  function press(key) {
    if (display === "Error" && key !== "AC") { display = "0"; }
    if (/[0-9]/.test(key)) {
      if (reset || display === "0") { display = key; reset = false; }
      else display += key;
    } else if (key === ".") {
      if (reset) { display = "0."; reset = false; }
      else if (!display.includes(".")) display += ".";
    } else if (key === "AC") {
      display = "0"; prev = null; op = null; expr = ""; reset = false;
    } else if (key === "±") {
      display = String(-parseFloat(display));
    } else if (key === "%") {
      display = String(parseFloat(display) / 100);
    } else if (["+", "−", "×", "÷"].includes(key)) {
      if (op && !reset) {
        const r = compute(prev, display, op);
        prev = String(r); display = String(r);
      } else { prev = display; }
      op = key; expr = `${prev} ${key}`; reset = true;
    } else if (key === "=") {
      if (op && prev !== null) {
        const r = compute(prev, display, op);
        expr = `${prev} ${op} ${display} =`;
        display = String(r); prev = null; op = null; reset = true;
      }
    }
    renderDisplay();
  }

  renderDisplay();
}

registerApp(calc);
export default calc;
