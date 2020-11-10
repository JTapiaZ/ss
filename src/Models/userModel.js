'use strict'
const { Schema, model } = require("mongoose");


const userSchema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            max: 30
        },
        apellido: {
            type: String,
            required: true,
            max: 30
        },
        username: {
            type: String,
            required: true,
            unique: true,
            max: 30
        },
        password: {
            type: String,
            required: true,
            min: 8
        },
        monedaPreferida: {
            type: String,
            default: "usd",
            enum: ["usd", "eur", 'ars']
        },
        idMonedasSeguimiento: {
            type : Array,
            "default" : [],
            required: false, 
        },
    },
)

module.exports = model("User", userSchema);
