const validator = require('./validator')  // 表单验证
const validate = require('./validType')
const touch = require('./touch')

/**
 * 将类似'2020-05-02 13:30:51'这样的时间转换成时间戳
 * @param { String } time 年月日时分秒格式的字符串
 * @returns { String } 返回时间戳
 */
const parseLocaleTime = time => {
  var date = new Date()
  date.setFullYear(time.substring(0, 4))
  date.setMonth(time.substring(5, 7) - 1)
  date.setDate(time.substring(8, 10))
  date.setHours(time.substring(11, 13))
  date.setMinutes(time.substring(14, 16))
  date.setSeconds(time.substring(17, 19))
  // return Date.parse(date) / 1000;                        // 除以1000，表示换算成秒的时间戳，这里我们是换算成毫秒 ，所以不除以1000   
  return Date.parse(date)
}

/**
 * 时间戳转化成各种需要的时间格式
 * @param { Number } timestamp 时间戳
 * @returns { Array } 返回转换的由各种时间格式组成的数组
 */
const parseTimestamp = timestamp => {
  let date = ''
  if (timestamp.length < 13) {
    date = new Date(timestamp * 1000)                       // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  } else {
    date = new Date(timestamp)
  }
  let Y = date.getFullYear()
  let M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  let str = "星期" + "日一二三四五六".charAt(date.getDay())
  return [`${Y}-${M}-${D}`, M, `${Y}-${M}-${D} ${str}`, `${Y}-${M}-${D} ${h}:${m}:${s}`, `${h}:${m}:${s}`, `${Y}年${M}月`, `${Y}/${M}/${D}`]
}

/**
 * 根据两个时间戳，计算两个时间之间相差的时间
 * @param { Number } starttimestamp 起始时间戳
 * @param { Number } endtimestamp 结束时间戳   起始时间戳必须小于结束时间戳
 * @returns { String } 返回生成的时间差
 */
const timeLast = (starttimestamp, endtimestamp) => {
  let dates = endtimestamp - starttimestamp;                // 时间差的毫秒数     
  // let days = Math.floor(date3 / (24 * 3600 * 1000))      // 计算出相差天数，这里没有使用
  // let leave1 = date3 % (24 * 3600 * 1000)                // 计算天数后剩余的毫秒数，这里没有使用
  let hours = Math.floor(dates / (3600 * 1000))             // 计算出小时数
  let leave1 = dates % (3600 * 1000)                        // 计算小时数后剩余的毫秒数
  let minutes = Math.floor(leave1 / (60 * 1000))            // 计算相差分钟数   
  let leave2 = leave1 % (60 * 1000)                         // 计算分钟数后剩余的毫秒数
  let seconds = Math.round(leave2 / 1000)                   // 计算相差秒数
  return `${hours}小时${minutes}分`
}

/**
 * 深度复制
 * @param { any } value 任意类型的数据
 * @returns { any } 返回深度复制后的值
 */
const deepClone = value => {
  // 对于数字、字符串、布尔
  if (typeof value !== 'object') {
    return value;
  }
  // 对于Date类型
  if (value instanceof Date) {
    return new Date(value);
  }
  // 对于数组
  if (value instanceof Array) {
    const clone = [];
    for (let i = 0, len = value.length; i < len; i++) {
      clone[i] = deepClone(value[i]);
    }
    return clone;
  }
  // 对于Object对象
  if (typeof value === 'object') {
    const clone = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        clone[key] = deepClone(value[key]);
      }
    }
    return clone;
  }
}


/**
 * 防抖
 * @param { Function } func 起始时间戳
 * @param { Number } endtimestamp 结束时间戳   起始时间戳必须小于结束时间戳
 */
const debounce = (func, wait, immediate = false) => {
  // immediate默认为false
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;
  const later = () => {
    // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
    const last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    }
    else {
      timeout = undefined;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = args = undefined;
        }
      }
    }
  };
  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    // 第一次调用该方法时，且immediate为true，则调用func函数
    const callNow = immediate && !timeout;
    // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = undefined;
    }
    return result;
  };
}

/**
 * 节流
 * @param { Function } func 执行的函数
 * @param { Number } delay 结束时间戳   起始时间戳必须小于结束时间戳
 * @returns { Function } 返回节流后的函数
 */
const throttle = (func, delay) => {
  let timer;
  let t_start = Date.now();
  return function () {
    const context = this;
    const args = arguments;
    const t_curr = Date.now();
    clearTimeout(timer);
    if (t_curr - t_start >= delay) {
      func.apply(context, args);
      t_start = t_curr;
    }
    else {
      timer = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    }
  };
}

/**
 * 生成n位唯一的GUID
 * @param { Number } n 位数
 * @returns { String } 返回生成的GUID
 */
const generateGUID = (n) => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

/**
 * 限制input输入框只能输入指定位数的小数
 * @param { Number } value  匹配的输入内容
 * @param { Number } nums=1    小数的位数
 * @returns { Number }
 */
const assignPointNum = (value, nums = 1) => {
  value = value.replace(/[^\d.]/g, "")                //清除"数字"和"."以外的字符
  value = value.replace(/^\./g, "")                   //验证第一个字符是数字
  value = value.replace(/\.{2,}/g, ".")               //只保留第一个, 清除多余的
  value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".")

  let pattern = new RegExp(`\^\(\\\-\)\*\(\\d\+\)\\\.\(\\d\{${nums}\}\)\.\*\$`)           //定义正则表达式;
  // value = value.replace(/^(\-)*(\d+)\.(\d{nums}).*$/, '$1$2.$3'); //只能输入指定位数个小数
  value = value.replace(pattern, '$1$2.$3')
  if (value.indexOf(".") < 0 && value != "") {          //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
    value = parseFloat(value)
  }
  if (!value || value == '0' || value == '0.0' || value == '0.00') {
    return
  }
  return value
}

/**
 * 身份证号码或者手机号码脱敏，使用星号替换敏感部位
 * @param { Number } idCard     
 * @param { Number } keepLength
 * @returns { String }
 */
const hideIdCard = (idCard, keepLength) => {
  if (!idCard) {
    return idCard
  }
  const digits = keepLength ? keepLength : 4
  const reg = new RegExp(`(^\\w{${digits}})(\\w+)(\\w{${digits}}$)`, 'g')
  return idCard.replace(reg, (...args) => {
    let tempStr = ''
    if (args[2] && args[2].length) {
      for (let i = 0, len = args[2].length; i < len; i++) {
        tempStr += '*'
      }
    }
    return args[1] + tempStr + args[3]
  })
}

/**
 * 姓名或者词语脱敏，使用星号替换敏感部位
 * @param { String } name 汉字，或者名称
 * @returns { String }
 */
const hideName = name => {
  if (!name) {
    return name
  }
  return name.replace(/(^.{1})(.+)$/g, (...args) => {
    let tempStr = ''
    if (args[2] && args[2].length) {
      tempStr = Array.from({
        length: args[2].length + 1
      }).join('*')
    }
    return args[1] + tempStr
  })
}


module.exports = {
  parseLocaleTime,
  parseTimestamp,
  timeLast,
  debounce,
  throttle,
  generateGUID,
  assignPointNum,
  hideIdCard,
  hideName,
  validator,
  validate,
  touchStart: touch.touchStart,
  touchMove: touch.touchMove,
  touchEnd: touch.touchEnd
}





