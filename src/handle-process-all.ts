import "./polyfill.fromEntries";
import { create, listInstallations } from "./services/github";
import { getLatestRelease } from "./getLatestRelease";
import { sendMessage } from "./services/sqs";
import { pullsListAllCommits } from "./services/github/pagination";

export const handle = async () => {
  const { data: installations } = await listInstallations();

  for (const installation of shuffle(installations)) {
    const github = await create(installation.id);

    const {
      data: { repositories }
    } = await github.apps.listRepos({});

    for (const repository of shuffle(repositories)) {
      console.log(`-- repository ${repository.owner.login}/${repository.name}`);

      const { data: pullRequests } = await github.pulls.list({
        owner: repository.owner.login,
        repo: repository.name,
        state: "open"
      });

      for (const pullRequest of shuffle(pullRequests)) {
        console.log(
          `--  -- pullRequest #${pullRequest.number} ${pullRequest.title}`
        );

        const re = await getLatestRelease({ github })(pullRequest);

        const commits = await pullsListAllCommits(github)({
          owner: pullRequest.base.repo.owner.login,
          repo: pullRequest.base.repo.name,
          pull_number: pullRequest.number
        });
        const latestCommit = commits.slice(-1)[0];

        if (!latestCommit) continue;

        console.log(
          re
            ? `--  --  -- release ${re.release.tag_name} [${re.release.id}] ${re.commitSha}, commit ${latestCommit.sha}`
            : `--  --  -- no release, commit ${latestCommit.sha}`
        );

        await sendMessage({
          eventName: "x-force-analyze",
          installation,
          pullRequest,
          release: re && re.release,
          commitSha: latestCommit.sha
        });
      }
    }
  }
};

const shuffle = <T>([a, ...rest]: T[]): T[] => {
  if (!a) return [];
  return Math.random() > 0.5 ? [...shuffle(rest), a] : [a, ...shuffle(rest)];
};
