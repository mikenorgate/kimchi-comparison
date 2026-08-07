// ===================================================================
// Virtual filesystem for Finder / Terminal / TextEdit / Preview
// ===================================================================
import { state, setState, uid } from "./state.js";

export function defaultFS() {
  const t = new Date().toISOString();
  return {
    type: "folder", name: "Mike", path: "/",
    children: [
      { type: "folder", name: "Desktop", children: [
        { type: "file", name: "Welcome.txt", ext: "txt", content: "Welcome to macOS Tahoe!\n\nThis is a full recreation built as a web app.\nEverything you see is interactive:\n- Click apps in the Dock to open them\n- Drag windows by their title bar\n- Use the traffic-light buttons to close/minimize/maximize\n- Press Cmd+Space for Spotlight\n- Right-click the desktop\n- Open System Settings to change wallpaper & theme\n\nEnjoy exploring!" },
      ]},
      { type: "folder", name: "Documents", children: [
        { type: "file", name: "Notes.txt", ext: "txt", content: "Project ideas:\n1. Build a macOS clone\n2. Learn to fly\n3. Visit Tahoe" },
        { type: "file", name: "Resume.txt", ext: "txt", content: "Mike\nSoftware Engineer\n\nExperience:\n- Building cool things" },
        { type: "folder", name: "Work", children: [
          { type: "file", name: "Q4 Plan.txt", ext: "txt", content: "Q4 Objectives:\n- Ship the new feature\n- Improve performance\n- Write docs" },
        ]},
        { type: "file", name: "Recipe.txt", ext: "txt", content: "Chocolate Chip Cookies\n\n2 cups flour\n1 cup sugar\n2 eggs\n1 cup chocolate chips\n\nBake at 375F for 10 min." },
      ]},
      { type: "folder", name: "Downloads", children: [
        { type: "file", name: "installer.txt", ext: "txt", content: "Downloaded file placeholder." },
      ]},
      { type: "folder", name: "Pictures", children: [
        { type: "file", name: "Sunset.txt", ext: "txt", content: "[image: sunset over the lake]" },
        { type: "file", name: "Beach.txt", ext: "txt", content: "[image: beach vacation]" },
        { type: "file", name: "Mountains.txt", ext: "txt", content: "[image: snowy peaks]" },
      ]},
      { type: "folder", name: "Movies", children: [
        { type: "file", name: "Vacation Clip.txt", ext: "txt", content: "[video: summer 2025]" },
      ]},
      { type: "folder", name: "Music", children: [] },
      { type: "folder", name: "Applications", children: [] },
    ],
  };
}

let root = state.fs || defaultFS();
state.fs = root;

function walk(node, cb) {
  cb(node);
  if (node.children) node.children.forEach((c) => walk(c, cb));
}
function findPath(node, path, base = "") {
  const cur = base === "" ? node.name : base + "/" + node.name;
  if (cur === path || path === "/" || path === node.name) return node;
  if (node.children) {
    for (const c of node.children) {
      const r = findPath(c, path, cur);
      if (r) return r;
    }
  }
  return null;
}

export const fs = {
  root: () => root,
  get(path) {
    if (!path || path === "/" || path === "Mike") return root;
    return findPath(root, path);
  },
  home: () => root,
  children(node) { return node?.children || []; },
  isFolder(node) { return node?.type === "folder"; },
  list(path) {
    const node = this.get(path);
    return node ? this.children(node).slice() : [];
  },
  create(parentPath, name, type = "folder", content = "") {
    const parent = this.get(parentPath) || root;
    if (!parent.children) parent.children = [];
    const item = { type, name, ...(type === "folder" ? { children: [] } : { ext: name.split(".").pop(), content }) };
    parent.children.push(item);
    return item;
  },
  remove(path) {
    const node = this.get(path);
    if (!node || node === root) return false;
    const parentPath = path.split("/").slice(0, -1).join("/");
    const parent = this.get(parentPath) || root;
    const idx = parent.children.indexOf(node);
    if (idx >= 0) {
      const [removed] = parent.children.splice(idx, 1);
      return removed;
    }
    return false;
  },
  rename(path, newName) {
    const node = this.get(path);
    if (!node) return false;
    node.name = newName;
    if (node.type === "file") node.ext = newName.split(".").pop();
    return true;
  },
  move(srcPath, destFolder) {
    const node = this.remove(srcPath);
    if (!node) return false;
    const dest = this.get(destFolder) || root;
    if (!dest.children) dest.children = [];
    dest.children.push(node);
    return true;
  },
  resolvePath(p) {
    if (!p) return "/";
    if (p === "~" || p === "/") return "/";
    p = p.replace(/^~\//, "").replace(/^\/+/, "").replace(/\/+$/, "");
    return p;
  },
  all() {
    const items = [];
    walk(root, (n) => { if (n !== root) items.push(n); });
    return items;
  },
  persist() { setState({}); }, // fs lives in state object, persists via state save
};

// persist fs into state on changes (we keep reference, state save serializes it)
export function persistFS() {
  // trigger a save by touching state
  try { localStorage.setItem("tahoe-state-v1-fs", JSON.stringify(root)); } catch {}
}
export function loadFS() {
  try {
    const saved = localStorage.getItem("tahoe-state-v1-fs");
    if (saved) { root = JSON.parse(saved); state.fs = root; }
  } catch {}
  return root;
}
