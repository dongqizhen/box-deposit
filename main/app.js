
//app.js
import Request from './utils/request'

const request = new Request({
  baseURL: '',
  withBaseURL: true
})

App({
  onLaunch () { 
    const token = wx.getStorageSync("token");
    //检查登录态是否过期。
    wx.checkSession({
      success:()=>{
        if (token) {
          
        } else {
          // 登录
          wx.removeStorageSync('isLogin')
          wx.removeStorageSync('token')
          this.login()
        }
      },
      fail:()=>{
        this.login()
      }
    })

    //检查更新
    this.checkForUpdate();
    this.globalData.getUserProfile = this.getUserProfile
    this.globalData.getUserInfo = this.getUserInfo
  },

  async getUserProfile () {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    return new Promise((resolve,reject)=>{
      wx.getSetting({
        success:(res)=>{
          if (res.authSetting['scope.userInfo']) {
            wx.getUserProfile({
              desc: '用于显示用户资料',
              success: (res) => {
                console.log(res)
                const {userInfo} = res
                
                wx.setStorageSync('wx_userInfo', userInfo)
                this.globalData.wx_userInfo = userInfo
                this.globalData.profile_user = res
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
                resolve()
              }
            })
          }
        },
        fail:()=>{
          reject()
        }
      })
    })
  },

  //用户信息
 async getUserInfo(){
   await request.get('/kdy/userInfo',{
      header: {
        'Accept': 'application/vnd.cowsms.v2+json',
        'Authorization': 'Bearer ' + wx.getStorageSync("token"),
      }
    }).then((res)=>{
      //如果token失效   则返回新的token  
      if (res.header.Authorization) {
        var str = res.header.Authorization;
        // console.log(str)
        wx.removeStorageSync("token");
        wx.setStorageSync("token", str.substring(7, str.length))
      }

      const {avatarurl,nickname,status,phone,id} = res.data

      // const wx_userInfo = wx.getStorageSync('wx_userInfo')
      wx.removeStorageSync('userInfo')
       wx.setStorageSync('userInfo', res.data)
    })
  },

  login(){
    // 登录
    wx.login({
      success: async res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        const {code} = res
        await request.post('/kdy/login',{
          code
        }).then((res)=>{
          //console.log(res)
          const {token,user_id} = res.data
          wx.setStorageSync("token", token)
        })
      }
    })
  },

   /*函数节流*/
   throttle: function (fn, interval) {
    var enterTime = 0; //触发的时间
    var gapTime = interval || 300; //间隔时间，如果interval不传，则默认300ms
    return function () {
      var context = this;
      var backTime = new Date(); //第一次函数return即触发的时间
      if (backTime - enterTime > gapTime) {
        fn.call(context, arguments);
        enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
      }
    };
  },
  /*函数防抖*/
  debounce: function (fn, interval) {
    var timer;
    var gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
    return function () {
      clearTimeout(timer);
      var context = this;
      var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
      timer = setTimeout(function () {
        fn.call(context, args);
      }, gapTime);
    };
  },
  checkForUpdate: function () {

    const updateManager = wx.getUpdateManager()

    updateManager.onUpdateReady(function () {

      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })

    })

    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '提示',
        content: '检查到有新版本，但下载失败，请检查网络设置',
        showCancel: false,
      })
    })

  },
  // 设置监听器
watch: function (ctx, obj) {
  Object.keys(obj).forEach(key => {
   this.observer(ctx.data, key, ctx.data[key], function (value) {
    obj[key].call(ctx, value)
   })
  })
 },
 // 监听属性，并执行监听函数
 observer: function (data, key, val, fn) {
  Object.defineProperty(data, key, {
   configurable: true,
   enumerable: true,
   get: function () {
    return val
   },
   set: function (newVal) {
    if (newVal === val) return
    fn && fn(newVal)
    val = newVal
   },
  })
 } ,
  globalData:{
    wx_userInfo:'', //微信用户信息
    getUserProfile:'',
    getUserInfo:"",
    profile_user:''
  }
})
