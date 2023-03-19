const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const { connected } = require("process");

async function checkFileExistence(path) {
  return fs.promises
    .access(path, fs.constants.F_OK)
    .then(() => {
      core.info(`${path} exists`);
      return true;
    })
    .catch(() => {
      core.setFailed(`${path} does not exist`);
      return false;
    });
}

// create a function that checks if the file starts with a markdown header
async function checkFileStartsWithHeader(filePath) {
  return fs.promises.readFile(filePath, "utf8").then((fileContent) => {
    // remove all empty lines ad the beginning of the file
    fileContent = fileContent.replace(/^\s*\n/gm, "");

    if (fileContent.startsWith("#")) {
      core.info(`File ${filePath} starts with a header`);
      return true;
    } else {
      core.setFailed(`File ${filePath} does not start with a header`);
      return false;
    }
  });
}

(async () => {
  try {
    checkFileExistence("README.md");
    checkFileExistence("LICENSE");
    if (!(await checkFileStartsWithHeader("README.md"))) {
      // get token for octokit
      const token = core.getInput("repo-token");
      const octokit = new github.getOctokit(token);

      // call octokit to create a check with annotation and details
      const check = await octokit.rest.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: "Readme Validator",
        head_sha: github.context.sha,
        status: "completed",
        conclusion: "failure",
        output: {
          title: "README.md must start with a title",
          summary: "Please use markdown syntax to create a title",
          annotations: [
            {
              path: "README.md",
              start_line: 1,
              end_line: 1,
              annotation_level: "failure",
              message: "README.md must start with a header",
              start_column: 1,
              end_column: 1,
            },
          ],
        },
      });
      core.info(check);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
