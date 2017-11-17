<template>
    <div>
        <el-row :gutter="10" class="mt10">
            <el-col :span="6">
                <el-row :gutter="10">
                    <el-col :span="4">
                        <el-button icon="refresh" onclick="location.reload()">刷新</el-button>
                    </el-col>
                    <el-col :span="6">
                        <el-button @click="$router.push({path:'/about'})">关于我们</el-button>
                    </el-col>
                    <el-col :span="14">
                        <el-rate v-model="rate" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" @change="doRate" :disabled="rate>0" style="margin-top:5px;"></el-rate>
                    </el-col>
                </el-row>
                <el-tabs>
                    <el-tab-pane label="历史">
                        <el-button type="danger" @click="clearHistory" v-show="historyList.length>0">清空</el-button>
                        <ul class="mt10">
                            <li v-for="historyItem in historyList" class="history-item">
                                <a href="javascript:" @click.stop="addTab(historyItem)">
                                    <span :class="'method-' + historyItem.method">{{ historyItem.method.toUpperCase()}}</span>
                                    <span style="color: #8492a6;">{{ historyItem.url }}</span>
                                </a>
                            </li>
                        </ul>
                    </el-tab-pane>
                    <el-tab-pane label="收藏">
                        <el-button type="danger" @click="clearCollection" v-show="collectionList.length>0">清空</el-button>
                        <ul class="mt10">
                            <li v-for="collectionItem in collectionList" class="history-item">
                                <a href="javascript:" @click.stop="addTab(collectionItem)">
                                    <span :class="'method-' + collectionItem.method">{{ collectionItem.method.toUpperCase()}}</span>
                                    <span style="color: #8492a6;">{{ collectionItem.url }}</span>
                                </a>
                            </li>
                        </ul>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
            <el-col :span="18">
                <el-tabs v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit">
                    <el-tab-pane
                            :key="item.name"
                            v-for="(item, index) in editableTabs"
                            :label="item.content.url ? item.content.url : item.title"
                            :name="item.name"
                    >
                        <div class="request">
                            <el-button type="success" @click="addCollection(item.content)">收藏</el-button>
                            <el-input class="mt10" placeholder="Enter request URL" v-model="item.content.url" @keyup.13.self="send(item.content)">
                                <el-select v-model="item.content.method" slot="prepend" placeholder="请选择">
                                    <el-option label="GET" value="get"></el-option>
                                    <el-option label="POST" value="post"></el-option>
                                    <el-option label="PUT" value="put"></el-option>
                                    <el-option label="DELETE" value="delete"></el-option>
                                </el-select>
                                <el-button slot="append" @click="send(item.content)" :loading="loading">发送</el-button>
                            </el-input>
                            <el-tabs class="request-body">
                                <el-tab-pane label="Headers">
                                    <el-table :data="item.content.headers" style="width: 100%">
                                        <el-table-column label="Key">
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.key"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="Value">
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.value"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="Description">
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.description"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" width="200">
                                            <template slot-scope="scope">
                                                <el-button type="success" icon="plus" @click="addHeader(item.content)"></el-button>
                                                <el-button type="danger" icon="minus" @click="removeHeader(item.content, scope.$index)"></el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-tab-pane>
                                <el-tab-pane label="Body" :disabled="item.content.method=='get'">
                                    <el-button type="primary" @click="item.content.dialogVisible = true">构建</el-button>
                                    <el-dialog
                                            title="参数构建"
                                            :visible.sync="item.content.dialogVisible"
                                            size="tiny">
                                        <el-input type="textarea" v-model="item.content.fromData" :rows="10"></el-input>
                                        <el-button type="primary" class="mt10" @click="buildData(item.content)">确定</el-button>
                                    </el-dialog>
                                    <el-table :data="item.content.data" style="width: 100%;margin-top:10px;">
                                        <el-table-column label="Key">
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.key"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="Value">
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.value"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="Description">
                                            <template slot-scope="scope">
                                                <el-input v-model="scope.row.description"></el-input>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="操作" width="200">
                                            <template slot-scope="scope">
                                                <el-button type="success" icon="plus" @click="addData(item.content)"></el-button>
                                                <el-button type="danger" icon="minus" @click="removeData(item.content, scope.$index)"></el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-tab-pane>
                            </el-tabs>
                        </div>

                        <div class="response" v-loading="loading">
                            <el-tabs value="0" class="el-tabs">
                                <el-tab-pane label="Body">
                                        <div class="res-body" v-html="item.content.response.body" v-if="item.content.response.json"></div>
                                        <pre class="res-body" v-else>{{ item.content.response.body }}</pre>
                                </el-tab-pane>
                                <el-tab-pane label="Headers">
                                    <div class="res-header-list">
                                        <div class="res-header-item" v-for="(headerValue, headerKey) in item.content.response.headers">
                                            <b>{{ headerKey }}</b> → {{ headerValue }}
                                        </div>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>

    </div>
</template>

<script>
import jsonMarkup from 'json-markup';
import 'json-markup/style.css'
export default {
    data() {
        let historyList = [];
        for(let i in localStorage) {
            if (i.indexOf('history') > -1) {
                historyList.push(JSON.parse(localStorage.getItem(i)));
            }
        }
        historyList.reverse();
        let collectionList = [];
        for(let i in localStorage) {
            if (i.indexOf('collectionList') > -1) {
                collectionList.push(JSON.parse(localStorage.getItem(i)));
            }
        }
        collectionList.reverse();
        return {
            editableTabsValue: '1',
            editableTabs: [{
                title: 'New Tab',
                name: '1',
                content:{
                    method:'get',
                    url:'',
                    data:[
                        {key:'', value:'', description:''},
                    ],
                    headers:[
                        {key:'Content-Type', value:'application/x-www-form-urlencoded', description:''}
                    ],
                    response: {},
                    fromData:'',
                    dialogVisible: false,
                }
            }],
            tabIndex: 1,
            loading:false,
            historyList:historyList,
            collectionList:collectionList,
            rate:0
        }
    },
    created() {
        if (this.isLogin()) {
            axios.get('/user/total-rate').then(response => {
                this.rate = response.data.totalRate;
            });
        }
    },
    methods: {
        isLogin() {
            return !!localStorage.getItem('access_token');
        },
        doRate(rate) {
            if (!localStorage.getItem('access_token')) {
                this.$message.error('请先登录');
                this.$router.push('/login');
            } else {
                if (localStorage.getItem('rate')) {
                    return;
                }
                axios.post('/user/rate', {
                    rate:rate
                }).then(response => {
                    this.$message.success('打分成功');
                    localStorage.setItem('rate', rate);
                })
            }
        },
        handleTabsEdit(targetName, action) {
            if (action === 'add') {
                let newTabName = ++this.tabIndex + '';
                this.editableTabs.push({
                    title: 'New Tab',
                    name: newTabName,
                    content:{
                        method:'get',
                        url:'',
                        data:[
                            {key:'', value:'', description:''}
                        ],
                        headers:[
                            {key:'Content-Type', value:'application/x-www-form-urlencoded', description:''}
                        ],
                        response: {},
                        fromData:'',
                        dialogVisible: false,
                    }
                });
                this.editableTabsValue = newTabName;
            }
            if (action === 'remove') {
                let tabs = this.editableTabs;
                let activeName = this.editableTabsValue;
                if (activeName === targetName) {
                    tabs.forEach((tab, index) => {
                        if (tab.name === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeName = nextTab.name;
                            }
                        }
                    });
                }

                this.editableTabsValue = activeName;
                this.editableTabs = tabs.filter(tab => tab.name !== targetName);
            }
        },
        addTab(item) {
            let newTabName = ++this.tabIndex + '';
            this.editableTabs.push({
                title: item.url,
                name: newTabName,
                content:{
                    method:item.method,
                    url:item.url,
                    data:item.data,
                    headers:item.headers,
                    response: {},
                    fromData:'',
                    dialogVisible: false,
                }
            });
            this.editableTabsValue = newTabName;
        },
        addHeader(content) {
            content.headers.push({key:'', value:'', description:''});
        },
        addData(content) {
            content.data.push({key:'', value:'', description:''});
        },
        removeHeader(content, key) {
            if (content.headers.length > 1) {
                content.headers.splice(key, 1);
            }
        },
        removeData(content, key) {
            if (content.data.length > 1) {
                content.data.splice(key, 1);
            }
        },
        buildData(content) {
            let fromData = content.fromData;
            let params = fromData.split('&');
            let data;
            if (params.length>1) {
                data = params.map(item => {
                    let param = item.split('=');
                    return {key:param[0], value:param[1], description:''};
                });
                content.data = data;
            } else {
                params = fromData.split("\n");
                if (params.length>1) {
                    data = params.map(item => {
                        let param = item.split(':');
                        return {key:param[0], value:param[1], description:''};
                    });
                    content.data = data;
                }
            }
            content.dialogVisible = false;
        },
        send(content) {
            let url = content.url;
            if (!url) {
                this.$message.error('请输入请求URL');
                return;
            }
            this.loading = !this.loading;
            if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
                url = 'http://' + url;
            }
            let data = {};
            content.data.map(item => {
                if (!item.key) {
                    return;
                }
                data[item.key] = item.value;
            });
            let headers = {};
            content.headers.map(item => {
                if (!item.key) {
                    return;
                }
                headers[item.key] = item.value;
            });
            content.response = {};

            this.addHistory(content);
            axios({
                method:'post',
                url:'http://localhost:3333/request',
                data:{
                    method:content.method,
                    url:url,
                    headers:headers,
                    data:data
                },
            }).then(response => {
                console.log(response);
                content.response = response.data;
                content.response.json = 0;
                try {
                    if (typeof content.response.body !== 'object') {
                        content.response.body = JSON.parse(content.response.body);
                    }
                    content.response.body = jsonMarkup(content.response.body);
                    content.response.json = 1;
                } catch (e) {
                    console.log(e);
                }
                this.loading = !this.loading;
            }).catch(error => {
                this.loading = !this.loading;
            });
        },
        addHistory(content) {
            let history = {
                method:content.method,
                url:content.url,
                data:content.data,
                headers:content.headers
            };
            let date = new Date();
            localStorage.setItem('history_' + date.getTime(), JSON.stringify(history));
            this.historyList.unshift(history);
        },
        clearHistory() {
            for(let i in localStorage) {
                if (i.indexOf('history') > -1) {
                    localStorage.removeItem(i);
                }
            }
            this.historyList.splice(0, this.historyList.length);
            this.$message.success('操作成功');
        },
        addCollection(content) {
            if (!content.url) {
                this.$message.error('请输入请求URL');
                return;
            }
            let collection = {
                method:content.method,
                url:content.url,
                data:content.data,
                headers:content.headers
            };
            let date = new Date();
            localStorage.setItem('collection_' + date.getTime(), JSON.stringify(collection));
            this.collectionList.unshift(collection);
            this.$message.success('收藏成功');
        },
        clearCollection() {
            for(let i in localStorage) {
                if (i.indexOf('collection') > -1) {
                    localStorage.removeItem(i);
                }
            }
            this.collectionList.splice(0, this.collectionList.length);
            this.$message.success('操作成功');
        }
    }
}
</script>

<style>
    .header{background: #475669}
    ul,li{list-style: none;padding:0;margin:0;}
    .history-item{
        width:100%;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;cursor:pointer;
    }
    .history-item a{text-decoration: none;display: block;width: 100%;padding:5px 0;height:25px;line-height:25px;}
    .history-item a:hover{background: #f9fafc}
    .method-post{color:#20a0ff}
    .method-get{color:#13ce66}
    .method-put{color:#f7ba2a}
    .method-delete{color:#ff4949}
    .el-select .el-input {
        width: 110px;
    }
    .response {
        margin-top:30px;
        border-top:1px solid #ddd;
    }
    .request-body{
        max-height:500px;
        overflow: auto;
    }
    .res-body{
        padding:0 10px;
        height:500px;
        overflow:auto;
        word-break: break-all;
        word-wrap: break-word;
        border:2px solid #ddd;
        border-radius: 5px;
    }
    .res-header-list{padding:0 15px;}
    .res-header-item{margin-bottom:10px;}
</style>