const assume = require('assume');
const uuid = require('uuid/v4');
const { createRepos } = require('../helpers');

describe('E2E', function () {
  this.timeout(50000);

  it('can create a branch, edit a file, create a PR', async function () {
    const branchName = uuid();
    const content = `# test-fixture-mutable
    A test repository whose properties can be modified (tests don't depend on it)
    <!-- Last updated on ${ new Date() }-->`;
    const repos = createRepos({ source: 'giterate/test-fixture-mutable' });

    const branches = repos.branches().create(branchName);

    await branches.files({ path: './README.md' }).contents()
      .update(content).evaluate();

    const title = `Giterate E2E - ${ new Date() }`;
    const prs = branches.prs().create({ title });
    const prObjects = await prs.read();

    for (const { branch, pr } of prObjects) {
      assume(branch.name).to.equal(branchName);
      assume(pr.title).to.equal(title);
    }

    await prs.close();
    await branches.delete();
  });
});
