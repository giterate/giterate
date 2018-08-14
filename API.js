
// # Repositories

const { Orgs, Repos } = require('giterate');

const repos = new Repos(source);
const repos = new Repos({ source });
const repos = new Repos([
  'orgname',
  'another-org/reponame'
  /*
   * Github API responses
   *
   * GET /user/repos
   * GET /user/indexzero/repos
   * GET /orgs/foreverjs/repos
   * GET /repositories
   *
   * These all have the response
   * {
   *   owner: { login: "username" },
   *   name: "reponame",
   *   full_name: "username/reponame"
   * }
   */
  { org: 'borg' },
  { org: 'org', repo: 'other-repo' },
  { owner: { login: 'apple' }, name: 'pie' },
  { full_name: 'org/a-repo' }
])

repos
  //
  // Iteration will be lexographically sorted by
  // "full_name" (i.e. "org/repo").
  //
  .each(repo => console.log(repo.full_name));

//
// The above would output:
//
// "another-org/reponame"
// "apple/pie"
// "borg/repo1"
// "borg/repo2"
// ... all other borg/* repositories ...
// "org/a-repo"
// "org/other-repo"
// "orgname/repo1"
// "orgname/repo2"
// ... all other orgname/* repositories ...
//

repos
  .files()
  .filter(file => /.md$/.test(file))

repos
  // .commits()          // All commits
  // .prs()              // All PRs
  // .issues()           // All issues
  // .contributors(kind) // All contributors of the specified "kind": PR, commit, issue, comment.
  // .committers()       // All past committers
  .labels()           // All issue labels
  // .tags()             // All repo tags
  // .branches()         // All repo branches
  .webhooks()         // All webhooks

  .sort(pred)         // Sort based on predicate `pred`
  .filter(pred)       // Filter based on predicate `pred`
  // .within(range)      // Filter within a time range

  .update()           // Accept a set of updates (may not work on every data type)
  .pr(data)           // Creates a new PR

// # Orgs

// If only orgs are provided to Giterate then operations on the
// organizations themselves can be performed.

const orgs = new Orgs([
  'org1',
  'org2',
  { login: 'github '},
  { org: 'borg' },
  { name: 'smorgasorg' }
]);

// Responses from the Github API Orgs
// will have full_name added to them
//
//     org.full_name = org.login
//
orgs.each(org => console.log(org.full_name));

orgs
  .teams()

//
// # Work items
// - SPIKE: investigate vfs as a way to mutate files / other text content.
//
