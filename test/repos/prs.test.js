const assume = require('assume');
const { createRepos } = require('../helpers');

const baseUrl = 'https://github.com/giterate/test-fixture-mutable/pull/';

describe('.prs()', function () {
  this.timeout(5e4);

  const expectedPrs = [
    'https://github.com/giterate/test-fixture/pull/1'
  ];

  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    let wasCalled = false;
    await repos.prs().forEach(({ pr }) => {
      wasCalled = true;
      assume(expectedPrs).includes(pr.html_url);
    });
    assume(wasCalled).to.be.true();
  });

  it('.createPrsForOneBranchName', async function () {
    const branchName = 'some-random-branchname';

    const repos = createRepos({ source: 'giterate/test-fixture-mutable' });
    const prs = await repos.branches()
      .filter(({ branch }) => branch.name === branchName)
      .prs()
      .create();
    const prObjects = await prs.read();

    assume(prObjects).to.have.length(1);

    for (const { repo, branch, pr } of prObjects) {
      assume(repo).to.exist();
      assume(repo.name).to.equal('test-fixture-mutable');
      assume(branch).to.exist();
      assume(branch.name).to.equal(branchName);
      assume(pr.html_url).includes(baseUrl);
    }

    await prs.close();
  });

  // TODO: Make a more E2E test (in another file) that can:
  //    1. create a new branch,
  //    2. edit/create a file,
  //    3. push the change to a branch,
  //    4. then create a PR from it.
});
