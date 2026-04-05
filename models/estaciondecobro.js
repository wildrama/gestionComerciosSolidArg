const mongoose = require('mongoose');
const { Schema } = mongoose;
const Usuario = require('./usuario')
const Venta = require('./ventas');

EstacionDeCobroSchema = new Schema({
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