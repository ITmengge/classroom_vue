<template>
  <!-- 添加和修改课时表单 -->
  <el-dialog :visible="dialogVisible" title="添加课时" @close="close()">
    <el-form :model="video" label-width="120px">
      <el-form-item label="课时标题">
        <el-input v-model="video.title"/>
      </el-form-item>
      <el-form-item label="课时排序">
        <el-input-number v-model="video.sort" :min="0" />
      </el-form-item>
      <el-form-item label="是否免费">
        <el-radio-group v-model="video.isFree">
          <el-radio :label="0">免费</el-radio>
          <el-radio :label="1">默认</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 上传视频 -->
      <el-form-item label="上传视频">
        <!-- <el-upload
          ref="upload"
          :auto-upload="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-exceed="handleUploadExceed"
          :file-list="fileList"
          :limit="1"
          :before-remove="handleBeforeRemove"
          :on-remove="handleOnRemove"
          :action="BASE_API+'/admin/vod/upload'">
          <el-button slot="trigger" size="small" type="primary">选择视频</el-button>
          <el-button
            :disabled="uploadBtnDisabled"
            style="margin-left: 10px;"
            size="small"
            type="success"
            @click="submitUpload()">上传</el-button>
        </el-upload> -->
        <el-upload
          ref="upload"
          :auto-upload="false"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-exceed="handleUploadExceed"
          :file-list="fileList"
          :limit="1" 
          :before-remove="handleBeforeRemove"
          :on-remove="handleOnRemove"
          :on-change="handleChange" 
          :action="BASE_API+'/admin/vod/upload'">
              <!-- action="#"> -->
              <el-button slot="trigger" size="small" type="primary">选择视频</el-button>
              <el-button :disabled="uploadBtnDisabled" style="margin-left: 20px;" size="small" type="success" @click="submitUpload()">点击上传</el-button>
              <!-- <el-progress class="progress" :text-inside="true" :stroke-width="18" :percentage="progress" status="exception"></el-progress> -->
            <!-- <div slot="tip" class="el-upload__tip">只能上传mp4文件，且不超过500M</div> -->
          </el-upload>
          <!-- <video :src="videoURL" id="video" autoplay></video> -->
          <!-- <img id="video_img" style="width:90px;height:160px;display:none"> -->
      </el-form-item>
      
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close()">取 消</el-button>
      <el-button type="primary" @click="saveOrUpdate()">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import videoApi from '@/api/vod/video'
import vodApi from '@/api/vod/vod'
import TcVod from 'vod-js-sdk-v6'

export default {
  data() {
    return {
      BASE_API: 'http://localhost:8301',
      dialogVisible: false,
      video: {
        sort: 0,
        free: false
      },
      // fileList: [], // 上传文件列表
      uploadBtnDisabled: false,
      // 文件列表
      fileList: [],
      // 上传成功后的地址
      videoURL: '',
      // 进度条百分比
      progress: 0,
      // base64图片地址  注：这个是项目需要设置一个默认的视频封面，不需要的忽略就行
      imgBase: '',
      // 上传视频获取成功后拿到的fileID【备用】
      fileId: ''
    }
  },
  created(){

  },
  methods: {
    open(chapterId, videoId) {
      this.dialogVisible = true
      this.video.chapterId = chapterId
      if (videoId) {
        videoApi.getById(videoId).then(response => {
          this.video = response.data
          // 回显
          if (this.video.videoOriginalName) {
            this.fileList = [{ 'name': this.video.videoOriginalName }]
          }
        })
      }
    },
    close() {
      this.dialogVisible = false
      // 重置表单
      this.resetForm()
    },
    resetForm() {
      this.video = {
        sort: 0,
        free: false
      }
      this.fileList = [] // 重置视频上传列表
    },
    saveOrUpdate() {
      if (!this.video.id) {
        this.save()
      } else {
        this.update()
      }
    },
    save() {
      this.video.courseId = this.$parent.$parent.courseId
      videoApi.save(this.video).then(response => {
        this.$message.success(response.message)
        // 关闭组件
        this.close()
        // 刷新列表
        this.$parent.fetchNodeList()
      })
    },
    update() {
      videoApi.updateById(this.video).then(response => {
        this.$message.success(response.message)
        // 关闭组件
        this.close()
        // 刷新列表
        this.$parent.fetchNodeList()
      })
    },
    // 上传多于一个视频
    handleUploadExceed(files, fileList) {
      this.$message.warning('想要重新上传视频，请先删除已上传的视频')
    },
    // 上传
    submitUpload() {
      if (this.fileList.length < 1) return this.$MessageBox('请先选取视频，再进行上传', '提示')
      this.uploadBtnDisabled = true
      this.$refs.upload.submit() // 提交上传请求

      // console.log(this.fileList[0].raw)
      if (this.fileList.length < 1) {
        window.alert('您还没有选取文件')
      } else {
      	//必须以函数的形式返回  sdk参数限制
        const getSignature = async () => {
          const data = await this.getVodSignature()
          return data
        }
        const tcVod = new TcVod({
          getSignature: getSignature // 获取上传签名的函数
        })
        // 获取通过elementui上传到本地的文件  因为参数类型必须为file 不能直接以对象的形式传输
        const mediaFile = this.fileList[0].raw
        const uploader = tcVod.upload({
          mediaFile: mediaFile
        })
        // 监听上传进度
        uploader.on('media_progress', info => {
          this.progress = parseInt(info.percent * 100)
        })
        // 上传结束时，将url存到本地
        uploader.done().then(doneResult => {
          // 保存地址
          this.fileId = doneResult.fileId
          this.videoURL = doneResult.video.url
          // console.log('视频ID是：' + this.fileId)
          this.video.videoSourceId = doneResult.fileId
          // // 将视频的第一帧保存为封面  不需要封面的可以直接忽略掉以下代码
          // const canvas = document.createElement('canvas')
          // const img = document.getElementById('video_img')
          // const video = document.getElementById('video')
          // video.setAttribute('crossOrigin', 'anonymous')
          // canvas.width = video.clientWidth
          // canvas.height = video.clientHeight
          // video.onloadeddata = (res) => {
          //   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
          //   const dataURL = canvas.toDataURL('image/png')
          //   img.setAttribute('src', dataURL)
          //   // 拿到base64的字符串，并保存到本地
          //   this.imgBase = dataURL.split(',')[1]
          // }
        })
      }
    },
    // 视频上传成功的回调
    handleUploadSuccess(response, file, fileList) {
      this.uploadBtnDisabled = false
      this.video.videoSourceId = response.data
      this.video.videoOriginalName = file.name
    },
    // 失败回调
    handleUploadError() {
      this.uploadBtnDisabled = false
      this.$message.error('上传失败2')
    },
    // 删除视频文件确认
    handleBeforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    // 执行视频文件的删除
    handleOnRemove(file, fileList) {
      if (!this.video.videoSourceId) {
        return
      }
      vodApi.removeByVodId(this.video.videoSourceId).then(response => {
        this.video.videoSourceId = ''
        this.video.videoOriginalName = ''
        videoApi.updateById(this.video)
        this.$message.success(response.message)
      })
      // console.log(file, fileList.length)
    },

    // 获取签名  这里的签名请求是由后端提供的，只需要拿到后端给的签名请求即可
    getVodSignature () {
      return vodApi.getSign().then(response => {
        return response.data
      })
    },
    // 文件列表改变时  将文件列表保存到本地
    handleChange (file, fileList) {
      this.fileList = fileList
    },
  }
}
</script>