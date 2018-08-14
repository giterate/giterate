import ReaderWriter from '../reader-writer';

export default class Labels extends ReaderWriter {
  read() {
    if (!this._dataPromise) {
      this._dataPromise = this.readCore();
    }

    return this._dataPromise;    
  }

  async readCore() {
    const data = []
    for(const repo of this.repos) {
      data.push.apply(this.data, await this.githulk.labels(repo));
    }
    return data;
  }


}