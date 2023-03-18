const fs = require("fs");
const coverageReport = JSON.parse(
  fs.readFileSync("./coverage/json.json", "utf8")
);

let gitAnnotations = [];

for (const [path, data] of Object.entries(coverageReport)) {
  console.log(`Find uncovered lines for ${path}...`);

  for (const [sid, sval] of Object.entries(data.statementMap)) {
    const isCovered = !!data.s[sid];

    if (!isCovered) {
      gitAnnotations.push({
        start_line: sval.start.line,
        end_line: sval.end.line,
        file: path,
        description: "Line uncovered",
      });
    }
  }

  for (const [fid, fval] of Object.entries(data.fnMap)) {
    const isCovered = !!data.f[fid];

    if (!isCovered) {
      gitAnnotations.push({
        start_line: fval.decl.start.line,
        end_line: fval.decl.end.line,
        file: path,
        description: "Function uncovered",
      });
    }
  }
}

console.log(gitAnnotations);
