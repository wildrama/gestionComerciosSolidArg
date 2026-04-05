const mongoose = require('mongoose');
const { Schema } = mongoose;
const Producto = require('./productos');
const EstacionDeCobro = require('./estaciondecobro')
// fecha de salida
const ofertasSingularesDeProductosSchema = new Schema({
    
   cantidadDeUnidadesNecesarias:{
       type:Number,
       required: true
   },
    fechaDeVigencia: {
        type: Date
    },
    precioOferta: {
        type: Number,
        required: true

    },
    
    productoEnOferta: 
        {
            type: Schema.Types.ObjectId,
            ref: 'Producto'
        }
    
    ,
    estacionesDeCobroParaLaOferta: [
        {
            type: Schema.Types.ObjectId,
            ref: 'EstacionDeCobro'
        }
    ]

});

const OfertaSingular = mongoose.model('OfertaSingular', ofertasSingularesDeProductosSchema);

module.exports = OfertaSingular;