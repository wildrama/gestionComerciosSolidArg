const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');
const Producto = require('../models/productos');
const User = require('../models/usuario');


const passport = require('passport');



// READ PRODUCT {

router.get('/', (req, res) => {
    
    res.render('stock/listado');
    
})

router.post('/', catchAsync(async (req , res) => {
  

    const query = req.body;
    console.log(query);
    try {
  
        const productos = await Producto.find({
           $or:[
             {nombre:{$regex: query.search_query, $options : 'i'}},
             {marca:{$regex: query.search_query, $options : 'i'}},
            
           ]
             });
  
  
             console.log(productos);
             res.json(productos)
  
    } catch (error) {
        res.send(error)
    }
  }))









// router.get('/query', async(req,res)=>{
  
//     const {query} = req.query;
//     console.log(query)
// res.render('stock/listado')
// })



router.post('/compra-efectuada', catchAsync( async (req,res )=>{
    const compraEfectuada = req.body;
    
}))
module.exports = router
