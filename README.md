# Auto Assign Assignees From Team

Assign any amount of members from a given [GitHub Team](https://help.github.com/en/github/setting-up-and-managing-organizations-and-teams/organizing-members-into-teams) as Assignees to a PR
Members are chosen randomly

## Example Usage

```yaml
name: "Assign Assignees"
on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign-reviewers:
    runs-on: ubuntu-latest
    steps:
      - name: "Assign assignees from team"
        uses: dc-ag/auto-assign-assignees-from-team@v1.0.2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          org: "org" # organization containing the team
          team: "team" # the team name
          amount: 0 # amount of assignees to assign from the given team, 0 to assign all. If the amount exceeds the member count of the team all members will be added
```

## Build
```shell
npm run build && npm run package
```