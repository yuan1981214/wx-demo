
// 引入公共模块
let {TB,adminOpenid} = require('../../utils/config');
let api = require('../../utils/api');
const { db } = require('../../utils/api');


// pages/type/type.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始化菜谱分类数据
    types:[],
    // 初始化页面
    page:1,
    // 初始化分页偏移量
    pageSize:9,
    // 定义控制上拉加载开关
    loadBuffer:true
  },

  // 定义获取分页获取菜谱数据方法
  async getTypePage(){

    let {page,pageSize} = this.data;
 
    let types = await api.findPage(TB.T,page,pageSize);
    
    // 判断是否能够下拉
    if(types.data.length<pageSize){
      this.setData({loadBuffer:false})
    }

    this.setData({
      types:this.data.types.concat(types.data) 
    })

    // 关闭数据加载提示
    wx.hideLoading()
  },

  // 跳转到菜谱列表页面
  getlist(e){

    // 获取菜谱分类id
    let {id,name} = e.currentTarget.dataset;

    //跳转到菜谱列表页面  且传递分类id过去
    wx.navigateTo({
      url: '../list/list?typeid='+id+'&typename='+name,
    })
  },

  onLoad(){

    // 提示数据加载中
    wx.showLoading({
      title: '数据加载中...',
    })

    // 获取菜谱分类数据
    this.getTypePage();
  },

  onReachBottom(){
    
    if(this.data.loadBuffer){
      
      // 提示数据加载中
      wx.showLoading({
        title: '数据拉取中...',
      })
      ++this.data.page;
      
      setTimeout(()=>{
        this.getTypePage();
      },500)
      
    }
  },

 
})