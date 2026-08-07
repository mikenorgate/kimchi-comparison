// ===================================================================
// Terminal — fake shell with real virtual-FS commands
// ===================================================================
import { registerApp } from "./registry.js";
import { createWindow, windowsForApp, focusWindow } from "../core/windowManager.js";
import { el, $ } from "../core/state.js";
import { fs } from "../core/filesystem.js";
import { icons } from "../icons.js";

const term = {
  id: "terminal",
  name: "Terminal",
  icon: icons.terminal,
  launch() {
    const existing = windowsForApp("terminal").filter((w) => !w.minimized);
    if (existing.length) { focusWindow(existing[0].id); return; }
    const win = createWindow({ appId: "terminal", app: "Terminal", title: "mike@macbook — -zsh", width: 680, height: 420, contentClass: "dark-content", resizable: true });
    renderTerminal(win);
  },
  menus: (win) => [
    { label: "Shell", rows: [
      { label: "New Window", shortcut: "⌘N", action: () => term.launch() },
      { label: "Close", shortcut: "⌘W", action: () => import("../core/windowManager.js").then(m=>m.closeWindow(win.id)) },
      { separator: true },
      { label: "Clear Screen", shortcut: "⌘K", action: () => { win._output.innerHTML = ""; win._cwd = "/"; prompt(); } },
    ]},
    { label: "Edit", rows: [{ label: "Copy", shortcut: "⌘C", action: () => { const s = window.getSelection().toString(); navigator.clipboard?.writeText(s); } }, { label: "Paste", shortcut: "⌘V", action: () => navigator.clipboard?.readText().then(t => { win._input.value += t; }) }] },
  ],
};

function renderTerminal(win) {
  win._cwd = "/";
  win.content.innerHTML = "";
  win.content.style.background = "#1a1a1c";
  win.content.style.color = "#e8e8ea";
  const root = el("div", { style: { padding: "10px 12px", fontFamily: "'SF Mono', Menlo, Monaco, Consolas, monospace", fontSize: "13px", height: "100%", overflow: "auto", lineHeight: "1.4" } });
  win._output = el("div");
  const inputLine = el("div", { style: { display: "flex", gap: "6px", alignItems: "baseline" } });
  const promptSpan = el("span", { style: { color: "#30d158", whiteSpace: "pre" } });
  const inputWrap = el("span", { style: { flex: "1" } });
  const input = el("input", { style: { width: "100%", background: "transparent", border: "none", outline: "none", color: "#e8e8ea", fontFamily: "inherit", fontSize: "inherit", caretColor: "#fff" }, spellcheck: "false", autocomplete: "off" });
  inputWrap.append(input);
  inputLine.append(promptSpan, inputWrap);
  root.append(win._output, inputLine);
  win.content.append(root);
  win._input = input;
  win._promptSpan = promptSpan;

  function prompt() {
    const cwd = win._cwd === "/" ? "/" : win._cwd.split("/").pop();
    win._promptSpan.textContent = `mike@macbook ${cwd} % `;
  }
  win._prompt = prompt;

  printTo(win, "Last login: " + new Date().toLocaleString() + " on ttys000\n");
  printTo(win, "Welcome to macOS Tahoe Terminal. Type 'help' for commands.\n\n");
  prompt();

  const history = [];
  let hIdx = -1;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const cmd = input.value;
      print(win._promptSpan.textContent + cmd + "\n");
      history.unshift(cmd);
      hIdx = -1;
      input.value = "";
      runCommand(cmd.trim(), win);
      prompt();
      root.scrollTop = root.scrollHeight;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history[hIdx + 1] !== undefined) { hIdx++; input.value = history[hIdx]; }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx > 0) { hIdx--; input.value = history[hIdx]; }
      else { hIdx = -1; input.value = ""; }
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault(); win._output.innerHTML = ""; prompt();
    }
  });

  win.content.addEventListener("click", () => input.focus());
  setTimeout(() => input.focus(), 50);
}

function printTo(win, text, color) {
  const span = el("div", { style: color ? { color } : {}, text });
  win._output.append(span);
}

function runCommand(cmd, win) {
  if (!cmd) return;
  const [name, ...args] = cmd.split(/\s+/);
  const out = (t, c) => printTo(win, t, c);
  try {
    switch (name) {
      case "help":
        out("Available commands:");
        out("  ls [path]        list directory contents");
        out("  cd <path>        change directory");
        out("  pwd              print working directory");
        out("  cat <file>       print file contents");
        out("  mkdir <name>     create a directory");
        out("  touch <name>     create an empty file");
        out("  rm <name>        remove a file");
        out("  echo <text>      print text");
        out("  date             show current date");
        out("  whoami           print current user");
        out("  clear            clear the screen");
        out("  open <app>       open an application");
        out("  neofetch         system info");
        out("  uptime           show session time");
        break;
      case "ls": {
        const path = args[0] ? resolve(win, args[0]) : win._cwd;
        const items = fs.list(path);
        if (!items.length) { /* empty, no output like ls */ }
        else out(items.map((i) => i.type === "folder" ? i.name + "/" : i.name).join("   "));
        break;
      }
      case "cd": {
        if (!args[0] || args[0] === "~" || args[0] === "/") { win._cwd = "/"; break; }
        const path = resolve(win, args[0]);
        const node = fs.get(path);
        if (!node) out(`cd: no such file or directory: ${args[0]}`, "#ff453a");
        else if (node.type !== "folder") out(`cd: not a directory: ${args[0]}`, "#ff453a");
        else win._cwd = path;
        break;
      }
      case "pwd": out(win._cwd === "/" ? "/" : "/" + win._cwd); break;
      case "cat": {
        if (!args[0]) { out("usage: cat <file>", "#ff9f0a"); break; }
        const node = fs.get(resolve(win, args[0]));
        if (!node) out(`cat: ${args[0]}: No such file or directory`, "#ff453a");
        else if (node.type === "folder") out(`cat: ${args[0]}: Is a directory`, "#ff453a");
        else out(node.content || "");
        break;
      }
      case "mkdir": if (args[0]) { fs.create(win._cwd, args[0], "folder"); } break;
      case "touch": if (args[0]) { fs.create(win._cwd, args[0], "file", ""); } break;
      case "rm": if (args[0]) { fs.remove(resolve(win, args[0])); } break;
      case "echo": out(args.join(" ")); break;
      case "date": out(new Date().toString()); break;
      case "whoami": out("mike"); break;
      case "clear": win._output.innerHTML = ""; break;
      case "uptime": out(`mike@macbook up 2 days, 3:42, 1 user`); break;
      case "open": {
        const app = args[0];
        import("./registry.js").then(({ getApp }) => { getApp(app)?.launch(); });
        out(`Opening ${app}...`);
        break;
      }
      case "neofetch":
        out("                    'c.          mike@macbook");
        out("                 ,xNMM.          ---------------");
        out("               .OMMMMo           OS: macOS Tahoe 26.0");
        out("               OMMM0,            Host: MacBook Pro");
        out("     .;loddo:' loolloddol;.      Kernel: 26.0.0");
        out("   cKMMMMMMMMMMNWMMMMMMMMMM0:    Shell: zsh 5.9");
        out(" .KMMMMMMMMMMMMMMMMMMMMMMMWd.    Resolution: dynamic");
        out(" XMMMMMMMMMMMMMMMMMMMMMMMX.      Terminal: Tahoe Terminal");
        out(";MMMMMMMMMMMMMMMMMMMMMMMM:      CPU: Apple M3");
        out(":MMMMMMMMMMMMMMMMMMMMMMMM:      Memory: 16 GB");
        out(".MMMMMMMMMMMMMMMMMMMMMMMMX.      ");
        out(" kMMMMMMMMMMMMMMMMMMMMMMMMWd.    ");
        out(" 'XMMMMMMMMMMMMMMMMMMMMMMMMMMk   ");
        out("   'XMMMMMMMMMMMMMMMMMMMMMMMMK.  ");
        break;
      default:
        out(`zsh: command not found: ${name}`, "#ff453a");
    }
  } catch (e) { out(`error: ${e.message}`, "#ff453a"); }
}

function resolve(win, p) {
  if (p === "." || p === "") return win._cwd;
  if (p === "..") { const parts = win._cwd.split("/"); parts.pop(); return parts.join("/") || "/"; }
  if (p.startsWith("/")) return p.replace(/^\//, "");
  if (p.startsWith("~/")) p = p.slice(2);
  if (win._cwd === "/") return p;
  return win._cwd + "/" + p;
}

registerApp(term);
export default term;
