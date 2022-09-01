import request from '@/utils/request'

const api_name = '/admin/vod/subject'

export default {
  // 课程分类列表
  getChildList(id) {
    return request({
      url: `${api_name}/getChildrenSubject/${id}`,
      method: 'get'
    })
  },
//   // 课程分类导出
//   exportData(){
//     return request({
//         url: `${api_name}/exportData`,
//         method: 'get'
//       })
//   },
//   // 课程分类导入
//   importData(){
//     return request({
//         url: `${api_name}/importData`,
//         method: 'post'
//       })
//   }
}