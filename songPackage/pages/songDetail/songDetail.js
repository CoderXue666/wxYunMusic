// pages/songDetail/songDetail.js
import pubsub from 'pubsub-js';
import moment from 'moment';
import request from '../../../utils/request.js'
const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//音乐是否播放标识
    song: {},//歌曲详情对象
    musicId: '',//音乐的id
    musicLink: '',// 音乐播放链接
    currentTime: '00:00',//实时时间
    durationTime: '00:00',//总时长
    currentWidth: 0,//进度条
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options用于接收query参数
    console.log(options)
    let musicId = options.musicId;
    this.setData({
      musicId
    })
    //获取音乐详情
    this.getMusicInfo(musicId);


    //判断当前页面歌曲是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      this.setData({
        isPlay: true
      })
    }

    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true);
      //修改全局音乐播放状态
      appInstance.globalData.musicId = musicId;
    });


    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false);
    });

    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false);
   });

   //监听音乐播放结束
   this.backgroundAudioManager.onEnded(() => {
     
    //自动切换至下一首音乐
    pubsub.publish('switchType','next');

    pubsub.subscribe("musicid", (msg, musicid) => {
      // console.log(musicid);
      // 取消订阅,避免多次重复
      pubsub.unsubscribe("musicid")
      //获取最新歌曲信息 
      this.getmusicinfo(musicid);
      // 关闭当前音乐
      this.backgroundAudioManager.stop();
      // 自动播放最新音乐
      this.musicControl(true, musicid)
    })

    //将实时进度条进度还原0
    this.setData({
      currentWidth: 0,
      currentTime: '00:00'
    })
 });

   //监听音乐播放进度
   this.backgroundAudioManager.onTimeUpdate(() => {
     //格式化实时播放时间
     let currentTime = moment(this.backgroundAudioManager.currentTime* 1000).format('mm:ss');
     let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration*450;
     this.setData({
      currentTime,
      currentWidth
     })
   })
  },

  //修改播放状态功能函数
  changePlayState(isPlay){
    //修改音乐播放状态
    this.setData({
      isPlay
    })

     //修改全局音乐播放状态
     appInstance.globalData.isMusicPlay = isPlay;
  },

  //获取音乐详情的功能函数
  async getMusicInfo(musicId){
    let songData = await request('/song/detail',{ids: musicId});

    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime
    })

    //动态获取歌曲标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },

  //播放/暂停
  handleMusicPlay(){
    let isPlay = !this.data.isPlay;
    // this.setData({
    //   isPlay
    // })

    let {musicId,musicLink} = this.data
    this.musicControl(isPlay,musicId,musicLink);
  },

  //控制音乐播放/暂停
  async musicControl(isPlay,musicId,musicLink){
    let backgroundAudioManager = wx.getBackgroundAudioManager();
    if(isPlay){
      if(!musicLink){
        //获取音乐播放链接
      let musicLinkData = await request('/song/url',{id: musicId});
      musicLink = musicLinkData.data[0].url;

      this.setData({
        musicLink
      })
      }
      //创建控制音乐播放的实例对象
    backgroundAudioManager.src = musicLink;
    backgroundAudioManager.title = this.data.song.name;
    }else{
      backgroundAudioManager.pause();
    }
  },

  //点击切歌的回调
  handleSwitch(event){
    let type = event.currentTarget.id;
    //关闭当前播放的音乐
    this.backgroundAudioManager.stop();

    pubsub.subscribe('musicId',(msg, musicId) => {

      //获取音乐详情信息
      this.getMusicInfo(musicId);
      //自动播放当前音乐
      this.musicControl(true,musicId);
      //取消订阅
      pubsub.unsubscribe('musicId');
    })

    //发布消息数据
    pubsub.publish('switchType', type)
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