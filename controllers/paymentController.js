import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Helper to make axios POST with retries
 */
const axiosWithRetry = async (url, data, config, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await axios.post(url, data, config);
    } catch (err) {
      const isRetryable = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED';
      if (i === retries || !isRetryable) throw err;
      console.warn(`Attempt ${i + 1} failed (${err.code}). Retrying in 1s...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    // Using axios directly for order creation to avoid buggy SDK error handling
    // and provide better error messages for DNS/Connectivity issues
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    
    // Using axios with retry to handle unstable network resets
    const response = await axiosWithRetry('https://api.razorpay.com/v1/orders', {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LocalFix-Server/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    res.status(200).json({
      success: true,
      orderId: response.data.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error('Razorpay Connectivity Error: DNS resolution failed (api.razorpay.com)');
      return res.status(503).json({ 
        success: false, 
        message: 'Server cannot connect to Razorpay. Please check DNS settings.' 
      });
    }

    if (error.code === 'ECONNRESET') {
      console.error('Razorpay Connectivity Error: Connection was reset by the peer/network.');
      return res.status(503).json({ 
        success: false, 
        message: 'Connection to Razorpay was reset. This is usually caused by unstable internet or a firewall.' 
      });
    }
    
    console.error('Razorpay Create Order Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.error?.description || 'Could not create Razorpay order' 
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};
