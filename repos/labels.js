import ReaderWriter from '../reader-writer';

export default class Labels extends ReaderWriter {
  constructor(repos) {
    this.reposPromise = repos.read();
  }

  async readCore() {
    const data = []
    // Read all the parent repos data
    const repos = await this.reposPromise;
    // TODO: simplify with async map.
    for(const repo of repos) {
      // Get the data
      data.push.apply(data, await this.githulk.labels(repo));
    }
    return data;
  }
}