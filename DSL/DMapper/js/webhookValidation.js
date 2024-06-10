import crypto from "crypto-js";

//test code,code need to revamp

const webhookValidation = async (payload, signature) => {
  if (!signature) {
         return res.status(400).json({
             status: "error",
             code: 400,
             message: "Missing signature",
             data: null
         });
     }

     try {
         if (verifySignature(payload, signature)) {
             // Process the webhook payload
             res.status(200).json({
                 status: "success",
                 code: 200,
                 message: "Signature verified",
                 data: null
             });
         } else {
             res.status(401).json({
                 status: "error",
                 code: 401,
                 message: "Invalid signature",
                 data: null
             });
         }
     } catch (error) {
         console.error('Error processing signature:', error);
         res.status(500).json({
             status: "error",
             code: 500,
             message: "Internal Server Error",
             data: null
         });
     }
};

function verifySignature(payload, signature) {
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(payload);
    const computedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computedSignature), Buffer.from(signature));
}

export default webhookValidation;
