import fs from "node:fs";
import path from "node:path";

/**
 * LegacyMarkup
 * ------------
 * Renders the ORIGINAL index.html body markup (header + the three <section>s)
 * byte-for-byte. The markup is injected via dangerouslySetInnerHTML so that
 * every element, class, id, inline SVG and attribute is preserved EXACTLY as
 * authored — guaranteeing zero visual regressions and keeping all the hooks
 * (ids/classes/`categoria` attrs) that the legacy scripts query.
 *
 * The wrapper uses `display: contents` so it produces no layout box of its own:
 * the <header> and <section> elements therefore become direct flex children of
 * <body> (the original `body { display: flex }` layout), identical to the
 * legacy DOM structure.
 *
 * This is a Server Component with no state, so React never re-renders this
 * subtree — leaving the imperative legacy scripts free to own the DOM (toggle
 * `display-none`, inject audio lists, draw on the canvas, etc.) without React
 * reconciliation interfering.
 */
const BODY_HTML = fs.readFileSync(
  path.join(process.cwd(), "app", "_legacy", "app-body.html"),
  "utf8"
);

export default function LegacyMarkup() {
  return (
    <div
      style={{ display: "contents" }}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: BODY_HTML }}
    />
  );
}
