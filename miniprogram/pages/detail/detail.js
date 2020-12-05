const api = require("../../utils/api");
let {TB} = require('../../utils/config')
// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      imgs:[
        "../../static/detail/1.jpg",
        "../../static/detail/2.jpg",
        "../../static/detail/4.jpg",
        "../../static/detail/6.jpg",
        "../../static/detail/8.jpg",
      ],
      // 初始化菜谱详情数据
      detail:{},
      followBuffer:true,//true:未关注 false:已经关注
      // 初始化关注数据的id
      followId:''
  },

  // 关注/取消关注  
  async follow(){

    // 通过解构获取需要参数
    let {followBuffer,detail} = this.data
    let type=1;

    
    if(followBuffer){//关注
      // 新增数据到follow集合
      let addStatus = await api.addOne(TB.F,{recipeid:detail._id,time:new Date()})
      this.data.followId = addStatus._id
    }else{//取消关注
      type = -1;
      // 根据关注数据的id删除数据
      let delStatus = await api.delOne(TB.F,this.data.followId)
    }

    // 关注或者取消关注后同步菜谱数据的关注量
    let editStatus = await api.editOne(TB.R,detail._id,{follow:api._.inc(type)})

    // 提示用户操作情况
    wx.showToast({
      title: followBuffer ? '关注成功' : '取消成功',
    })

    // 重新设置关注开关
    this.setData({followBuffer:!followBuffer})

  },

  async onLoad(options){

    // 获取菜谱详情id
    let _id = options.id;

    // 需要根据数据id修改菜谱的点击量 
    let editStatus = await api.editOne(TB.R,_id,{visiter:api._.inc(1)})

    // 根据id获取菜谱详情
    let recipeDedail = await api.findWhere(TB.R,{_id})
    let detail = await api.getRecipeUser(recipeDedail.data)
    this.setData({detail:detail[0]})

    // 判断该菜谱是否关注过  openid recipeid
    // 通过云函数获取当前用户的opendid
    let userOpenid = await api.yun('bjyunlogin')
    let followData = await api.findWhere(TB.F,{recipeid:_id,_openid:userOpenid.result.openid})

    if(followData.data.length !=0){//该数据已经关注
      this.setData({followBuffer:false,followId:followData.data[0]._id})
    }
  },

  // 分享给朋友
  onShareAppMessage: function (res) {
    // if (res.from === 'button') {
    //   // 来自页面内转发按钮
    //   console.log(res.target)
    // }
    return {
      title: '菜谱详情页面'
    }
  },
  // 分享到朋友圈
  onShareTimeline(){
    return {
      title: '菜谱详情页面'
    }
  }
})