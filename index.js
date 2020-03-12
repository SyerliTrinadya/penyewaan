const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()

const secretKey = 'verysecretkey'
const port = 4444;

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'uji-coba'
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const isAuthorized = (request,result,next)=>{
    if(typeof(request.headers['x-api-key'])== 'undefined')
    return result.status(403).json({
        success: false,
        message:'Unauthorized.Token is not provided'
    })

    let token = request.headers['x-api-key']

    jwt.verivy(token,secretKey,(err,decoded)=>{
        if(err){
            return result.status(401).json({
                success: false,
            message:'Unauthorized.Token is invalid'
            })
        }
    })
    next()
}

/****login****/

app.post('/login', (request, result) => {
    let data = request.body
    var username = data.username;
    var password = data.password;

    if ( username && password) {
        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
        
        let token = jwt.sign(data.username + '|' + data.password, secretKey)

            result.json ({
            success: true,
            message: 'Login Success',
            token: token
            });
        
            } else {
            result.json ({
            success: false,
            message: 'Login Failed'
              });
            }

            result.end();
        });
    }
});
/**** user ****/
app.get('/penyewa', isAuthorized,(req,res)=>{
    let sql = `
    select username, created_at from user
    `
    db.query(sql,(err,result)=>{
        if (err) throw err

        res.json({
            message: "success get all user",
            data: result
        })
    })
})

app.post('/penyewa',isAuthorized,(req, res)=>{
    let data = req.body
    data.foreach(element => {
        let sql = `
        insert into user (username,password)
        values ('`+element.username+`','`+element.password+`')
        `
    })
})
/**** run port****/
app.listen(port,()=>{
    console.log('app running on port' + port);
    
})