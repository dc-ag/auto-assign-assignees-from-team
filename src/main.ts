import * as core from "@actions/core";
import * as github from "@actions/github";

// eslint-disable-next-line require-jsdoc
export async function run() {
  try {
    const repoToken = core.getInput("repo-token", { required: true });
    const readToken = core.getInput("read-token", { required: true });
    const team = core.getInput("team");
    const org = core.getInput("org");
    const amount = parseInt(core.getInput("amount"));

    const issue: { owner: string; repo: string; number: number } =
      github.context.issue;

    if (issue == null || issue.number == null) {
      console.log("No pull request context, skipping");
      return;
    }

    // See https://octokit.github.io/rest.js/
    const repoClient = github.getOctokit(repoToken);
    const readClient = github.getOctokit(readToken);

    const members = await readClient.rest.teams.listMembersInOrg({
      org: org,
      team_slug: team,
    });
    console.log("Request Status for getting team members:" + members.status);
    // filter out PR author
    let memberNames = members.data.map((a) => a.login);
    console.log("Picking reviewer from members:", memberNames);

    let finalAssignees: string[] = [];

    if (amount === 0 || memberNames.length <= amount) {
      finalAssignees = memberNames;
    } else {
      memberNames = shuffle(memberNames);
      for (let i = 0; i < amount; i++) {
        const name = memberNames.pop();
        if (name !== undefined) {
          finalAssignees.push(name);
        }
      }
    }

    if (finalAssignees.length > 0) {
      const personResponse = await repoClient.rest.issues.addAssignees({
        owner: issue.owner,
        repo: issue.repo,
        issue_number: issue.number,
        assignees: finalAssignees,
      });
      console.log(
        "Request Status:" +
          personResponse.status +
          ", Assignees from Team " +
          team +
          ":" +
          personResponse?.data?.assignees?.map((r) => r.login).join(",")
      );
    } else {
      console.log("No members to assign found in team " + team);
    }
  } catch (error) {
    console.error(error);
    core.setFailed("Unknown error" + error);
    throw error;
  }
}

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

run();
