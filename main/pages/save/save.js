// main/pages/save/save.js
import Request from '../../utils/request'
import '../../utils/index'
import {differenceBy,orderBy,find} from 'lodash'
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
const app = getApp()

const modals={
  modal1:{
    title:'格口已打开',
    cancelText:'放弃',
    confirmText:'我已存入',
    content:'正常投寄后，请关闭箱⻔后2-3秒点击“我已存⼊”完成本次投寄。'
  },
  modal2:{
    title:'放弃本次存件？',
    cancelText:'确认放弃',
    confirmText:'返回',
    content:'如果箱⻔已关，会再次打开。'
  },
  modal3:{
    title:'请取走物品并关箱',
    cancelText:'',
    confirmText:'确认',
    content:'请确保取走物品并关闭箱门。'
  }
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal:false,
    modal:modals.modal1,
    address:'',
    phone:'', //手机号
    name:'', //名字
    order_numer:'', //物流单号
    order_remark:'', //备注
    size:null, //箱子类型,
    box_id:'', //柜子的ID
    box_cell_id:'', //格子口的ID
    disabled:true,
    share_id:'',
    cell:[],
    curr_index:null,
    nobox:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.watch(this,{
      size(newVal){
        this.setData({
          disabled:false
        })
      }
    })

    const {box_id } = options
    this.setData({
      box_id
    })

    //如果未登录则去个人中心
    if(!wx.getStorageSync('isLogin')){
      wx.switchTab({
        url: '../me/me',
      })
      return
    }

    //未登录状态等待登录返回 再执行
    app.loginReadyCallback = (res) =>{
      this.getBoxInfo()
      return
    }

    this.getBoxInfo()
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  async getBoxInfo(box_id){
    wx.showLoading({
      title: '加载中...',
    })
    await request.get('/kdy/boxInfo',{box_id:this.data.box_id}).then(res=>{
      console.log(res)
      let {cell,box:{get_area_info:{name,area_name},town,unit}} = res.data
      this.setData({
        address:name + area_name + town  + unit 
      })
      const _arr = [
        {s_size_id:"1",num:'0',get_size_info:{name:'大箱'}},{s_size_id:"2",num:'0',get_size_info:{name:'中箱'}},{s_size_id:"3",num:'0',get_size_info:{name:'小箱'}}
      ]
      if(cell.length < 3){
       const diff = differenceBy(_arr,cell,'s_size_id')
        if(diff.length){
          cell = [...cell,...diff]
        }
      }

      //判断是否有箱子可用
      const hasbox = find(cell,v=>{
        return v.num > 0
      })

      if(hasbox == undefined){
        this.setData({
          nobox:true
        })
      }
      
      this.setData({
        cell:orderBy(cell,['s_size_id'],'desc')
      })
    }).finally(()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },

  selectBox(e){
    console.log(e)
    const {currentTarget:{dataset:{id,index}}} = e
    this.setData({
      curr_index:index,
      size:id
    })
  },

  scanOrder(){
    wx.scanCode({
      success:res=>{
        console.log(res)
        const {result} = res
        if(result){
          this.setData({
            order_numer:result
          })
        }else{
          showToast('无效物流单号')
        }
      }
    })
  },

  
  async confirm(){

    const {modal} = this.data
    //放弃modal
    if(modal.title == modals.modal2.title){
      this.setData({
        modal:{
          title:'格口已打开',
          cancelText:'',
          confirmText:'',
          content:''
        }
      })
      this.setData({
        modal:modals.modal1
        
      })
      return
    }

    const {box_cell_id} = this.data
    //获取箱子关闭状态
    await request.get('/lockStatus',{
      box_cell_id
    }).then(async res=>{
      const {code,mes} = res.data
      if(code == 10102){
        this.setData({
          showModal:false,
          phone:'',
          name:'',
          order_numer:'',
          order_remark:''
        })
        
        await this.getBoxInfo()

        if(modal.title == modals.modal3.title){
          wx.switchTab({
            url: '../index/index',
          })
          return
        }

        showToast('投递成功','success')
        setTimeout(()=>{
          wx.switchTab({
            url: '../index/index',
          })
        },1500)
        
        
      }else{
        showToast(mes)
      }
    })
  },

  async cancel(){
    const {modal,share_id} = this.data
    
    if(modal.title == modals.modal1.title){
      this.setData({
        modal:{
          title:'放弃本次存件？',
          cancelText:'',
          confirmText:'',
          content:'如果箱⻔已关，会再次打开。'
        }
      })
      this.setData({
        modal:modals.modal2
      })
      return
    }

    await request.post('/kdy/cancelSave',{
      share_id
    })

    this.setData({
      modal:modals.modal3
    })
    
  },


  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {
    if(wx.getStorageSync('isLogin')){
      await app.getUserInfo()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  //开箱
  async open(){
    const wx_userInfo = wx.getStorageSync('wx_userInfo')

    if(!wx_userInfo){
      await app.globalData.getUserProfile()
    }

    if(wx.getStorageSync('isLogin')){
      await app.getUserInfo()
    }

    if(!wx.getStorageSync('isLogin')){
      wx.navigateTo({
        url: '../login-frame/login-frame',
      })
      return
    }

    const {phone,name,order_numer:sn,order_remark:des,box_id,size} = this.data

    if(size == null){
      showToast('请选择箱子类型')
      return
    }

    if(phone.trim()==''){
      showToast('请输入收件人手机号')
      return
    }else{
      if(!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(phone))){
        showToast('请输入正确的手机号')
        return
      } 
    }

    if(sn.trim() == ''){
      showToast('请输入订单号')
      return
    }

    await request.post('/kdy/save',{
      phone,
      name,
      sn,
      des,
      box_id,
      size
    }).then(async res=>{
      console.log(res)
      const {code,mes,box_cell_id,share_id} = res.data
      //打开箱子
      if(code == 0){
        //await showToast('正在发送开箱请求','loading')
        this.setData({
          showModal:true,
          box_cell_id,
          share_id
        })
        return true
      }else{
        showToast(mes)
        return false
      }
    })

    

    // this.setData({
    //   showModal:true
    // })
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