
  const divProducto = document.querySelector('ul');
  const formBuscar = document.querySelector('#formBuscar');


  formBuscar.addEventListener('submit', async function(event){
    event.preventDefault();
    const codigoBuscado = formBuscar.elements.codigo.value;
    // console.log(codigoactual);
    try {

      const res = await axios.post('/administrador/productos/buscar', {codigo: codigoBuscado }); 
      console.log(res.data.nombre)
      const li = document.createElement('li');
      li.textContent = res.data.nombre
      ul.append(li)
        } catch (error) {
      console.error(error);
    }
   
  })

  const agregarProducto = (productos)=>{
    for (let producto of productos){
      const li = document.createElement('li');

    li.innerHTML= producto.nombre
    ul.append(li)
    }
  }
