const { exec } = require('child_process');
const util = require('util');

var execPromisify = util.promisify(exec);

async function execute(command) {
  let stdout;
  let stderr;
  let err
  try {
    const res = await execPromisify(command);
    stdout = res.stdout;
    stderr = res.stderr;

  } catch (error) {
    err = error;
  }
  return { err, stdout, stderr };
}

/**
 * Regex to parse version description into separate fields
 */
descriptionRegex1 = /^v?([\d.]+)-(\d+)-g(\w+)-?(\w+)*/g;
descriptionRegex2 = /^v?([\d.]+-\w+)-(\d+)-g(\w+)-?(\w+)*/g;
descriptionRegex3 = /^v?([\d.]+-\w+\.\d+)-(\d+)-g(\w+)-?(\w+)*/g;

function parseSemanticVersion(description) {
  try {
    const [match, tag, commits, hash] = this.descriptionRegex1.exec(description);

    return {
      match,
      tag,
      commits,
      hash,
    };
  } catch {
    try {
      const [match, tag, commits, hash] = this.descriptionRegex2.exec(description);

      return {
        match,
        tag,
        commits,
        hash,
      };
    } catch {
      try {
        const [match, tag, commits, hash] = this.descriptionRegex3.exec(description);

        return {
          match,
          tag,
          commits,
          hash,
        };
      } catch {
        return false;
      }
    }
  }
}



async function run() {

  let version;
  var res = await execute("git describe --tags");

  if (res.err) {
    //some err occurred
    var index = res.err.message.indexOf("cannot describe anything");
    if (index > 0) {
      version = "0.0.1";
    }
  } else {
    var data = parseSemanticVersion(res.stdout);

    var commitMessage = await execute("git log -1 --format=%s");
    var previusliVersion = data.tag.replace("v", "");

    let { major = 0, minor = 0, patch = 0 } = previusliVersion.split(".");


    if (commitMessage.stdout.includes("breaking:")) {
      major = major++;
      minor = 0;
      patch = 0;
    }
    else if (commitMessage.stdout.includes("feature:")) {
      minor = minor++;
      patch = 0;
    }
    else {
      patch = data.commits;
    }
    version = `${major}.${minor}.${patch}`;
  }
  console.log(`the version is: ${version}`);

}

run();
