<template>
    <div  class="app-container">
        <div class="el-toolbar">
            <div class="el-toolbar-body" style="justify-content: flex-start;">
            <el-button type="text" @click="exportData"><i class="fa fa-plus"/> 导出</el-button>
            <el-button type="text" @click="importData"><i class="fa fa-plus"/> 导入</el-button>
            <!--  dialogImportVisible 判断是否需要弹出-->
            <el-dialog title="导入" :visible.sync="dialogImportVisible" width="400px" height="400px">
                <el-upload
                    class="upload-demo"
                    drag
                    :on-success="onUploadSuccess"
                    :on-error="onUploadError"
                    action="http://localhost:8301/admin/vod/subject/importData"
                    multiple
                    show-file-list="fasle">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogImportVisible = false">取消</el-button>
                </div>
            </el-dialog>
            </div>
        </div>
        <el-table
            :data="list"
            style="width: 100%"
            row-key="id"
            border
            lazy
            :load="load"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column
            prop="title"
            label="名称"
            width="150">
            </el-table-column>
            <el-table-column
            prop="createTime"
            label="创建时间">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import subjectApi from "@/api/vod/subject";
export default {
    data(){
        return{
            list: [],
            dialogImportVisible: false,
        }
    },
    created(){
        this.getSubject(0)
    },
    methods: {
        // 获得课程列表
        getSubject(id){
            subjectApi.getChildList(id).then(response => {
                this.list = response.data
            })
        },
        // 获得课程列表的下层数据
        load(tree, treeNode, resolve){
            subjectApi.getChildList(tree.id).then(response => {
                resolve(response.data)
            })
        },
        // 弹出一个框，进行课程分类的导出
        exportData() {
            window.open("http://localhost:8301/admin/vod/subject/exportData")
        },
        importData(){
            this.dialogImportVisible = true
        },
        onUploadSuccess(){
            this.$message.info('上传成功')
            this.dialogImportVisible = false
            // 上传成功后要查询一次课程分类
            this.getSubject(0)
        },
        onUploadError(){
            this.$message.info('上传失败')
        }
    }
}
</script>