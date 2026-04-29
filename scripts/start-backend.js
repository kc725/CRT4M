import { execFileSync } from "child_process";
import { join } from "path";

const isWin = process.platform === "win32";
const python = join("backend", "venv", isWin ? "Scripts" : "bin", "python");

execFileSync(python, [join("backend", "main.py")], { stdio: "inherit" });
