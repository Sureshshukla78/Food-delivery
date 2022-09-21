import axios from 'axios'
import Noty from 'noty';
export function placeOrder(formObj){
    axios.post("/order", formObj).then((response) => {
        console.log(response.data);
        new Noty({
            type: 'success',
            timeout: 1000,
            text: response.data.message,
            progressBar: false
        }).show();
        setTimeout(() => {
            window.location.href = '/customer/orders'
        }, 1000)
    }).catch((error) => {
        console.log(error);
        new Noty({
            type: 'success',
            timeout: 1000,
            text: error,
            progressBar: false
        }).show();
    })
}