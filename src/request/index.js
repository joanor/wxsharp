const app = getApp()

/**
 * 定义公共方法resquestFunc，封装小程序request方法
 * @private
 * @param { String } url 接口地址
 * @param { Object } data 接口参数
 * @param { String } mode 访问接口的方式，GET或者POST
 * @param { Number } isUseToken 是否使用token，1使用，0不使用
 * @returns { Object } 返回一个promise对象
 * @example
 * 
 * const login_request = (code, e) => {
 *  let url = baseURL + `/user/authorizedLogin`
 *  let data = {
 *   "encryptedData": e.detail.encryptedData,
 *   "iv": e.detail.iv,
 *   "code": code,
 *   "operFlag": 'getUserInfo'
 *  }
 *  return resquestFunc(url, data, 'GET', 0)
 * }
 */

/* 这里默认存储信息的key是userInfo */
const requestClass = function (userinfo = "userInfo") {
  try {
    this.token = wx.getStorageSync(userinfo).access_token
  } catch (e) {
    console.log('获取用户token失败！')
  }
}
requestClass.prototype = {
  post (url, data, isUseToken = 1) {
    //  
    return new Promise((resolve, reject) => {
      let options = {
        url: app.globalData.baseURL + url,
        data: data,
        method: 'POST',
        success: res => resolve(res),
        fail: err => reject('系统异常！')
      }
      if (token && isUseToken === 1) {
        options = Object.assign(options, {
          header: {
            'Authorization': 'Bearer ' + this.token,
          },
        })
      }
      wx.request(options)
    })
  },
  get (url, data, isUseToken = 1) {
    return new Promise((resolve, reject) => {
      let options = {
        url: app.globalData.baseURL + url,
        data: data,
        method: 'GET',
        success: res => resolve(res),
        fail: err => reject('系统异常！')
      }
      if (token && isUseToken === 1) {
        options = Object.assign(options, {
          header: {
            'Authorization': 'Bearer ' + this.token,
          },
        })
      }
      wx.request(options)
    })
  }
}

// const resquestFunc = (url, data, mode, isUseToken = 1) => {
//   const token = wx.getStorageSync("userInfo").access_token    //  
//   return new Promise((resolve, reject) => {
//     let options = {
//       url: app.globalData.baseURL + url,
//       data: data,
//       method: mode,
//       success: res => resolve(res),
//       fail: err => reject('系统异常！')
//     }
//     if (token && isUseToken === 1) {
//       options = Object.assign(options, {
//         header: {
//           'Authorization': 'Bearer ' + token,
//         },
//       })
//     }
//     wx.request(options)
//   })
// }

// module.exports = resquestFunc

module.exports = new requestClass()

