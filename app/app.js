const express = require('express');
const app = express();
const hostname = 'localhost';
const port = 3333;
const axios = require('axios');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const querystring = require('querystring');
const fs = require('fs');


app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

app.post('/request', function (req, res) {
    let reqData = {
        method:req.body.method,
        url:req.body.url,
        data:req.body.data,
        headers:req.body.headers
    };
    let contentType = req.body.headers['Content-Type'];
    let data = req.body.data;
    if (contentType === 'application/x-www-form-urlencoded') {
        data = querystring.stringify(data);
    }
    axios({
        method:req.body.method,
        url:req.body.url,
        data:data,
        headers:req.body.headers
    }).then(response => {
        let data = {
            body:response.data,
            headers:response.headers,
            status:response.status
        };
        res.json(data);
    }).catch(error => {
        let data = {
            body:error.response.data,
            headers:error.response.headers,
            status:error.response.status
        };
        res.json(data);
    });
        /*.then(res => {
            let date = new Date();
            let filename = date.getTime() + '.json';
            fs.writeFile('./history/' + filename, JSON.stringify(reqData), function(err) {

            });
        })*/
});

app.get('/history', function (req, res) {
    let list = [];
    fs.readdir('./history', function (err, files) {
        if (err) {
            throw err;
        }
        // files是一个数组
        // 每个元素是此目录下的文件或文件夹的名称
        // console.log(files);
        for (let i in files) {
            if (files[i].indexOf('json')>1) {
                let data = fs.readFileSync('./history/' + files[i]);
                list.push(JSON.parse(data));
            }
        }
        list.reverse();
        res.json(list);
    });
});

/*app.delete('/history', function (req, res) {
    fs.readdir('./history', function (err, files) {
        if (err) {
            throw err;
        }
        for (let i in files) {
            fs.unlinkSync('./history/' + files[i]);
            res.end();
        }
    });
});*/
app.listen(port, hostname);
