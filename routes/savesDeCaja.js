const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,isAdmin,isCaja} = require('../middleware');
const EstacionDeCobro = require('../models/estaciondecobro');
const Venta = require('../models/ventas');
const Producto = require('../models/productos');




const roleADM = 'ADMINISTRADOR';
const roleCaja = 'CAJA';
    // const ventaRealizada = {
    //     dineroIngresado : req.body.dineroIngresado,
    //     dineroDeSalida : req.body.dineroDeSalida,
    //     productos:[
    //         {
    //             valorDelProductoEnLaCompra: req.body.productoIndividual.precio,
    //             identificadorDeProducto: req.body.productoIndividual.id
    //         }
    //     ],
    //     estacionDeCobro: req.body.estacionDeCobro.id
    // }; 

router.post('/save-venta', catchAsync(async(req,res)=>{
    const userActual = req.user.username;
    //  const dineroIngresadoEnCaja = req.body.dineroIngresadoEnCaja;
   const estacionDeCobroId = req.body.estacionDeCobro;
    
    console.log(req.body)
    // guardar la venta
    // guardar el id de la venta en 'ventasRealizadasEnLaEstacion'
    //actualizar la cantidad de ventas realizadas- cantidad de montos ingresados- dinero en caja actual-
      const ventaRealizada = {
        dineroIngresado : req.body.dineroIngresado,
        dineroDeSalida : req.body.dineroDeSalida,
        productosDeStock:[

            {
                valorDelProductoEnLaCompra: req.body.valorDelProductoEnLaCompra,
                identificadorDeProducto: req.body.identificadorDeProducto
            }
        ],
        productosSinStock:[

            {
                valorDelProductoEnLaCompra: req.body.valorDelProductoEnLaCompra,
                identificadorDeProducto: req.body.identificadorDeProducto
            }
        ],
        ticketEntregado: req.body.ticket,
        tipoDePago :req.body.tipoDePago,
        cantidadDeProductosTotales: req.body.cantidadDeProductosTotales,
        estacionDeCobro: req.body.estacionId,
        nombreDelUsuario: userActual
    }; 
    const ventaEfectuada = await new Venta(ventaRealizada)
    
    await ventaEfectuada.save();

    const ventaID = ventaEfectuada._id;



    if(ventaEfectuada.tipoDePago =='OTRO'){
        // dinero en estacion:  dinerodeventas de ingreso - dinero de egresos
        // dineroEnEstacion: ventaEfectuada.dineroIngresado 

let estacionDeCobroActualizada2= await EstacionDeCobro.findByIdAndUpdate(estacionDeCobroId,{ $inc: { dineroDeVentasEnOtro:ventaEfectuada.dineroIngresado,comprasRealizadasEnOtro: '1'  },$push: { ventasRealizadasEnLaEstacion: ventaID } }).exec();
console.log('venta realizada:' + ventaID)
console.log(ventaEfectuada);

console.log('estacion actualizada123')
console.log(estacionDeCobroActualizada2)
req.flash('success','Compra finalizada correctamente')
res.redirect(`/caja/${estacionDeCobroActualizada2._id}/cajaActiva`)
}else{

let estacionDeCobroActualizada1= await EstacionDeCobro.findByIdAndUpdate(estacionDeCobroId,{ $inc: {dineroEnEstacion: ventaEfectuada.dineroIngresado - ventaEfectuada.dineroDeSalida,dineroDeVentasEnEfectivo:ventaEfectuada.dineroIngresado ,comprasRealizadasEnEfectivo: '1'   },$push: { ventasRealizadasEnLaEstacion: ventaID } }).exec();
console.log('venta realizada:' + ventaID)
console.log(ventaEfectuada);

console.log('estacion actualizada1')
console.log(estacionDeCobroActualizada1)
req.flash('success','Compra finalizada correctamente')
res.json('COMPRA FINALIZADA')
}
}))

router.get('/:id/try-save', async(req,res)=>{
    const estacionId =req.params.id;
    
    const ventaEfectuada = await new Venta({
        dineroIngresado : 1030,
        dineroDeSalida : 30,
        productosDeStock:[
            {
                valorDelProductoEnLaCompra: 954852,
                identificadorDeProducto: '624488cac68a3c3a7b2df4ec'
            }
        ],
        productosSinStock:[],
        ticketEntregado: "NO",
        tipoDePago:'OTRO',  
        cantidadDeProductosTotales: 9,
        estacionDeCobro: estacionId,
        nombreDelUsuario: 'ramiro'
    });
    await ventaEfectuada.save();

    let ventaID= ventaEfectuada._id;
        if(ventaEfectuada.tipoDePago =='OTRO'){
  
            // dineroEnEstacion: ventaEfectuada.dineroIngresado 
   
    let estacionDeCobroActualizada2= await EstacionDeCobro.findByIdAndUpdate(estacionId,{ $inc: { dineroDeVentasEnOtro:ventaEfectuada.dineroIngresado,comprasRealizadasEnOtro: '1'  },$push: { ventasRealizadasEnLaEstacion: ventaEfectuada._id } }).exec();
    console.log('venta realizada:' + ventaID)
    console.log(ventaEfectuada);

    console.log('estacion actualizada123')
    console.log(estacionDeCobroActualizada2)
    res.send('ok PAGO EN TARJETA/TRANSFERENCIA');
}else{

    let estacionDeCobroActualizada1= await EstacionDeCobro.findByIdAndUpdate(estacionId,{ $inc: {dineroEnEstacion: ventaEfectuada.dineroIngresado,dineroDeVentasEnEfectivo:ventaEfectuada.dineroIngresado ,comprasRealizadasEnEfectivo: '1'   },$push: { ventasRealizadasEnLaEstacion: ventaEfectuada._id } }).exec();
    console.log('venta realizada:' + ventaID)
    console.log(ventaEfectuada);

    console.log('estacion actualizada1')
    console.log(estacionDeCobroActualizada1)
    res.send('ok PAGO EN EFECTIVO');
}
})


router.get('/p', async(req,res)=>{
    const datos = await Producto.find({});
    console.log(datos);
    res.json(datos);
    
})


router.get('/ventasEstacion', async(req,res)=>{
    const estacionId = "62966a1ba25b27a2c062578d";

    const datos = await EstacionDeCobro.findById(estacionId);
 await datos.populate("ventasRealizadasEnLaEstacion")
  datos.populated('ventasRealizadasEnLaEstacion')
 const idDeUnproducto = datos.ventasRealizadasEnLaEstacion[0].productos[0].identificadorDeProducto;
    console.log(datos);
    const buscarOtroProd = await Producto.findById(idDeUnproducto);

    res.json(buscarOtroProd);


})        
module.exports = router;