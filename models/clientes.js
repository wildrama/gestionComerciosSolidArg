const mongoose = require('mongoose');
const {Schema} = mongoose;
const Pedido = require('./pedidosRepartidor');

const clienteSchema = new Schema ({

    nombreLocal:{
       type:String,
       required:true,
    
   },
   dueño:{
      type:String,
      required:true,
   },
   direccion:String,

   telefono1:Number,
   telefono2:Number,
   telefono3:Number,
   correo:String,
   comentario:String,
   pedidosRealizados:[
    {
       type: Schema.Types.ObjectId,
       ref: 'Pedido'
    }
   ]
 
   
   
   }, { timestamps: true });     
   const Cliente = mongoose.model('Cliente', clienteSchema);
   
   module.exports = Cliente;
   