/**
 *  封装异步请求
 */
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
      value => P.resolve(callback()).then(() => value),

      reason => P.resolve(callback()).then(() => { throw reason })
  );
};

class Request {
  constructor(parms) {
    this.withBaseURL = parms.withBaseURL || true;
    this.baseURL = parms.baseURL || 'https://s61.xboxes.cn/api';
    this.requestTask = null;
  }

  get(url, data) {
    return this.request('GET', url, data);
  }

  post(url, data) {
    return this.request('POST', url, data);
  }

  put(url, data) {
    return this.request('PUT', url, data);
  }

  request(method, url, data) {
    const vm = this;
    return new Promise((resolve, reject) => {
      this.requestTask = wx.request({
        url: vm.withBaseURL ? vm.baseURL + url : url,
        data,
        method,
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync("token"),
        },
        success(res) {
          resolve(res);
        },
        fail() {
          reject({
            msg: '请求失败',
            url: vm.withBaseURL ? vm.baseURL + url : url,
            method,
            data
          });
        }
      });
    });
  }

  abort() {
    if (this.requestTask) {
      this.requestTask.abort();
    }
  }
}

// const request = new Request({
//   baseURL: '',
//   withBaseURL: true
// });

export default Request;