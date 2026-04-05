const mongoose = require('mongoose');
const { Schema } = mongoose;
const Producto = require('./productos');
const EstacionDeCobro = require('./estaciondecobro');

// fecha de salida
const ofertasDeProductosSchema = new Schema({
 
    nombreOferta:{
        type: String,
        required: true
    }
    ,
    fechaDeVigencia: {
        type: Date,
    },
    precioOferta: {
        type: Number,
        required: true

    },
   
    
    productosEnOfertaConCodigo: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Producto'
        }
    ]
    ,
   
    estacionesDeCobroParaLaOferta: [
        {
            type: Schema.Types.ObjectId,
            ref: 'EstacionDeCobro'
        }
    ]
    
});

const Oferta = mongoose.model('Oferta', ofertasDeProductosSchema);

module.exports = Oferta