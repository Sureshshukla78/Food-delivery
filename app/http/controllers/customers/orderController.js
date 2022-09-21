const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
function orderController() {
    return {
        store(req, res) {
            // validate request
            const { number, address, stripeToken, paymentType } = req.body;
            if (!number || !address || !stripeToken || !paymentType) {
                return res.status(422).json({ message: 'All fields are required' });
                // req.flash('error', 'All fields are required');
                // return res.redirect('/cart');
            }
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: number,
                address: address,
            })
            order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    // req.flash('success', 'Order placed successfully');
                    // delete req.session.cart;

                    // stripe Payment actual deduction
                    if (paymentType == 'card') {
                        stripe.charges.create({
                            // if in dollars we hav to gve in cents and if rupees we have to give in paise
                            amount: req.session.cart.totalPrice * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza Order: ${placedOrder._id}`
                        }).then((res) => {
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            placedOrder.save().then((ord) => {
                                console.log(res);
                                // emit
                                const eventEmitter = req.app.get('eventEmitter');
                                eventEmitter.emit('orderPlaced', ord);
                                delete req.session.cart;
                                return res.json({ message: 'Payment Sucessful, Order placed successfully' });
                            }).catch((err) => {
                                console.log(err);
                            })
                        }).catch((err) => {
                            console.log(err);
                            delete req.session.cart;
                            return res.json({ message: 'Order Placed But Payment Failed, You Can Pay At Delivery Time' });
                        })
                    }
                    // return res.redirect('/customer/orders');
                })
            }).catch(err => {
                return res.status(500).json({ message: 'Something went Wrong' });
                // req.flash('error', 'Something went Wrong');
                // return res.redirect('/cart')
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { 'createdAt': -1 } });
            res.header('cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('customers/orders', { orders: orders, moment: moment });
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id);
            //Authorize user 
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order });
            }
            return res.redirect('/');
        }
    }
}

module.exports = orderController;