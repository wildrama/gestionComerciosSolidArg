const ul = document.querySelector('#ulparaprod');
const buscarproducto = document.querySelector('#buscarproducto');
const formSearch = document.querySelector('#formSearch');
const formSearchCodigo = document.querySelector('#formSearchCodigo');

const inputBuscar = document.querySelector('#inputBuscar');
const codigoIndividualInput = document.querySelector('#codigoIndividualInput');
const searchBarOfertas = document.querySelector('#searchBarOfertas')
const tableBody = document.querySelector('.tableBody');
const searchBarFormCodigoIndividual = document.querySelector('#searchBarFormCodigoIndividual');
const resultadoDeBusquedaPorCodigo = document.querySelector('#resultadoDeBusquedaPorCodigo');
const nombreProdIndividual = document.querySelector('#nombreProdIndividual')
const marcaProdIndividual = document.querySelector('#marcaProdIndividual')
const precioProdIndividual = document.querySelector('#precioProdIndividual')

const cantidadProdIndividual = document.querySelector('#cantidadProdIndividual')
const productoIndividualContainer = document.querySelector('#productoIndividualContainer');
const idContainer = document.querySelector('#idContainer');

const btn2daPantalla = document.querySelector('#btn2daPantalla');


// searchBarOfertas.addEventListener('keyup',(e)=>{
//     console.log(e.target.value)
// })



searchBarFormCodigoIndividual.addEventListener('submit', async function(e){
  e.preventDefault();
  const query_buscar_codigo = searchBarFormCodigoIndividual.elements.codigoIndividualInput.value;
  console.log(query_buscar_codigo)
  try {
    
    const res = await axios.post('/administrador/buscar/buscar-codigo',
     {codigo: query_buscar_codigo }); 
    const producto = res.data;
    
    console.log(producto);  
    const productoId = producto._id;
    console.log(productoId);  

    //   const li2 = document.createElement('li');
    //   const accion1 = document.createElement('a');
    //   const accion2 = document.createElement('a');
    
    //   td1.textContent= producto.precioMinorista;
    nombreProdIndividual.innerHTML= producto.nombre;
    marcaProdIndividual.innerHTML= producto.marca;
   precioProdIndividual.innerHTML= `$ ${producto.precioMinorista}` ;
  
    cantidadProdIndividual.innerHTML= producto.cantidad;
    idContainer.textContent=productoId;
    idContainer.classList.add('d-none')
    //   td2.textContent= producto.marca;
    //   td3.textContent= producto.cantidad;

    //   tr.append(td0,td1,td2,td3)
    //   tableBody.append(tr);
    //   console.log(producto);  
    
    // idContainer.classList.add('d-none');




    
      } catch (error) {
    console.error(error);
  }

  console.log("this is "+ idContainer.textContent)
  const idProducto = idContainer.textContent;
  btn2daPantalla.setAttribute('href',`/administrador/ofertas/agregar-oferta-individual/${idProducto}/nueva`)
                                
})

// btn2daPantalla.addEventListener('click', async function(e){

//   try {
//    await axios.get(); 

//   } catch (error) {
//     console.log(error)
//   }
// } )