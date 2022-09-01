import request from '@/utils/request'

const api_name = '/admin/vod'

export default {
  //删除视频
  removeByVodId(id) {
    return request({
      url: `${api_name}/remove/${id}`,
      method: 'delete'
    })
  },
  // 返回客户端上传视频签名
  getSign(){
    return request({
      url: `${api_name}/sign`,
      method: 'get'
    })
  }
}