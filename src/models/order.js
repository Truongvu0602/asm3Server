const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cart: [
    {
      type: Object,
      required: true,
    }
  ],
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "pending",
  },
  totalPrice: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
    default: "pending",
  }
},{timestamps: true});

module.exports = mongoose.model("Order", orderSchema);