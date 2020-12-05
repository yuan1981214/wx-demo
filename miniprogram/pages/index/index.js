
// 引入公共模块
let {TB,adminOpenid} = require('../../utils/config');
let api = require('../../utils/api');


Page({
    data: {
        types: [
            {
                src: "../../imgs/index_07.jpg",
                typename: "营养菜谱"
            },
            {
                src: "../../imgs/index_09.jpg",
                typename: "儿童菜谱"
            },
        ],
        // 初始化热门菜谱数据
        recipes:[],
    
    
    },
    //跳转到菜谱分类页面
    gettype(){
        wx.navigateTo({
          url: '../type/type',
        })
    },
    //根据菜谱的点击量获取最热菜谱数据 6条
    async getHortRecipe(){

        let recipes = await api.findPage(TB.R,1,6,{},{fileds:'visiter',sort:'desc'})

        // 根据用户的openid获取对应的用户数据
        let recipesData = await api.getRecipeUser(recipes.data) 
        this.setData({recipes:recipesData})
    },

    // 跳转到菜谱详情页面
    getdesc(e){
        // 获取菜谱详情id
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
          url: '../detail/detail?id='+id,
        })
    },

    onLoad(){

        // 获取最热菜谱数据
        this.getHortRecipe();
    },
})