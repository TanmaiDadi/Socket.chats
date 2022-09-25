const http = require('http')
const express = require('express')
const app = express()
const socketio = require('socket.io')
const request = require('request')

const server = http.createServer(app);
const io = socketio(server)  //cant directly send express, we nee dto sedn html server
app.use(express.urlencoded({extended:true}))

// io.on('connection',(socket)=>{
//     console.log('connected with socket id = ',socket.id);
//     socket.on('boom',()=>{   //whenever boom event is called, written in script.js
//         console.log('boom received from',socket,id)
//     })
// })

let users = {   //username and password
    
}
let socketmap = {

}

io.on('connection',(socket)=>{
    console.log('connected with socket id = ',socket.id);
    // socket.on('msgsend',(data)=>{   //whenever boom event is called, written in script.js
    //     // console.log('msg received ',data.msg)
    //     // socket.emit -> to same func itself
    //     io.emit('msgrcv',data)  // EMIT ON IO, NOT ON SOCKET, ( SOCKET WILL  SEND TO THAT CHANNEL ONLY , ** IO WILL SEND TO ALL CHANNELS ITS OCNNECTED)
    //     // socket.broadcast.emit('msgrcv',data)  //this event is sended to every other event , expcet current one
    // })
    function login(s,u){
        s.join(u)
        // s.emit("loggedin",{users:Object.keys(users)})
        io.emit("loggedin",{users:Object.keys(users)})
        socketmap[s.id] = u   //mapping socket id with username
    }
    socket.on('login',(data)=>{
        if(users[data.username]){
            if(users[data.username] == data.password){    //is user is found and password matched
                login(socket,data.username)
            }
            else{
                socket.emit('loginfalied')
            }
        }
        else{
            users[data.username] = data.password   //creating new users
            login(socket,data.username)
        }
        // socket.join(data.username)    //joining socket with username
        // socket.emit("loggedin",data)
        
    })
    socket.on('msgsend',(data)=>{
        data.from = socketmap[socket.id]   //finding name of that socketID
        if(data.to){
            io.to(data.to).emit('msgrcv',{data:data,
                mode:'singleto'
            }) //as in line 26, joined username to socket, we can call io.to(ussername)//for that socket
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
    // res.send(req.body.txt_name);
    // req.body.txt_email   txt_phone     txt_subject     txt_message
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

//cmd -> ipconfig -> ipv4