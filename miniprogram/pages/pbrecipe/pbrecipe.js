
// 引入公共模块
let {TB,adminOpenid} = require('../../utils/config');
let api = require('../../utils/api');
const { db } = require('../../utils/api');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始化图片展示列表
    files:[],
    // 初始化需要上传到云端的临时路径
    uploadTempFiles:[],
    //初始化菜谱分类数据
    typeList:[],
    // 提交提示开关
    loadBuffer:false
  },
  
  // 定义获取菜谱分类数据方法
  async getType(){
    let typeList = await api.findAll(TB.T)
    this.setData({typeList:typeList.data})
  },

  onLoad(){
    this.setData({
        selectFile: this.selectFile.bind(this),
        uplaodFile: this.uplaodFile.bind(this)
    })

    // 获取菜谱分类数据
    this.getType();
  },

  // 选择图片触发  用来过滤不合法的图片资源
  selectFile(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
  },

  // 执行图片上传触发  最后返回promise resolve()
  uplaodFile(files) {
      console.log('upload files', files)
      // 文件上传的函数，返回一个promise
      return new Promise((resolve, reject) => {
          resolve({urls:files.tempFilePaths})
      })
  },

  // 上传失败触发
  uploadError(e) {
    console.log('upload error', e.detail)
  },
  // 上传成功触发
  uploadSuccess(e) {
      console.log(this.data.files)
      console.log('upload success', e.detail)
      // 将获取到的临时图片路径存入uploadTempFiles
      this.setData({
        uploadTempFiles:this.data.uploadTempFiles.concat(e.detail.urls)
      })
  },

  // 图片删除
  binddelete(e){
    let index = e.detail.index;
    this.data.uploadTempFiles.splice(index,1);
    this.setData({
      uploadTempFiles:this.data.uploadTempFiles
    })
  },

  

  // 处理图片批量上传云端
  async uploadYun(filesArray){

    let promiseArray = filesArray.map((item,index)=>{

      // 获取图片的新名字
      let suffix = /.\w+$/.exec(item)[0];
      let newImg = new Date().getTime()+'_'+index+suffix
      return wx.cloud.uploadFile({
        cloudPath: '20201102bj/'+newImg, // 上传至云端的路径
        filePath: item, // 小程序临时文件路径
      })
    })

    let fileIdArray = await Promise.all(promiseArray);

    let filesIdArray = fileIdArray.map((item)=>{
      return item.fileID
    })

    return filesIdArray;
   
  },

  // 菜谱提交
  async submit(e){

    // 开启提示开关
    this.setData({loadBuffer:true})

    // 获取表单数据
    let {recipename,recipetypeid,recipestep} = e.detail.value;

    // 判断是否为空
    if(recipename.trim() == '' || recipetypeid.trim() == '' || recipestep.trim() == ''){
      wx.showToast({
        title: '请填写信息！',
        icon:'none'
      });return;
    };

    //提示用户
    wx.showToast({
      title: '小编努力记录中...',
    })
    
    // 处理图片批量上传
    let filesIdArray = await this.uploadYun(this.data.uploadTempFiles)

    // 组装添加数据
    let inserData = {
      recipename,
      recipetypeid,
      recipestep,
      follow:0,
      visiter:0,
      time:new Date(),
      filesIdArray
    }

    // 执行添加操作
    let addStatus = await api.addOne(TB.R,inserData);
    if(addStatus._id){
      wx.showToast({
        title: '发布成功',
      })

      // 延时跳转到个人中心页面
      setTimeout(()=>{
        wx.switchTab({
          url: '../my/my',
        })
      },1000)
    }else{
      wx.showToast({
        title: '发布失败，请重试',
        icon:'none'
      })
    }

    // 关闭提示开关
    this.setData({loadBuffer:false})
  },




})