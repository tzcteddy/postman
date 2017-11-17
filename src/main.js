import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App.vue'
import routes from './routes'
import VueRouter from 'vue-router'
import './assets/common.css'
import axios from 'axios';

Vue.use(ElementUI);
Vue.use(VueRouter);

axios.defaults.baseURL = 'http://dianfei.51siyuan.cn/api';

const router = new VueRouter({
    routes
});
router.beforeEach((to, from, next) => {
    if (to.path != '/login') {
        /*if (!Cookies.get('access_token')) {
            next({path: '/login'});
        } else {
            next();
        }*/
        next();
    } else {
        if (localStorage.getItem('access_token')) {
            next({path: '/'});
        } else {
            next();
        }
    }
});

//注入access_token
axios.interceptors.request.use(function (config) {
    let url = config.url;
    if (url.indexOf('http://localhost:3333') > -1) {
        return config;
    }
    if (localStorage.getItem('access_token')) {
        let seperator = url.indexOf('?') > -1 ? '&' : '?';
        url += seperator + 'access_token=' + localStorage.getItem('access_token');
    }
    config.url = url;
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});
//401跳登陆
/*axios.interceptors.response.use(response => {
    return response;
}, error=> {
    if (error.response.status == 401) {
        router.push('login');
    }
    return Promise.reject(error);
});*/
window.axios = axios;
window.router = router;
window.isLogin = function () {
    return !!localStorage.getItem('access_token');
};
new Vue({
    router: router,
    render: h => h(App)
}).$mount('#app');
