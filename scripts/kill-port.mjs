import { execSync } from "node:child_process";

const port = process.argv[2] ?? "3000";

function killOnWindows() {
  const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    if (!line.includes("LISTENING")) continue;
    const pid = line.trim().split(/\s+/).pop();
    if (pid && pid !== "0") pids.add(pid);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Encerrado PID ${pid} (porta ${port})`);
    } catch {
      /* already gone */
    }
  }
  if (pids.size === 0) console.log(`Nenhum processo na porta ${port}.`);
}

function killOnUnix() {
  try {
    execSync(`lsof -ti :${port} | xargs -r kill -9`, { stdio: "inherit", shell: true });
  } catch {
    console.log(`Nenhum processo na porta ${port}.`);
  }
}

if (process.platform === "win32") killOnWindows();
else killOnUnix();
