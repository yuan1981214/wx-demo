

// 获取操作数据库的db对象
let db = wx.cloud.database();
// 获取数据库操作符
const _ = db.command

/**
 * 封装云函数
 * author:zb
 * time:2020/11/3
 * params:{
 *      name:云函数名称(string)
 *      data:{}
 * }
*/
const yun=(name,data={})=>{
    return wx.cloud.callFunction({
        name,
        data
    })
}


/**
 * 封装根据where查询一条数据方法
 * author:zb
 * time:2020/11/3
 * params:{
 *      table:string
 *      where:{}
 * }
*/
const findWhere=(table,where={})=>{
    return db.collection(table).where(where).get()
}



/**
 * 封装添加一条数据方法
 * author:zb
 * time:2020/11/3
 * params:{
 *      table:string
 *      data:{}
 * }
*/
const addOne=(table,data)=>{
    return db.collection(table).add({data})
}

/* 封装查询数据分页版本
* author:zb
* time:2020/11/3
* params:{
*      table:表名（string）
       where:条件 {}
       page:页码（number）
       pageSize:分页偏移量（number）
*      orderBy:{}
        1  0   6
        2  6   12
* }
*/
const findPage=(table,page,pageSize,where={},orderBy={fileds:'time',sort:'asc'})=>{
    return db.collection(table).where(where).skip((page-1)*pageSize).limit(pageSize).orderBy(orderBy.fileds,orderBy.sort).get()
}
 

/**
 * 封装查询所有数据方法
 * author:zb
 * time:2020/11/3
 * params:{
 *      table:string
 *      
 * }
*/
const findAll= async (table)=>{

    const MAX_LIMIT = 20
    const countResult = await db.collection(table).count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 20)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection(table).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
        }
    })
}



  // 根据菜谱数据中的openid获取对应的用户数据 promise.all
const getRecipeUser = async(recipeData)=>{

    // 获取根据用户openid查询用户数据的promise数组
    let promiseArray = recipeData.map((item)=>{
      // 根据菜谱数据中的openid获取对应的用户数据
      return findWhere('re_user',{_openid:item._openid})
    })

    let userInfo = await Promise.all(promiseArray);

    //循环菜谱数据并追加获取到的用户数据
    recipeData.forEach((item,index)=>{
      item.userinfo = userInfo[index].data[0].userinfo;
    })
    
    // 返回包含用户数据的菜谱数据
    return recipeData;

}



/* 封装根据数据id修改方法
* author:zb
* time:2020/11/3
* params:{
*      table:string
        id:  string
*      data:{}
* }
*/
const editOne=(table,id,data)=>{
   return db.collection(table).doc(id).update({data})
}


/* 封装根据数据id删除方法
* author:zb
* time:2020/11/3
* params:{
*      table:string
        id:  string
*      data:{}
* }
*/
const delOne=(table,id,data)=>{
   return db.collection(table).doc(id).remove()
}




// 导出
module.exports = {
    db,
    _,
    yun,
    findWhere,
    findAll,
    findPage,
    getRecipeUser,
    addOne,
    editOne,
    delOne
}