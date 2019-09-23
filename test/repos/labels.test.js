const assume = require('assume');
const { createRepos } = require('../helpers');

const labels = [
  'bug',
  'duplicate',
  'enhancement',
  'good first issue',
  'help wanted',
  'invalid',
  'question',
  'wontfix'
];

describe('.labels()', function () {
  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.labels().forEach(({ label }) => {
      assume(labels).includes(label.name);
    });
  });
});
