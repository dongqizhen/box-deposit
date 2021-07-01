// main/pages/me/me.js
const app = getApp()
import date from "../../utils/time"

import Request from '../../utils/request'
const request = new Request({
  baseURL: '',
  withBaseURL: true
})

const showToast = (title,icon='none') =>{

  return new Promise((resolve,reject)=>{
    wx.showToast({
      title,
      icon,
      success:()=>{
        resolve()
      }
    })
  })
  
}

const modals={
  modal1:{
    title:'确认开箱？',
    cancelText:'取消',
    confirmText:'确认开箱',
    content:'请确认自己已在柜体旁！'
  },
  modal2:{
    title:'格口已打开',
    cancelText:'',
    confirmText:'已完成取走',
    content:'请取走物品，并关闭格口。'
  },
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal:false,
    modal:modals.modal1,
    currentIndex: 0,
    currentPage:1,
    avatarUrl:'',
    box_cell_id:'',
    box_id:'',
    nickName:'',
    rest:'',//余额
    hasUserInfo: false,
    "firstList": [],
    "secondList": [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow () {
    this.getTabBar().init();

   if(!wx.getStorageSync('isLogin'))  return
    
    const {nickName,avatarUrl}= wx.getStorageSync('wx_userInfo')
   
    if(wx.getStorageSync('isLogin')){
      await app.getUserInfo()
      const {get_kdy_user_info} = wx.getStorageSync('userInfo')
      this.setData({
        hasUserInfo:true,
        nickName,
        avatarUrl,
      })
      if(get_kdy_user_info != null){
        this.setData({
          rest:get_kdy_user_info.balance
        })
      }else{
        
        return
      }
     
    }

    // this.setData({
    //   firstList:[],
    //   secondList:[]
    // })

    this.getSaveList()

    
    
  },

  cancel(){
    this.setData({
      showModal:false
    })
  },

  async confirm(){
    const {modal,box_cell_id} = this.data

    //如果是开箱
    if(modal.title == modals.modal2.title){
      await request.get('/lockStatus',{
        box_cell_id
      }).then(async res=>{
        const {code,mes} = res.data
        if(code == 10102){
          this.setData({
            showModal:false,
            modal:modals.modal1
          })
          await app.getUserInfo()
          const {get_kdy_user_info} = wx.getStorageSync('userInfo')
          if(get_kdy_user_info != null){
            this.setData({
              rest:get_kdy_user_info.balance
            })
            this.getSaveList()
          }else{
            showToast('请与运营商联系')
          }
        }else{
          showToast(mes)
        }
      })
      return
    }
    wx.scanCode({
      //onlyFromCamera: true,
      success:async (res)=>{
        const {path,errMsg} = res

        if(!path){
          wx.showToast({
            title: '二维码不匹配',
            icon:'none',
            duration:3000
          })
          return
        }

        const box_id = path.split('=')[1]
        if(box_id == this.data.box_id){
          const reso = await request.get('/openBoxButton',{
            box_cell_id,
            type:5,
          })

          const {timestamp,signature} = reso.data

          await request.post('/openBoxV2',{
            box_cell_id,
            type:5,
            timestamp,
            signature
          }).then(res=>{
            const {code,mes} = res.data
            if(code == 10021){
              this.setData({
                modal:modals.modal2
              })
            }else{

            }
          }) 
          
        }
      },
      fail:()=>{
        this.setData({
          showModal:false
        })
      }
    })
  },

  callphone(e){
    console.log(e)
    const {phone:phoneNumber} = e.currentTarget.dataset
    wx.makePhoneCall({
      phoneNumber,
    })
  },

  lower(e){
    // this.setData({
    //   currentPage:this.data.currentPage + 1
    // })
    // this.getSaveList()
  },

  bindrefresherpulling(e){
    console.log(e)
    
  },

  upper(e){
    console.log(e)
    // this.getSaveList()
  },

  openbox(e){
    console.log(e)
    const {dataset:{box_cell_id,box_id}} = e.currentTarget
    this.setData({
      showModal:true,
      box_cell_id,
      box_id
    })

    
  },

  async getSaveList(){
    const {currentPage:page,currentIndex} = this.data
    const type = currentIndex == 0 ? 1 :0

    if(!wx.getStorageSync('isLogin')){
      return
    } 

    const {get_kdy_user_info} = wx.getStorageSync('userInfo')

    if(get_kdy_user_info == null ){
      showToast('请与运营商联系')
      return
    }

    if(page == 1){
      // this.setData({
      //   firstList:[],
      //   secondList:[]
      // })
    }
  
    if(!this.data.hasUserInfo) return

    // wx.showLoading({
    //   title: '加载中...',
    // })
    await request.get('/kdy/saveList',{
      type,
      page,
      limit:9999
    }).then(res=>{
      const {data} = res.data
      let {secondList,firstList} = this.data
      if(type == 0){
        this.setData({
          secondList : [...data]
        })
      }else{
        this.setData({
          firstList : [...data]
        })
      }
    }).finally(()=>{
      // wx.hideLoading({
      //   success: (res) => {},
      // })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  async login(){
    if(!this.data.hasUserInfo){
      const wx_userInfo = wx.getStorageSync('wx_userInfo')
      if(!wx_userInfo){
        await app.globalData.getUserProfile()
      }
      wx.navigateTo({
        url: '../login-frame/login-frame',
      })
    }
  },

  //swiper切换时会调用
  pagechange: function (e) {
    if ("touch" === e.detail.source) {
      let currentPageIndex = this.data.currentIndex
      currentPageIndex = (currentPageIndex + 1) % 2
      this.setData({
        currentIndex: currentPageIndex,
      })
      this.getSaveList()
    }
  },
  //用户点击tab时调用
  titleClick: function (e) {
    let currentPageIndex =
      this.setData({
        //拿到当前索引并动态改变
        currentIndex: e.currentTarget.dataset.idx,
    })
    this.getSaveList()
  },

  check_detail(){
    if(!this.data.hasUserInfo){
      this.login()
      return
    }
    wx.navigateTo({
      url: '../detail/detail',
    })
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