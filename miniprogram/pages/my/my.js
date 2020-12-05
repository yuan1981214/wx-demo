
// 引入公共模块
let {TB,adminOpenid} = require('../../utils/config');
let api = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始化菜单默认下标
    activeIndex:0,
    // 初始化管理员状态
    isAdmin:true,
    // 初始化用户基本信息
    userinfo:{},
    // 登录开关
    isLogin:true, //是否登录。 false 未登录  true，已经登录
    // 我发布的菜谱数据
    myRecipe:[],
    // 我的关注数据
    myFollow:[],
    // 初始化页面
    page:1,
    // 初始化分页偏移量
    pageSize:4,
    // 控制是否展示数据开关
    dataBuffer:true,
    // 控制上拉开关
    loadBuffer:true
  },

  // 根据用户的openid获取关注数据
  async getFollow(){

    // 通过解构获取需要的参数
    let {page,pageSize} = this.data;

    // 获取关注菜谱数据的id  follow表
    let myFollowId = await api.findPage(TB.F,page,pageSize,{_openid:wx.getStorageSync('openid')});

    // 判断是否展示数据
    if(myFollowId.data.length ==0 && page==1){
      this.setData({dataBuffer:false});return;
    }

    // 判断是否可以上拉加载
    if(myFollowId.data.length < pageSize){
      this.setData({loadBuffer:false});
    }
 
    // 根据获取到的关注菜谱id 获取对应的详情数据 recipe表
    let MyFollowRecipe = await this.getRecipeDesc(myFollowId.data)

    // 根据菜谱详情数据中的用户openid再次追加用户信息  user表
    let MyFollowData  = await api.getRecipeUser(MyFollowRecipe);
  

    // 给页面赋值
    this.setData({myFollow:this.data.myFollow.concat(MyFollowData)})

    // 关闭加载提示
    wx.hideLoading()
  },

  // 定义根据菜谱id获取菜谱详情数据方法
  async getRecipeDesc(myFollowId){
    let promiseArray = myFollowId.map((item)=>{
        return api.findWhere(TB.R,{_id:item.recipeid})
    })
    let recipeDesc = await Promise.all(promiseArray);
    // 处理菜谱详情数据格式
    let recipeDescArray = recipeDesc.map((item)=>{
      // console.log(item.data[0])
      return item.data[0]
    })
   return recipeDescArray
  },

  //  根据用户的openid获取用户发布的菜谱数据
  async getMyRecipe(){

    // 通过解构获取需要的参数
    let {page,pageSize} = this.data;
    let myRecipe = await api.findPage(TB.R,page,pageSize,{_openid:wx.getStorageSync('openid')},{fileds:'time',sort:'desc'});

    // 判断是否展示数据
    if(myRecipe.data.length == 0 && page==1){
      this.setData({dataBuffer:false});return;
    }

    // 判断是否能够上拉加载
    if(myRecipe.data.length < pageSize){
      this.setData({loadBuffer:false});
    }

    // 给页面数据赋值
    this.setData({myRecipe:this.data.myRecipe.concat(myRecipe.data)})
    
    // 关闭提示
    wx.hideLoading();
  },

  // 切换功能菜单
  changeMenu(e){
    // 获取菜单下标
    let activeIndex = e.currentTarget.dataset.index;

    // 重新赋值页面数据
    this.data.page=1;
    this.data.myFollow=[];
    this.data.myRecipe=[];
    this.setData({loadBuffer:true,dataBuffer:true,activeIndex})
    if(activeIndex == 0){//获取我的菜谱数据
      this.getMyRecipe();
    }else{//获取我的关注数据
      console.log(333)
      this.getFollow();
    }
  },

  // 跳转到菜谱发布页面
  addrecipe(){
    wx.navigateTo({
      url: '../pbrecipe/pbrecipe',
    })
  },

  // 跳转到菜谱分类管理页面
  gettype(){
    if(this.data.isAdmin){
      // 跳转到菜谱分类管理页面
      wx.navigateTo({
        url: '../category/category',
      })
    }
  },
  
  //微信登录
  wxlogin(e){
    console.log(e)
    // 判断用户是否授权
    if(e.detail.errMsg != 'getUserInfo:ok'){
        wx.showToast({
          title: '请先授权',
        });
        return;
    };

    // 执行微信登录
    wx.login({
      success:async res=>{

          // 获取授权后的用户基本信息
          let userinfo = e.detail.userInfo;
          
          // 通过云函数获取当前用户的opendid
          let userOpenid = await api.yun('bjyunlogin')
          let _openid = userOpenid.result.openid;

          // 根据用户的openid查询用户表
          let userData = await api.findWhere(TB.U,{_openid})

          // 判断该用户是否注册过
          if(userData.data.length == 0){
            // 新增用户数据到re_user表中
            let addStatus = await api.addOne(TB.U,{userinfo})
            if(addStatus._id){
              wx.showToast({
                title: '登录成功',
              })

              // 给页面重新赋值及缓存数据
              this.resetData(userinfo,_openid,adminOpenid)
              // 获取我的菜谱数据
              this.getMyRecipe()
            }else{
              wx.showToast({
                title: '登录失败！',
                icon:'none'
              })
            }
            console.log(addStatus)
          }else{
            wx.showToast({
              title: '欢迎回来！',
            })

            // 给页面重新赋值及缓存数据
            this.resetData(userinfo,_openid,adminOpenid)
            // 获取我的菜谱数据
            this.getMyRecipe()
          }  
      }
    })
  },

  // 登录赋值
  resetData(userinfo,_openid,adminOpenid){
    // 给页面重新赋值
    this.setData({
      isLogin:true,
      userinfo,
      isAdmin:adminOpenid ==_openid ? true :false
    })
    //将用户数据缓存到本地中
    wx.setStorageSync('userinfo', userinfo)
    wx.setStorageSync('openid', _openid)
    wx.setStorageSync('isadmin',adminOpenid ==_openid ? true :false)
  },

  onLoad(){
   
  },

  onShow(){
    // console.log('触发onshow')
    // 检测用户是否登录
    wx.checkSession({
      success:res=> {
          this.setData({
            userinfo:wx.getStorageSync('userinfo'),
            isAdmin:wx.getStorageSync('isadmin')
          })

          // 登录有效获取我的菜谱数据
          this.getMyRecipe();
      },
      fail:err=>{
          // 开启登录按钮
          this.setData({isLogin:false})
          // 清除本地缓存
          wx.removeStorageSync('userinfo')
          wx.removeStorageSync('openid')
          wx.removeStorageSync('isadmin')
      }
    })
  },

  // 监听上拉加载
  onReachBottom(){
    if(this.data.loadBuffer){
      // 提示数据加载
      wx.showLoading({
        title: '数据加载中...'
      })

      // 修改页码
      ++this.data.page;

      if(this.data.activeIndex == 0){
        // 延迟请求
        setTimeout(()=>{
          this.getMyRecipe();
        },500)
      }else{
         // 延迟请求
         setTimeout(()=>{
          this.getFollow();
        },500)
      }
    }
  },

})