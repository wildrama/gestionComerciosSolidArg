const mongoose = require('mongoose');
const EstacionDeCobro = require('./models/estaciondecobro');
const Producto = require('./models/productos');
const { Schema } = mongoose;
const Usuario = require('./models/usuario')
// fecha de salida
const cierresDeCajaRealizados = new Schema({
    dineroEnCaja: {
        type: Number
    },
    dineroDeInicio: {
        type: Number
    },
    cantidadTotalDeVentasEnEfectivo: {
        type: Number
    },
    cantidadTotalDeVentasEnOtro: {
        type: Number
    },
    dineroTotalDeVentasEnEfectivo: {
        type: Number
    },
    dineroTotalDeVentasEnOtro: {
        type: Number
    },
    comentarioDeCierre:{
        type:String
    },
    estacionDeCobro: 
        {
            type: Schema.Types.ObjectId,
            ref: 'EstacionDeCobro'
        }
    
    

}, { timestamps: true });

const CierreCaja = mongoose.model('CierreCaja', cierresDeCajaRealizados);

module.exports = CierreCaja;


