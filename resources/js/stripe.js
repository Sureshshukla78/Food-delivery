import { loadStripe } from '@stripe/stripe-js';
import {placeOrder} from './apiService';
export async function initStripe() {
    const stripe = await loadStripe('pk_test_51LkDDPSEWJV86oOmqt2xLlbaGuBvxeotIiGfYkbiyZjUe0tAcsVCBA8rxF6QsmJScrlL6wNvRsVDiZ3R77yWAUGr009keT6ZDM');
    let card;
    // creating widget
    function mountWidget() {
        const elements = stripe.elements();
        let style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#aab7c4',
                iconColor: '#fa755a'
            }
        };

        card = elements.create('card', { style, hidePostalCode: true });
        card.mount('#card-element')
    }

    // managing widget
    const paymentType = document.querySelector('#paymentType');
    if(!paymentType){
        return;
    }
    paymentType.addEventListener('change', (e) => {
        // console.log("changed");
        if (e.target.value == 'card') {
            // display widget
            // widgets provided by stripe
            mountWidget();
        } else {
            card.destroy();
        }
    })

    // managing form data and axios request to server
    const paymentForm = document.querySelector('#paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let formData = new FormData(paymentForm);
            let formObj = {};
            for (const [key, value] of formData.entries()) {
                formObj[key] = value;
            }

            if(!card){
                // that means ccash on delivery
                placeOrder(formObj);
                return;
            }
            // 1. verify card
            stripe.createToken(card).then((result)=>{
                formObj["stripeToken"] = result.token.id;
                // console.log(formObj);
                placeOrder(formObj);
            }).catch((err)=>{
                console.log(err);
            })
        })
    }
}