const fs = require("fs");
const Octokit = require("@octokit/rest");
const octokit = new Octokit({
  auth: "${{ secrets.CI_GITHUB_TOKEN }}",
});

const coverageReport = JSON.parse(
  fs.readFileSync("./coverage/coverage-final.json", "utf8")
);

let gitAnnotations = [];

for (const [path, data] of Object.entries(coverageReport)) {
  console.log(`Find uncovered lines for ${path}...`);

  for (const [sid, sval] of Object.entries(data.statementMap)) {
    const isCovered = !!data.s[sid];

    if (!isCovered) {
      gitAnnotations.push({
        path: data.path,
        start_line: sval.start.line,
        end_line: sval.end.line,
        annotation_level: "warning",
        message: "This line is not covered by tests",
      });
    }
  }

  for (const [fid, fval] of Object.entries(data.fnMap)) {
    const isCovered = !!data.f[fid];

    if (!isCovered) {
      gitAnnotations.push({
        path: data.path,
        start_line: fval.start.line,
        end_line: fval.end.line,
        annotation_level: "warning",
        message: "This function is not covered by tests",
      });
    }
  }
}

gitAnnotations.forEach((annotation) => {
  octokit.checks.create({
    owner: "ynevet-ov",
    repo: "${{ github.repository }}",
    name: "Jest coverage report",
    head_sha: "${{ github.event.pull_request.head.sha }}",
    output: {
      title: "Jest coverage report",
      summary: "Coverage report for your pull request",
      annotations: [annotation],
    },
  });
});
