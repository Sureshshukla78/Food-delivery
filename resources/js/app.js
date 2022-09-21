import axios from 'axios'
import moment from 'moment';
import Noty from 'noty';

import {initAdmin} from './admin';
import {initStripe}  from './stripe';
let addToCart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cart-counter');

function updateCart(item){
    axios.post('/update-cart', item).then(res=>{
        // console.log(res);
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout:1000,
            text: 'Item added to cart',
            progressBar:false
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout:1000,
            text: 'Something went wrong',
            progressBar:false
        }).show();
    })   
}

addToCart.forEach((btn)=>{
    btn.addEventListener('click', (e)=>{
        let item = JSON.parse(btn.dataset.item);
        updateCart(item)
    })
})

const alertMsg = document.querySelector('#success-alert');
if(alertMsg){
    setTimeout(()=>{
        alertMsg.remove()
    }, 1000)
}



// change auto status 
let statuses = document.querySelectorAll('.status_line');
let order = document.querySelector('#hiddenInput') ? document.querySelector('#hiddenInput').value : null;
let orderObj = JSON.parse(order);
let time = document.createElement('small');

function updateStatus(order){
    statuses.forEach((item)=>{
        item.classList.remove('step-completed');
        item.classList.remove('current-status');
    })
    let stepcompleted = true;
    statuses.forEach((item)=>{
        let dataProp = item.dataset.status;
        if(stepcompleted){
            item.classList.add('step-completed');
        }
        if(dataProp === order.status){
            stepcompleted = false;
            time.innerText = moment(order.updatedAt).format('hh:mm A');
            item.appendChild(time);
            if(item.nextElementSibling){
                item.nextElementSibling.classList.add('current-status')
            }
        }
    })
}

updateStatus(orderObj);
initStripe();

// socket
let socket = io()

//join
if(order){
    socket.emit('join',`order_${orderObj._id}`);
}

let adminPath = window.location.pathname;
if(adminPath.includes('admin')){
    initAdmin(socket);
    socket.emit('join', 'adminRoom');
}

// watch on orderUpdated emitter
socket.on('orderUpdated', (data)=>{
    const updatedOrder = { ...orderObj };
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
    new Noty({
        type: 'success',
        timeout:1000,
        text: 'Order Updated',
        progressBar:false
    }).show();
})