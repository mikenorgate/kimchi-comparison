// ===================================================================
// Control Center
// ===================================================================
import { $, el, state, setState, on, emit } from "./state.js";
import { icons, iconSVG } from "../icons.js";

let open = false;

export function openControlCenter() {
  if (open) return closeControlCenter();
  open = true;
  render();
  const cc = $("#control-center");
  cc.classList.remove("hidden");
  setTimeout(() => {
    document.addEventListener("click", outsideClose, { once: true });
  }, 0);
}

function outsideClose(e) {
  if (!e.target.closest("#control-center")) closeControlCenter();
  else setTimeout(() => document.addEventListener("click", outsideClose, { once: true }), 0);
}

export function closeControlCenter() {
  open = false;
  $("#control-center").classList.add("hidden");
}

function render() {
  const cc = $("#control-center");
  cc.innerHTML = "";

  const toggle = (id, iconName, label, sub) => {
    const t = el("div", { class: "cc-bigtoggle" + (state[id] ? " active" : "") });
    t.innerHTML = `<div class="cc-icon">${iconSVG(iconName, 16)}</div><div><div class="cc-label">${label}</div><div class="cc-sub">${sub}</div></div>`;
    t.addEventListener("click", () => { setState({ [id]: !state[id] }); rerender(); });
    return t;
  };

  const tile = (iconName, label, sub, activeId) => {
    const t = el("div", { class: "cc-tile row" });
    t.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><div class="cc-icon" style="background:${activeId && state[activeId] ? "var(--accent)" : "rgba(255,255,255,0.15)"}">${iconSVG(iconName, 16)}</div><div><div class="cc-label">${label}</div><div class="cc-sub">${sub}</div></div></div>`;
    return t;
  };

  // Row 1: Wi-Fi, Bluetooth
  cc.append(wifiTile());
  cc.append(bluetoothTile());

  // Row 2: AirDrop, Focus
  cc.append(toggle("airdrop", "airplane", "AirDrop", state.airdrop ? "Everyone" : "Off"));
  cc.append(focusTile());

  // Row 3: brightness slider (full width)
  cc.append(brightnessTile());
  cc.append(soundTile());

  // Row 4: stage manager / dark mode
  cc.append(themeTile());
  cc.append(stageTile());
}

function wifiTile() {
  const t = el("div", { class: "cc-tile row" });
  t.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><div class="cc-icon" style="background:${state.wifi ? "var(--accent)" : "rgba(255,255,255,0.15)"}">${iconSVG("wifi", 16)}</div><div><div class="cc-label">Wi-Fi</div><div class="cc-sub">${state.wifi ? "Home Network" : "Off"}</div></div></div>`;
  t.addEventListener("click", () => { setState({ wifi: !state.wifi }); rerender(); });
  return t;
}
function bluetoothTile() {
  const t = el("div", { class: "cc-tile row" });
  t.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><div class="cc-icon" style="background:${state.bluetooth ? "var(--accent)" : "rgba(255,255,255,0.15)"}">${iconSVG("bluetooth", 16)}</div><div><div class="cc-label">Bluetooth</div><div class="cc-sub">${state.bluetooth ? "On" : "Off"}</div></div></div>`;
  t.addEventListener("click", () => { setState({ bluetooth: !state.bluetooth }); rerender(); });
  return t;
}
function focusTile() {
  const t = el("div", { class: "cc-tile row" });
  const on = state.dnd;
  t.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><div class="cc-icon" style="background:${on ? "var(--accent)" : "rgba(255,255,255,0.15)"}">${iconSVG("moon", 16)}</div><div><div class="cc-label">Focus</div><div class="cc-sub">${on ? "Do Not Disturb" : "Off"}</div></div></div>`;
  t.addEventListener("click", () => { setState({ dnd: !state.dnd }); rerender(); });
  return t;
}
function brightnessTile() {
  const t = el("div", { class: "cc-tile full" });
  t.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><div class="cc-icon">${iconSVG("sun", 16)}</div><div class="cc-label">Display</div></div>`;
  const slider = el("input", { type: "range", class: "cc-slider bright", min: "10", max: "100", value: state.brightness });
  slider.addEventListener("input", () => setState({ brightness: +slider.value }));
  t.append(slider);
  return t;
}
function soundTile() {
  const t = el("div", { class: "cc-tile full" });
  t.innerHTML = `<div style="display:flex;align-items:center;gap:8px"><div class="cc-icon">${iconSVG("volume", 16)}</div><div class="cc-label">Sound</div></div>`;
  const slider = el("input", { type: "range", class: "cc-slider vol", min: "0", max: "100", value: state.volume });
  slider.addEventListener("input", () => setState({ volume: +slider.value }));
  t.append(slider);
  return t;
}
function themeTile() {
  const t = el("div", { class: "cc-tile row" });
  const dark = state.theme === "dark";
  t.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><div class="cc-icon">${iconSVG(dark ? "moon" : "sun", 16)}</div><div><div class="cc-label">${dark ? "Dark" : "Light"}</div><div class="cc-sub">Appearance</div></div></div>`;
  t.addEventListener("click", () => { setState({ theme: dark ? "light" : "dark" }); emit("themechange"); rerender(); });
  return t;
}
function stageTile() {
  const t = el("div", { class: "cc-tile row" });
  const on = state.stageManager;
  t.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><div class="cc-icon" style="background:${on ? "var(--accent)" : "rgba(255,255,255,0.15)"}">${iconSVG("grid", 16)}</div><div><div class="cc-label">Stage Mgr</div><div class="cc-sub">${on ? "On" : "Off"}</div></div></div>`;
  t.addEventListener("click", () => { setState({ stageManager: !state.stageManager }); rerender(); });
  return t;
}

function rerender() { if (open) render(); }
on("change", rerender);
