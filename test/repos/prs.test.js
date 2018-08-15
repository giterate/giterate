const assume = require('assume');
const { createRepos } = require('../helpers');

const baseUrl = 'https://github.com/giterate/test-fixture-mutable/pull/';

describe('.prs()', () => {
  it('.createPrsForOneBranchName', async (done) => {
    const branchName = 'test-branch-name';

    const repos = createRepos({ source: 'giterate/test-fixture-mutable' });
    const response = await repos.prs().createPRsForOneBranchName(branchName)

    for (const result of response) {
      assume(result.urls).includes(baseUrl);
    }
    done();
  });
});
