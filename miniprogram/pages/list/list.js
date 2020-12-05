
// 引入公共模块
let {TB,adminOpenid} = require('../../utils/config');
let api = require('../../utils/api');
const { db } = require('../../utils/api');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists:[],
    // 初始化页面
    page:1,
    // 初始化分页偏移量
    pageSize:6,
    // 定义控制上拉加载开关
    loadBuffer:true,
    // 定义控制展示数据开关
    dataBuffer:true,
    // 初始化查询条件
    where:{}
  },

   // 跳转到菜谱详情页面
   getdesc(e){
    // 获取菜谱详情id
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id='+id,
    })
},

  onLoad(options){
    

    // 提示数据加载中
    wx.showLoading({
      title: '数据拉取中...',
    })

    // 获取分类id
    let recipetypeid = options.typeid || '';

    // 获取分类标题
    let title = options.typename || '搜索列表';

    // 获取搜索关键词
    let keywords = options.keywords || '';

    //  动态设置where查询条件
    let where = {};

    if(keywords == ''){//是从分类列表页面跳转过来
      where = {recipetypeid}
    }else{//是从搜索页面跳转过来  模糊匹配查询
      where={
        recipename:api.db.RegExp({
          regexp: keywords
        })
      }
    }

    this.data.where = where;

    // 动态设置标题
    wx.setNavigationBarTitle({title})

    // 根据where条件获取对应的菜谱数据
    this.getRecipeList()
  },

  // 获取菜谱数据
  async getRecipeList(){

    // 通过解构获取data中基本参数
    let {page,pageSize,where} = this.data;
    let listData = await api.findPage(TB.R,page,pageSize,where);

    // 判断是否需要展示数据
    if(listData.data.length == 0 && page==1){
      this.setData({dataBuffer:false});
      // 关闭提示
      wx.hideLoading()
      return;
    }
    

    // 判断是否支持上拉
    if(listData.data.length<pageSize){
      this.setData({loadBuffer:false});
    }

    // 向获取到的菜谱数据中追加发布菜谱的用户信息数据（头像、昵称）
    let recipeData = await api.getRecipeUser(listData.data)
    
    // 给页面赋值
    this.setData({
      lists:this.data.lists.concat(recipeData)
    })

    // 关闭提示
    wx.hideLoading()

    // 关闭更新
    wx.stopPullDownRefresh()
    
  },



  // 监听下拉刷新事件
  onPullDownRefresh(){
    // 提示用户
    wx.showLoading({
      title: '数据更新中...',
    })

    // 将页面重新赋值为第一页即可 
    this.data.page = 1;

    // 进页面数据赋空
    this.data.lists = [];

    // 将加载开关打开
    this.setData({loadBuffer:true})

    setTimeout(()=>{
      this.getRecipeList();
    },500)
    
  },

  // 设置监听上拉触底事件
  onReachBottom(){
    if(this.data.loadBuffer){
      // 提示数据加载中
      wx.showLoading({
        title: '数据拉取中...',
      })
      ++this.data.page;
      
      setTimeout(()=>{
        this.getRecipeList();
      },500)
    }
  }
})