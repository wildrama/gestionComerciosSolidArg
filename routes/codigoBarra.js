const express = require('express');
const router = express.Router();
const Producto = require('../models/productos');

router.get('/', (req, res) => {
	res.render('codigoBarra/codigoBarra.ejs')
	
})

module.exports = router;

router.post('/pedir', async (req, res) => {
	try {
		const codigos = await Producto.find({}) 
		res.json(codigos)
	} catch (error) {
		res.send(error)
	}

})
