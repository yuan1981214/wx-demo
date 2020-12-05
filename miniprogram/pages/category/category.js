
// 引入公共模块
let {TB,adminOpenid} = require('../../utils/config');
let api = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始化菜谱分类数据
    typeList:[],
    // 定义控制添加开关
    addBuffer:false,
    // 定义控制修改开关  
    editBuffer:false,
    // 初始化value
    value:'',
    // 初始化修改数据
    oldType:{},
    buffer:true
  },

  changeswitch(e){
    this.setData({buffer:e.detail.value})
  },
  

  // 定义获取全部菜谱分类数据方法
  async getType(){
    let typeList = await api.findAll(TB.T)
    this.setData({typeList:typeList.data})
  },

  // 获取添加页面
  add(){
    this.setData({addBuffer:true})
  },

  // 执行添加操作
  async insert(){

    console.log(this.data.buffer);return;

    // 获取value
    let {value,typeList} = this.data;

    // 判断是否为空
    if(value.trim() == ''){
      wx.showToast({
        title: '分类名称不能为空',
        icon:'none'
      });return;
    }

    // 判断菜谱分类名称不能重复 findIndex() -1
    let index = typeList.findIndex((item)=>{
      return item.typename == value;
    })

    if(index != -1){
      wx.showToast({
        title: '分类已经存在',
        icon:'none'
      });return;
    }


    //执行添加
    let addStatus = await api.addOne(TB.T,{typename:value,time:new Date})

    if(addStatus._id){
      wx.showToast({
        title: '编辑成功',
      })
      // 更新页面数据
      this.getType();
      // 重新赋值页面数据
      this.resetData();

    }else{
      wx.showToast({
        title: '编辑失败',
        icon:'none'
      })
    }
  },

  // 获取修改页面及修改数据
  edit(e){

    // 获取需要修改数据的下标
    let index = e.currentTarget.dataset.index;
    this.setData({
      editBuffer:true,
      oldType:this.data.typeList[index],
      value:this.data.typeList[index].typename
    })

  },

  // 执行修改
  async update(){
    // 获取数据
    let {value,oldType} = this.data;

     // 判断是否为空
     if(value.trim() == ''){
      wx.showToast({
        title: '分类名称不能为空',
        icon:'none'
      });return;
    }

    if(value == oldType.typename){
      wx.showToast({
        title: '分类已经存在',
        icon:'none'
      });return;
    }



    // 执行修改
    let editStatus = await api.editOne(TB.T,oldType._id,{typename:value})

    if(editStatus.stats.updated ==1){
      wx.showToast({
        title: '编辑成功',
      })
      // 更新页面数据
      this.getType();
      // 重新赋值页面数据
      this.resetData();

    }else{
      wx.showToast({
        title: '编辑失败',
        icon:'none'
      })
    }
  },

  // 定义给当前页面重新赋值的方法
  resetData(){
    this.setData({
      value:'',
      addBuffer:false,
      editBuffer:false,
      oldType:{}
    })
  },

  // 根据数据id删除
  async delete(e){

    // 获取数据id
    let id = e.currentTarget.dataset.id;

    // 询问是否要删除

    // 执行删除
    let  delStatus = await api.delOne(TB.T,id);
    if(delStatus.stats.removed ==1){
      wx.showToast({
        title: '删除成功',
      })
  
      // 根据数据删除页面的数据节点
      let index = this.data.typeList.findIndex((item)=>{
        return item._id == id
      })
      this.data.typeList.splice(index,1);
      this.setData({typeList:this.data.typeList})

    }else{
      wx.showToast({
        title: '删除失败',
        icon:'none'
      })
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取所有菜谱分类数据
    this.getType();
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