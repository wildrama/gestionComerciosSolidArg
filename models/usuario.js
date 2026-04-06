const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EstacionDeCobro = require('./estaciondecobro');

const passportLocalMongoose= require('passport-local-mongoose');

const UserSchema = new Schema({
    funcion:{
        type: String,
        enum:['CAJA', 'STOCK', 'REPARTIDOR','ADMINISTRADOR'],
        required:true,
    }
    
    ,
    estacionDeCobroAsignada:{
        type: Schema.Types.ObjectId,
         ref: 'EstacionDeCobro'
    },
    activeSessionToken: {
        type: String,
        default: null
    },
    lastLoginAt: {
        type: Date,
        default: null
    }
},
{ 
    timestamps: true 
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('Usuario', UserSchema)