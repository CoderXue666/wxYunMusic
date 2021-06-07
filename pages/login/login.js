// pages/login/login.js
//1.收集表单项数据
//2.前端验证
//  验证用户信息是否合法
//  前端验证不通过提示用户，不发起请求

//3.后端验证
// 验证用户是否存在
// 用户不存在直接返回，告诉前端
// 用户存在需要验证密码是否正确
// 密码不正确返回给前端提示密码不正确
// 密码正确返回给前端数据，提示用户登录成功(会携带用户相关信息)
import request from '../../utils/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: '',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  //表单内容发生改变的回调
  handleInput(event){
    //let type = event.currentTarget.id;
    let type = event.currentTarget.dataset.type;
    this.setData({
      [type]: event.detail.value
    })
  },

  //登录的回调
  async login(){
    //1.收集表单项数据
    let {phone,password} = this.data;

    if (!phone){
      wx.showToast({
        //提示用户
        title: '手机号不能为空',
        icon: 'none'
      })
      return;
    }

    //定义正则表达式
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    if(!phoneReg.test(phone)){
      wx.showToast({
        //提示用户
        title: '手机号格式错误',
        icon: 'none'
      })
      return;
    }

    if(!password){
      wx.showToast({
        //提示用户
        title: '密码不能为空',
        icon: 'none'
      })
      return;
    }

    //后端验证
    let result = await request('/login/cellphone',{phone,password,isLogin: true})
    if(result.code === 200){
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      //将用户的信息存储至本地
      wx.setStorageSync('userInfo',JSON.stringify(result.profile))

      //跳转至个人中心页
      wx.reLaunch({
        url: '/pages/personal/personal'
      })
    }else if(result.code === 502){
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }else {
      wx.showToast({
        title: '登录失败，请重新登录',
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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