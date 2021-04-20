// main/pages/detail/detail.js
import Request from '../../utils/request'
const request = new Request({
  baseURL: '',
  withBaseURL: true
})

const app = getApp()

const createRecycleContext = require('miniprogram-recycle-view')

let ctx
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currPage:1,
    list:[],
    pageSize:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    
    this.fetchData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    ctx = createRecycleContext({
      id: 'recycleId',
      dataKey: 'recycleList',
      page: this,
      itemSize: this.itemSizeFunc
    })
    ctx.append(this.data.list)
  },

  itemSizeFunc (item, idx) {
    console.log(item)
      return {
          width: 162,
          height: 182
      }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  upper(){

  },

  lower(){

  },

  async fetchData(){

    wx.showLoading({
      title: '加载中...',
    })
    await request.get('/kdy/balanceInfo',{
      page:this.data.currPage,
      limit:9999
    }).then(res=>{
      const {data} = res.data
      this.setData({
        list:[...this.data.list,...data]
      })
    }).finally(()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})