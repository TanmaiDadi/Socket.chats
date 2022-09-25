const http = require('http')
const express = require('express')
const app = express()
const socketio = require('socket.io')
const request = require('request')

const server = http.createServer(app);
const io = socketio(server)  
app.use(express.urlencoded({extended:true}))


let users = {   //username and password
    
}
let socketmap = {

}

io.on('connection',(socket)=>{
    console.log('connected with socket id = ',socket.id);
    function login(s,u){
        s.join(u)
        io.emit("loggedin",{users:Object.keys(users)})
        socketmap[s.id] = u  
    }
    socket.on('login',(data)=>{
        if(users[data.username]){
            if(users[data.username] == data.password){   
                login(socket,data.username)
            }
            else{
                socket.emit('loginfalied')
            }
        }
        else{
            users[data.username] = data.password   
            login(socket,data.username)
        }
        
    })
    socket.on('msgsend',(data)=>{
        data.from = socketmap[socket.id]  
        if(data.to){
            io.to(data.to).emit('msgrcv',{data:data,
                mode:'singleto'
            }) 
            io.to(data.from).emit('msgrcv',{data:data,
                mode:'singlefrom'
            })
        }
        else{
            socket.broadcast.emit('msgrcv',{data:data,
                mode:'all'
            })
            io.to(data.from).emit('msgrcv',{data:data,
                mode:'public_me'
            })
        }
    })
})


app.use('/',express.static(__dirname + '/public'))

app.use('/contact',express.static(__dirname + '/public/contact.html'))

app.post('/contact',function(req,res){
    request.post({url:'http://127.0.0.1:5000/', form: {
        "txt_message": req.body.txt_message,
        "txt_name": req.body.txt_name,
        "txt_email": req.body.txt_email,
        "txt_subject": req.body.txt_subject
    }},
    function(err,httpResponse,body){ console.log(httpResponse.body); })
    res.redirect('/');
})

server.listen(8000, ()=>{
    console.log("staretd in localhost:8000")
})
