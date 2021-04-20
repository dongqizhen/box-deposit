const app = getApp()
// pages/login-frame/login-frame.js
import Request from '../../utils/request'
const request = new Request({
  baseURL: '',
  withBaseURL: true
})
let openid = "";
let session_key = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 1,
    collected: '',
    phonenums: '',
    avatar_url: ""
  },

  changeOil: function (e) {
    // console.log(e);
    this.setData({
      num: e.target.dataset.num,
      collected: e.target.dataset.num
    })
  },
  phonelogin: function () {
    wx.redirectTo({
      url: '../phone-login/phone-login'
    })
  },
  nonelogin: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //登陆注册用户头像信息
 async register(){
    const {encryptedData,iv,rawData,signature} = app.globalData.profile_user
    await request.post('/kdy/register',{
      rawData,
      iv,
      encryptedData,
      signature
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },
  //微信快速登录
  async getPhoneNumber (e) {
    console.log(e)
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      const {iv,encryptedData} = e.detail
      const res = await request.post("/kdy/bindPhone",{
          iv,
          encryptedData
      })

      const {code,mes} = res.data
      if(code == 0){
        wx.setStorageSync('isLogin', true)
        await app.globalData.getUserInfo()
        await this.register()
        wx.navigateBack({
          delta: 0,
        })
      }else{
        wx.showToast({
          title: mes,
          icon: "none",
          duration: 3000,
        })
      }
    } else {
      
    }

  },
  //手机号码登录


})