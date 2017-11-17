<template>
    <div class="container">
        <h1>大爷行行好，多少给点吧！</h1>
        <img src="../assets/alipay.png" alt="支付宝" width="200" height="200">
        <img src="../assets/wechat.png" alt="微信" width="200" height="200">
        <div class="mt10">
            <el-button type="primary" @click="$router.go(-1)">返回</el-button>
            <el-button type="danger" v-if="isLogin()" @click="logout">退出登陆</el-button>
            <el-button type="success" v-else @click="$router.push('Login')">登陆</el-button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {

        }
    },
    methods: {
        isLogin() {
            return !!localStorage.getItem('access_token');
        },
        logout() {
            localStorage.removeItem('access_token');
            this.$router.push({path:'/login'});
        }
    }
}
</script>

<style>
.container{width:1200px;margin:0 auto}
</style>