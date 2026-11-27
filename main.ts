// Two-Sentence Horror — make.fun entry
// Writes exactly one horror story, in exactly two sentences, to
// $MAKEFUN_OUTPUT_DIR/entry.txt. Stdlib-only, deterministic.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENTRY =
  "A parcel waited on my doorstep at 6:04 this morning, addressed in my own handwriting, though I ordered nothing. " +
  "Inside was a photograph of me opening it, taken from inside my flat.";

const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir; // resolved from the script location, never process.cwd()

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const inputDir = process.env.MAKEFUN_INPUT_DIR ?? "/input";
void inputDir; // the entry needs no input; the env is honoured, not ignored

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
