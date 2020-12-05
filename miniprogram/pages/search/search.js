// 引入公共模块
let {TB,adminOpenid} = require('../../utils/config');
let api = require('../../utils/api');
const { db } = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始化热门搜索数据
    hortSearch:[],
    // 初始化历史搜索数据
    hisSearch:[],
    // 控制历史数据开关
    hisBuffer:true,
    // 初始化搜索关键词
    value:''
  },


  // 搜索
  search(e){

    // 解构获取搜索关键词 
    let {value} = this.data;
    let name = e.currentTarget.dataset.name || '';
    
    // 判断搜索关键词是否为空
    if(value.trim() == '' && name == ''){
      wx.showToast({
        title: '请输入菜谱名称！',
        icon:'none'
      });return;
    }

    
    let keywords = value == '' ? name : value
    // console.log(keywords)


    // 判断缓存中是否存在该搜索关键词
    let hisData = wx.getStorageSync('history') || [];
    let index = hisData.findIndex((item)=>{
      return item == keywords;
    })

    // 如果没有该关键词就写入缓存 始终都是最新的6条数据
    if(index ==-1){
        // 截取缓存数组前5条数据
        let data = hisData.splice(0,5);
        data.unshift(keywords);
        // 重新缓存到本地中
        wx.setStorageSync('history',data)
    }

    
    // 跳转到菜谱列表页面 
    wx.navigateTo({
      url: '../list/list?keywords='+keywords,
      success:res=>{
        this.setData({value:''})
      }
    })


  },
  // 加载完一次后就不会执行
  onLoad(){
    
  },

  // 只要页面变化了每次都会执行
  onShow(){
    // 获取热门搜索数据(visiter )以及历史搜索数据(缓存)
    this.getHortSearch();
    this.getHisSearch();
    console.log('触发onshow')
  },

  // 获取热门搜索数据 visiter 倒序查询  this.setData({}) 1024KB
  async getHortSearch(){
    let hortSearch = await api.findPage(TB.R,1,9,{},{fileds:'visiter',sort:'desc'});
    this.setData({hortSearch:hortSearch.data})
  },

  // 获取缓存中搜索历史数据
  getHisSearch(){
    
    // ['鸡肉','鱼肉','鸡蛋'] 
    let hisSearch = wx.getStorageSync('history') || [];
    if(hisSearch.length == 0){
      this.setData({hisBuffer:false})
    }else{
      this.setData({hisSearch,hisBuffer:true})
    }
  }
   
  
})