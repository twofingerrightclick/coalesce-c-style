import type { CanonReference } from "./types";

const requests = new Map<string, Promise<string>>();
function get(path: string) {
  if (!requests.has(path)) {
    requests.set(path, fetch(path).then((response) => {
      if (!response.ok) throw new Error(`Canon reference ${path}: HTTP ${response.status}`);
      return response.text();
    }).catch((error) => { requests.delete(path); throw error; }));
  }
  return requests.get(path)!;
}

/** Read the original source rather than maintaining a second imitation. */
export async function loadCanonReference(reference: CanonReference) {
  if (!reference.page) return { html: "", css: "" };
  const base = `${import.meta.env.BASE_URL}canon-reference/`;
  const [source, stylesheet] = await Promise.all([get(`${base}${reference.page}.html`), get(`${base}ref.css`)]);
  const doc = new DOMParser().parseFromString(source, "text/html");
  const section = reference.section === "*"
    ? (() => {
      const group = doc.createElement("div");
      doc.querySelectorAll(".ref-section").forEach((node) => group.append(node.cloneNode(true)));
      return group.childElementCount ? group : null;
    })()
    : reference.section ? doc.getElementById(reference.section) : doc.querySelector("main .ref-section, .ref-section");
  if (!section) throw new Error(`Missing Canon section: ${reference.page}#${reference.section ?? "first"}`);
  const example = section.cloneNode(true) as HTMLElement;
  // Leave the source example's labels and notes, but exclude reference-site scripts.
  example.querySelectorAll("script").forEach((node) => node.remove());
  const sourceURL = new URL(`${base}${reference.page}.html`, location.href);
  example.querySelectorAll("[src], [href], [poster]").forEach((node) => {
    for (const attr of ["src", "href", "poster"]) {
      const value = node.getAttribute(attr);
      if (!value || value.startsWith("#") || /^(data:|https?:|mailto:|tel:)/.test(value)) continue;
      node.setAttribute(attr, new URL(value, sourceURL).href);
    }
  });
  // ref.css supplies example layouts. Its optional remote code font isn't needed.
  const css = stylesheet.replace(/@import\s+url\([^;]+;/g, "")
    .replace(/url\(["']?(assets\/[^)"']+)["']?\)/g, (_, path: string) => `url("${new URL(path, sourceURL).href}")`);
  return {
    html: `<div class="ref-pg-page">${example.outerHTML}</div>`,
    css: `${css}\n.ref-section{margin:0}.ref-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))}.ref-pg-page{display:block;min-width:0;min-block-size:0}\n${reference.css ?? ""}`,
  };
}
