import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
    storeProductId:
    {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true, min: 1
    },
    price:
    {
        type: mongoose.Decimal128,
        required: true
    },
    productImage:
     { type: String }
},
    { _id: false }); // _id: false avoids generating id for each subdocument

const storeOrderSchema = new mongoose.Schema({
    storeId:
        { type: String, required: true },
    userId:
        { type: String, required: true },
    products:
        { type: [orderProductSchema], required: true },
    shippingAddress:
        { type: String },
    paymentStatus:
        { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus:
        { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
    trackingId:
        { type: String },
    totalAmount:
        { type: mongoose.Decimal128, required: true },
    orderNumber:
        { type: String, required: true, unique: true }
}, { timestamps: true });

export const StoreOrders = mongoose.model("StoreOrders", storeOrderSchema);
