import { PullRequest } from "../../services/github";

export const installation = { id: 1319757 };

export const pullRequest: PullRequest = {
  number: 4,
  base: {
    repo: {
      name: "entry",
      owner: { login: "js13kgames" }
    }
  },
  head: {
    ref: "entry/missing-index",
    repo: {
      name: "entry",
      owner: { login: "platane" }
    }
  }
} as any;

export const commitSha = "5ffc2fc";
