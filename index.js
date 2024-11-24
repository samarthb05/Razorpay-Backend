const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

//createorder 
app.post("/create-order", async (req, res) => {
  const { amount, currency } = req.body;
  const orderId = `sb25_${Math.floor(Math.random() * 100000)}`;

  if (!amount) {
    return res.status(400).json({ message: "Amount is required!" });
  }

  try {
    const response = await razorpay.paymentLink.create({
      amount: amount * 100,
      currency: "INR",
      reference_id: orderId,
    });

    const order = {
      id: orderId,
      amount,
      upiLink: response.short_url, //create url for payment
      gateway: "razorpay",
    };

    res.status(201).send({
      status: "success",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send({ message: error.message });
  }
});

//webhook
app.post("/webhook", async (request, response) => {
  try {
    const payment = request.body.payload.payment.entity;
    if (payment) {
      if (payment.status === "captured" && payment.captured) {
        const orderId = payment.notes.orderId;
        if (orderId) {
          const amount = payment.amount / 100;

          const paymentUpi = {
            orderId,
            amount,
            gateway: "razorpay",
          };
        }
      } else {
        razorpayInstance.payments
          .capture(payment.id, payment.amount, payment.currency)
          .catch((error) => {
            console.error("Error capturing payment:", error);
          });
      }
    }

    response.send({
      status: "success",
      message: "Webhook data received for Razorpay",
    });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    response.send({
      status: "success",
      message: "Webhook data received for Razorpay",
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
