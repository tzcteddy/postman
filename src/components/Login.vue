<template>
    <div>
        <el-form :model="form" :rules="rules2" ref="form" label-position="left" label-width="0px" class="card-box loginform">
            <h3 class="title">{{systemName}}</h3>
            <el-form-item prop="phone">
                <el-input type="text" v-model="form.phone" auto-complete="off" placeholder="账号"></el-input>
            </el-form-item>
            <el-form-item style="width:100%;">
                <el-button @click.native.prevent="getCode">获取验证码</el-button>
            </el-form-item>
            <el-form-item prop="code">
                <el-input type="text" v-model="form.code" auto-complete="off" placeholder="验证码" :disabled="disabled"></el-input>
            </el-form-item>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" :loading="loading" @click.native.prevent="handleSubmit('form')">登录</el-button>
            </el-form-item>
            <el-form-item style="width:100%;">
                <el-button type="success" style="width:100%;" @click.native.prevent="goHome">匿名使用</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            title: '',
            systemName: 'postwoman',
            loading: false,
            form: {
                phone: '',
                code: '',
            },
            rules2: {
                phone: [{required: true, message: '请输入账号', trigger: 'blur'}],
                code: [{required: true, message: '请输入验证码', trigger: 'blur'}],
            },
            disabled:true
        }
    },
    methods: {
        getCode() {
            if (!this.form.phone.match(/^1[0-9]{10}$/)) {
                this.$message.error('请输入合法的手机号');
            }
            axios.post('/auth/send-code', {
                phone:this.form.phone
            }).then(response => {
                this.disabled = false;
            }).catch(error => {
                this.$message.error(error.response.data.message);
            })
        },
        handleSubmit(form) {
            if (this.loading) return
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = !this.loading
                    axios.post('/auth/fast-login', {
                        phone: this.form.phone,
                        code: this.form.code
                    }).then((res) => {
                        localStorage.setItem('access_token', res.data.access_token, { expires: 1 });
                        this.$message.success('登录成功');
                        this.goHome();
                    }).catch((error) => {
                        this.loading = !this.loading
                        console.log(error.response);
                        this.$message.error(error.response.data.message);
                    })
                } else {
                    return false
                }
            })
        },
        goHome() {
            this.$router.push('/');
        }
    }
}
</script>

<style>
.card-box {
	padding: 20px;
	/*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
	-webkit-border-radius: 5px;
	border-radius: 5px;
	-moz-border-radius: 5px;
	background-clip: padding-box;
	background-color: #F9FAFC;
	margin: 120px auto 20px;
	border: 2px solid #8492A6;
    width:450px;
}

.title {
	margin: 0 auto 40px;
	text-align: center;
	color: #505458;
}
</style>