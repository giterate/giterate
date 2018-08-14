const fs = require('fs');
const path = require('path');
const Repos = require('../repos');
const Orgs = require('../orgs');

let githubAuth;
const localAuthFile = path.join(__dirname, '..', '.localauth');

exports.getGithubAuth = function () {
  if (githubAuth) { return githubAuth; }

  try {
    githubAuth = fs.readFileSync(localAuthFile);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  if (!githubAuth) {
    const {
      GITERATE_KEY,
      GITERATE_APP_ID,
      GITERATE_APP_SECRET
    } = process.env;

    if (GITERATE_KEY) {
      githubAuth = { key: GITERATE_KEY };
    } else if (GITERATE_APP_ID && GITERATE_APP_SECRET) {
      githubAuth = {
        app: {
          id: GITERATE_APP_ID,
          secret: GITERATE_APP_SECRET
        }
      };
    } else {
      throw new Error('No Github Credentials found.');
    }
  }

  return githubAuth;
}

exports.createRepos = function () {
  const auth = exports.getGithubAuth();
};

exports.createOrgs = function () {

};
