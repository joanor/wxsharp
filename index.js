const http = require('./src/request/index')
const CryptoJS = require('./src/crypto/index')  // 加密
const dayjs = require('./src/dayjs/index')    // dayjs轻量级处理时间
const Event = require('./src/event/index')    // 时间
const Map = require('./src/map/index')        // 地图
const Storage = require('./src/storage/index')      // 小程序的本地存储
const utils = require('./src/utils/index')      // 一些常用方法
const Libs = Object.assign({ Event, Map, CryptoJS, dayjs, Storage }, utils)

/* 封装triggerEvent */
export const $emit = (...args) => {
  this.triggerEvent(...args)
}
/* 封装setData */
export const $set = (data = {}, callback = () => { }) => {
  this.setData(data, callback);
  return new Promise((resolve) => wx.nextTick(resolve))
}

/* 封装boundingClientRect */
export const $getRect = (selector = '', all = false) => {
  return new Promise((resolve) => {
    wx.createSelectorQuery()
      .in(this)
    [all ? 'selectAll' : 'select'](selector)
      .boundingClientRect((rect) => {
        if (all && Array.isArray(rect) && rect.length) {
          resolve(rect);
        }
        if (!all && rect) {
          resolve(rect);
        }
      })
      .exec()
  })
}

/* 封装存储对象 */
export const $setItem = (key, value, expiration) => {
  Libs.Storage.setStorageSync(key, value, expiration)
}

/* 封装获取存储对象 */
export const $getItem = (key) => {
  Libs.Storage.getStorageSync(key)
}

/* 封装删除指定存储对象 */
export const $deleteItem = (key) => {
  Libs.Storage.removeStorageSync(key)
}

/* 封装清空存储对象 */
export const $clearItem = () => {
  Libs.Storage.clearStorageSync()
}

/* 添加事件监听 */
export const $addEventListener = (type, callback, scope) => {
  Libs.Event.addEventListener(type, callback, scope)
}

/* 移除事件监听 */
export const $removeEventListener = (type) => {
  Libs.Event.removeEventListener(type)
}

/* 发布事件 */
export const $dispatch = (type, target) => {
  Libs.Event.dispatch(type, target)
}

export const $http = http

export default Behavior({
  attached () {
    /* 封装wx.request */
    this.$http = $http
  },
  methods: {
    $emit,
    $set,
    $getRect,
    $setItem,
    $getItem,
    $deleteItem,
    $clearItem,
    $addEventListener,
    $removeEventListener,
    $dispatch,
  },
});
