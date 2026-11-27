// TDD-lite checks for the Two-Sentence Horror entry.
// Run: node test/check.mjs   (from the entry dir)
// Each check fails loudly (exit 1) until main.ts satisfies it.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const entryDir = dirname(fileURLToPath(import.meta.url)).replace(/\/test$/, "");
const mainTs = join(entryDir, "main.ts");

let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

// 1. main.ts exists and is stdlib-only (no imports outside node: / relative).
const src = readFileSync(mainTs, "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
const bad = imports.filter((i) => !i.startsWith("node:") && !i.startsWith("."));
check("stdlib-only imports", bad.length === 0, bad.join(", ") || "only node:/relative");

// 2. Run twice into two temp dirs; outputs must be byte-identical (deterministic).
function runOnce() {
  const out = mkdtempSync(join(tmpdir(), "horror-out-"));
  const r = spawnSync(process.execPath, [mainTs], {
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: out, MAKEFUN_INPUT_DIR: "/input" },
    encoding: "utf8",
  });
  return { out, code: r.status, stderr: r.stderr };
}
const a = runOnce();
const b = runOnce();
check("run 1 exits 0", a.code === 0, a.stderr.trim());
check("run 2 exits 0", b.code === 0, b.stderr.trim());
const textA = readFileSync(join(a.out, "entry.txt"), "utf8");
const textB = readFileSync(join(b.out, "entry.txt"), "utf8");
check("deterministic output", textA === textB);

// 3. Gate: UTF-8 text, 1–400 characters, not only whitespace.
const chars = [...textA].length;
check("1–400 characters", chars >= 1 && chars <= 400, `${chars} chars`);
check("not only whitespace", textA.trim().length > 0);

// 4. Exactly two sentences: exactly two sentence-ending periods.
const periods = (textA.match(/\./g) || []).length;
check("exactly two sentences", periods === 2, `${periods} period(s)`);
check("no trailing newline junk", textA === textA.trim());

// 5. Output dir holds no dotfile.
const dotfiles = readdirSync(a.out).filter((f) => f.startsWith("."));
check("no dotfile in output", dotfiles.length === 0, dotfiles.join(", "));

rmSync(a.out, { recursive: true, force: true });
rmSync(b.out, { recursive: true, force: true });

console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
