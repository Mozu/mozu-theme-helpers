import getGithubResource from "./get-github-resource";
import { parse } from "JSONStream";
export default function getReleases(repo, { cache = true }) {
  return getGithubResource({
    pathname: `/repos/${repo}/releases`,
    cache: cache
  }).pipe(parse());
}