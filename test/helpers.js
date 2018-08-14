const fs = require('fs');
const path = require('path');
const Githulk = require('githulk');
const Repos = require('../repos');
const Orgs = require('../orgs');

let githubAuth;
const localAuthFile = path.join(__dirname, '..', '.localauth');

exports.getGithubAuth = function () {
  if (githubAuth) { return githubAuth; }

  try {
    githubAuth = JSON.parse(fs.readFileSync(localAuthFile, { encoding: 'utf-8' }));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  if (!githubAuth) {
    const {
      GITERATE_TOKEN,
      GITERATE_APP_ID,
      GITERATE_APP_SECRET
    } = process.env;

    if (GITERATE_TOKEN) {
      githubAuth = { token: GITERATE_TOKEN };
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
};

exports.createClient = function () {
  const auth = exports.getGithubAuth();
  if (auth.token) {
    return new Githulk({ token: auth.token });
  }
};

exports.createRepos = function (opts) {
  return new Repos(Object.assign({}, {
    hulk: exports.createClient()
  }, opts || {}));
};

exports.createOrgs = function (opts) {
  return new Orgs(Object.assign({}, {
    hulk: exports.createClient()
  }, opts || {}));
};
