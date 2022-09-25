let socket = io();

// let boombtn = document.getElementByID('boom')
// boombtn.onclick = function(){
//     socket.emit('boom') //emitting event boom into socket
// }

// socket.on('whizz',function(){
//     let div = document.createElement('div')
//     div.innerText = 'whizz'
//     document.body.appendChild(div)
// })

// let btnsend = document.getElementById('btnsend')
// let inputmsg = document.getElementById('inputmsg')
// let ulmsglist = document.getElementById('ulmsglist')

// btnsend.onclick = function(){
//     socket.emit('msgsend',{
//         msg: inputmsg.value    //this is the data,w e get to server, alsong with emitted event
//     })
//     inputmsg.value
// }

// socket.on('msgrcv',(data)=>{
//     let linewmsg = document.createElement('li')
//     linewmsg.innerText = data.msg
//     ulmsglist.appendChild(linewmsg)
// })
function generatecard(value){
    let text = `<div class="card" style="width: 18rem;"> <div class="card-body"> <h5 class="card-title">${value}</h5> </div> </div>`;
    return text;
}

$('#loginbox').show()
$("#chatbox").hide()
$('#btnstart').click(()=>{
    socket.emit('login',{
        username:$('#username').val(),
        password:$('#password').val()
    })
})

socket.on('loggedin',(users)=>{
    $('#loginbox').hide()
    $("#chatbox").show()
    let text="";
    users["users"].forEach((value)=>{text+="<li>"+generatecard(value)+"</li>";});
    $("#available_list").html(text);
})

$("#btnsend").click(()=>{
    socket.emit('msgsend',{
        to: $("#inputtouser").val(),
        msg:$('#inputnewmsg').val()
    })
})

socket.on('msgrcv',(data1)=>{
    if(data1.mode=='singleto'){
        $('#ulmsgs').append($('<li>').text(
            `[${data1.data.from} (PRIVATE)] : ${data1.data.msg}`
        ))
    }
    else if(data1.mode=='singlefrom'){
        $('#ulmsgs').append($('<li style="float: right">').text(
            `[${data1.data.to} (PRIVATE)] : ${data1.data.msg}`
        ))
        $('#ulmsgs').append($('<br>'))
    }
    else if(data1.mode=='public_me'){
        $('#ulmsgs').append($('<li style="float: right">').text(
            `[${data1.data.to} (PUBLIC)] : ${data1.data.msg}`
        ))
        $('#ulmsgs').append($('<br>'))
    }
    else{
        $('#ulmsgs').append($('<li>').text(
            `[${data1.data.from} (PUBLIC)] : ${data1.data.msg}`
        ))
    }
})


socket.on('loginfalied',()=>{
    window.alert('wrong username or password')
    $('#loginbox').show()
    $("#chatbox").hide()
})