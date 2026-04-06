const mongoose = require('mongoose');
const { Schema } = mongoose;
const Usuario = require('./usuario')
const Venta = require('./ventas');

const EstacionDeCobroSchema = new Schema({
    ubicacionDeEstacion:{
        type: String
    },
    dineroDeInicio: {
        type: Number,
    }
    ,
    dineroEnEstacion: {  
        type: Number,
        required: true
    },
    dineroDeVentasEnEfectivo:{
        type:Number
    },
    dineroDeVentasEnOtro:{
        type:Number
    },
    comprasRealizadasEnEfectivo: {
        type: Number
    },
    comprasRealizadasEnOtro: {
        type: Number
    }
    ,
    ingresosDeEfectivoManual: [
        {
            cantidad:Number,
            fecha: Date,
            comentarioDeIngreso:String
        }
    ],
    egresoDeEfectivoManual: [
        {
            cantidad:Number,
            fecha: Date,
            comentarioDeEgreso:String
   
        }
    ],
    historialDeUsuarios:[
        
        {
           nombreUser:{
            type:String
           },
            fechaDeLogeoEnEstación:{
                type:Date
            } 
        
        }
       
    ],
    estadoCaja: {
        type: String,
        enum: ['ABIERTA', 'CERRADA'],
        default: 'CERRADA'
    },
    aperturaActual: {
        estado: {
            type: String,
            enum: ['ABIERTA', 'CERRADA'],
            default: 'CERRADA'
        },
        fechaApertura: Date,
        fechaCierre: Date,
        montoInicial: {
            type: Number,
            default: 0
        },
        fondoCambio: {
            type: Number,
            default: 0
        },
        detalleEfectivo: {
            type: String,
            default: ''
        },
        observaciones: {
            type: String,
            default: ''
        },
        abiertaPor: {
            type: String,
            default: ''
        },
        dineroAlCerrar: {
            type: Number,
            default: 0
        }
    },

  
    // usuarioActual:{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Usuario'
    // },
    ventasRealizadasEnLaEstacion:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Venta'
        }
    ],
    isActive:{
        type: String,
        enum:['SI', 'NO'],
       }

},{timestamps:true})

const EstacionDeCobro = mongoose.model('EstacionDeCobro', EstacionDeCobroSchema);

module.exports = EstacionDeCobro