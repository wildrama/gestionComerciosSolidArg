const inputBuscar = document.querySelector('#inputBuscar');

const displayProductos = document.querySelector('#displayProductos');

const pul = document.querySelector('#pulBuscarProducto');
const tableParaProductosP = document.querySelector('#tableParaProductosP');
const lupa = document.querySelector('#lupaBusqueda')


const buscarproducto = document.querySelector('#buscarproducto');
const formSearch = document.querySelector('#formSearch');
const formBuscarPedidos = document.querySelector('#formBuscarPedidos');
const buscarcodigo = document.querySelector('#buscarcodigo');
const alertP = document.querySelector('#alertP');
const finalizarPedidoBTN = document.querySelector('#finalizarPedidoBTN');
const hacerOtroPedido = document.querySelector('#hacerOtroPedido');
const montoFinalPedido = document.querySelector('#montoFinalPedido');
const contenedorBusquedaGRAL = document.querySelector('#contenedorBusquedaGRAL')
let productosAgregadosArr = []
let productosParaElPedido = [];
const todosLosMas = document.querySelector('agregarUnElementoAlaLista')
let productosSeleccionados = []
let montoFinal = 0;
// const checkboxEstado = document.querySelector('#checkboxEstado');
// const checkboxArchivar = document.querySelector('#checkboxArchivar');

const idRepartidor = document.querySelector('#idRepartidor').innerHTML
montoFinalPedido.innerHTML = "00.0";

formBuscarPedidos.addEventListener("submit", async function (e) {
  e.preventDefault();
  const query_buscar = inputBuscar.value;
  displayProductos.innerHTML = "";
  console.log(query_buscar)

  try {
    // console.log(query_buscar)
    const res = await axios.get(`/pedidos/buscar-productos?busqueda=${query_buscar}`);
    const productos = res.data;
    
    productosParaElPedido.push(productos)

    for (let producto of productos) {
      console.log(producto.nombre)



      const col9 = document.createElement('div');
      const rowProd = document.createElement('div');

      const divNombre = document.createElement('div');
      const divMarca = document.createElement('div');
      const divPrecioM = document.createElement('div');
      const divPrecioU = document.createElement('div');

      const col3 = document.createElement('div');

      const divMinus = document.createElement('div');
      const divCantidadActual = document.createElement('div');

      const divPlus = document.createElement('div');
      const idP = document.createElement('p');

      rowProd.classList.add('row', 'mb-1', 'border', 'border-primary', 'py-1')
   
      col9.classList.add('col-9', 'd-flex', 'justify-content-between', 'text-center')
      col3.classList.add('col-3', 'd-flex', 'justify-content-end', ',align-items-center')
      divCantidadActual.classList.add('px-3')
      idP.classList.add('d-none');
      divPlus.classList.add('agregarUnElementoAlaLista')
      //     accion1.href =`/administrador/productos/${producto._id}/upstockprecio`;
      //     imgButton1.classList.add('editButton')
      //       imgButton1.src='/imgs/png/contract.png'
      divNombre.textContent = producto.nombre;
      divMarca.textContent = producto.marca;
      divPrecioM.textContent = producto.precioMayorista;
      idP.textContent = producto._id;
      divMinus.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
    </svg>`;
      divCantidadActual.innerHTML = 0,
        divPlus.innerHTML = `<svg id="${producto._id}"  xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
    </svg>`;
      //   accion1.append(imgButton1);
      //   tr.append(td0,td1,td2,td3,accion1)

      //   tableBody.append(tr);
      col9.append(divNombre, divMarca, divPrecioM);
      rowProd.append(col9, col3);
      displayProductos.append(rowProd);
      if (producto.cantidad <2){
        rowProd.classList.add('text-danger');
        col3.append(divCantidadActual)

        

      }else{
        col3.append(divMinus,divCantidadActual, divPlus)

      }

      let cantidadElegida = 0;
   
      console.log(productosAgregadosArr)
      // console.log(idP.textContent)
     
      let data1 = productosAgregadosArr.find(function (ele) {
        return ele.id === producto._id;
        
      });

      if (data1) {
        divCantidadActual.innerHTML = data1.cantidad;
        divCantidadActual.style.color="blue";
        cantidadElegida = data1.cantidad;

      }
      divPlus.addEventListener('click', async (e) => {

   
        cantidadElegida += 1;



        if (cantidadElegida < 2) {

          // idArray.push(producto._id)
          productosAgregadosArr.push({
            id: producto._id,
            nombre: producto.nombre,
            marca: producto.marca,
            precioUnidad: producto.precioMayorista,
            precioMayorista: producto.precioMayorista,
            cantidad: cantidadElegida
          })
          console.log(productosAgregadosArr)
          // let productoAAgregar = e.target.id;  
          // console.log(productoAAgregar)
          // var cartItemNombre = producto.nombre;
          // var cartItemMarca = producto.marca;
          // var cartItemPrecio = producto.precioMayorista;


          // console.log(cartItemNombre,cartItemMarca,cartItemPrecio)        


          // tdProductoRowCantidadProducto.id = `${producto._id}c`
          // tdProductoRowPrecioProducto.id = `${producto._id}p`


          // tableParaProductosP.innerHTML = "";
          // mostrarProductosAgregados()

        } else {
          let precioParcialProducto = producto.precioMayorista * cantidadElegida;
          // tdProductoRowCantidadProducto.innerHTML = ;
          // tdProductoRowPrecioProducto.innerHTML = ; 

          // tdCantidadElegida.innerHTML =tdCantidadElegida;
          // tdPrecio.innerHTML = precioParcialProducto
          console.log(cantidadElegida + 'producto añadido sin repetir' + precioParcialProducto)

          // const updatedData = productosAgregadosArr.map(x => (x.id === producto._id ? { ...x, cantidad: cantidadElegida } : x));
          var data = productosAgregadosArr.find(function (ele) {
            return ele.id === producto._id;
          });
          if(data){
            console.log(data)
            data.cantidad = data.cantidad + 1;
            data.precioMayorista = precioParcialProducto
            console.log('producto ya existente')
          }
          
      



    

        }

        divCantidadActual.innerHTML = cantidadElegida;
        console.log(productosAgregadosArr)
  
        tableParaProductosP.innerHTML = "";
        mostrarProductosAgregados();
        if (productosAgregadosArr.length < 2) {
          finalizarPedidoBTN.classList.add('btn-primary')
        }




        if (montoFinalPedido.innerHTML == "NaN"
        ) {
          montoFinalPedido.innerHTML = "00.0";

        }

        var sum = 0;//Initial value hast to be 0

        var sum1 = 0;//Initial value hast to be 0     
        for (let i = 0; i < productosAgregadosArr.length; i++) {
          var number = parseFloat(productosAgregadosArr[i].precioMayorista);//Convert to numbers with parseFloat
          sum += number;//Sum the numbers
        }

        montoFinalPedido.innerHTML = sum;//Output 70
        console.log('El precio total es:' + sum )

        for (let o = 0; o < productosAgregadosArr.length; o++) {
          var number1 = parseFloat(productosAgregadosArr[o].cantidad);//Convert to numbers with parseFloat
          sum1 += number1;//Sum the numbers
        }

        console.log('la cantidad total es:' + sum1)
      })

// me descuente cantidad, y si ya existe, que 

      divMinus.addEventListener('click', async (e) => {

   
        cantidadElegida -= 1;

        let precioParcialProducto = producto.precioMayorista * cantidadElegida;


          // tdProductoRowCantidadProducto.innerHTML = ;
          // tdProductoRowPrecioProducto.innerHTML = ; 

          // tdCantidadElegida.innerHTML =tdCantidadElegida;
          // tdPrecio.innerHTML = precioParcialProducto
          console.log(cantidadElegida + ' producto añadido sin repetir ' + precioParcialProducto)

          // const updatedData = productosAgregadosArr.map(x => (x.id === producto._id ? { ...x, cantidad: cantidadElegida } : x));
          var data = productosAgregadosArr.find(function (ele) {
            return ele.id === producto._id;
          });
          console.log(data)
          data.cantidad = data.cantidad - 1;

          if(cantidadElegida > 1 ){
            data.precioMayorista = precioParcialProducto
          
          }
     
          if(cantidadElegida == 1){
            data.precioMayorista = producto.precioMayorista
          }

          if(data.cantidad == 0){
            for (let i = 0; i < productosAgregadosArr.length; i++) {
              if (productosAgregadosArr[i].id == producto._id) {
                productosAgregadosArr.splice(i, 1);
              }
            }
          }
  
        divCantidadActual.innerHTML = cantidadElegida;
       
        console.log(productosAgregadosArr)
  
        tableParaProductosP.innerHTML = "";
        mostrarProductosAgregados();
        if (productosAgregadosArr.length < 2) {
          finalizarPedidoBTN.classList.add('btn-primary')
        }




        if (montoFinalPedido.innerHTML == "NaN"
        ) {
          montoFinalPedido.innerHTML = "00.0";

        }

        // cantidad total y precio total
        var sum = 0;//Initial value hast to be 0

        var sum1 = 0;//Initial value hast to be 0     
        for (let i = 0; i < productosAgregadosArr.length; i++) {
          var number = parseFloat(productosAgregadosArr[i].precioMayorista);//Convert to numbers with parseFloat
          sum += number;//Sum the numbers
        }

        montoFinalPedido.innerHTML = sum;//Output 70
        console.log('El precio total es:' + sum )

        for (let o = 0; o < productosAgregadosArr.length; o++) {
          var number1 = parseFloat(productosAgregadosArr[o].cantidad);//Convert to numbers with parseFloat
          sum1 += number1;//Sum the numbers
        }

        console.log('la cantidad total es:' + sum1)
      })



    }





  } catch (error) {


    inputBuscar.value = "";

    inputBuscar.focus();

    //   alerP.classList.remove('d-none')
    //   setTimeout(() => {
    // alerP.classList.add('d-none')
    //     }, 3000)
  }

  console.log(productosParaElPedido)

  tableParaProductosP.innerHTML = "";
  mostrarProductosAgregados();
});

const mostrarProductosAgregados = () => {
  productosAgregadosArr.forEach(productoRow => {


    let rowProductoRow = document.createElement('tr')
    let tdProductoRowAccion = document.createElement('td');
    let tdProductoRowNombreProducto = document.createElement('td');
    let tdProductoRowCantidadProducto = document.createElement('td');
    let tdProductoRowPrecioProducto = document.createElement('td');
  let eliminarProductosAgregadosBTN = document.createElement('div');
  eliminarProductosAgregadosBTN.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
</svg>`
    tdProductoRowAccion.id = eliminarProductosAgregadosBTN
    tdProductoRowNombreProducto.innerHTML = `${productoRow.nombre}--${productoRow.marca}`;

    tdProductoRowCantidadProducto.innerHTML = productoRow.cantidad;
    tdProductoRowPrecioProducto.innerHTML = productoRow.precioMayorista;
    
    eliminarProductosAgregadosBTN.classList.add("p-1")
    tableParaProductosP.append(rowProductoRow);
    rowProductoRow.append(tdProductoRowAccion, tdProductoRowNombreProducto, tdProductoRowCantidadProducto, tdProductoRowPrecioProducto)
    tdProductoRowAccion.append(eliminarProductosAgregadosBTN)

    eliminarProductosAgregadosBTN.addEventListener('click',function(e) {

      console.log('empezar eliminar producto')
      const idElementos = e.target.id;
      let data = productosAgregadosArr.find(function (ele) {
        return ele.id === productoRow.id;
        
      });
      console.log(data)
      // data.cantidad = data.cantidad + 1;
      // data.precioMayorista = precioParcialProducto
      console.log('producto ya Borrado')
      for (let i = 0; i < productosAgregadosArr.length; i++) {
        if (productosAgregadosArr[i].id == productoRow.id) {
          productosAgregadosArr.splice(i, 1);
        }
      }
      if (productosAgregadosArr.length < 2 ) {
        finalizarPedidoBTN.classList.remove('btn-primary')
      }




      var sum = 0;//Initial value hast to be 0

      var sum1 = 0;//Initial value hast to be 0     
      for (let k = 0; k < productosAgregadosArr.length; k++) {
        var number = parseFloat(productosAgregadosArr[k].precioMayorista);//Convert to numbers with parseFloat
        sum += number;//Sum the numbers
      }
      console.log('el precio total es:' + sum)
    
      montoFinalPedido.innerHTML = sum;//Output 70
    
      for (let n = 0; n < productosAgregadosArr.length; n++) {
        var number1 = parseFloat(productosAgregadosArr[n].cantidad);//Convert to numbers with parseFloat
        sum1 += number1;//Sum the numbers
      }
    
      console.log("producto Eliminado")
    
      tableParaProductosP.innerHTML = "";
      mostrarProductosAgregados();
    })

    // const eliminarProductosAgregados = () => {

      
    // }
    
  })


  // construir tabla en base al array productosAgregadosArr  mostrarProductosAgregados()

  // corregir errores de tabla dinamica
}

// const eliminarSingleProducto = () => {

//   let data = productosAgregadosArr.find(function (ele) {
//     return ele.id === producto._id;

//   });
//    data.cantidad = data.cantidad - 1;
//   data.precioMayorista = precioParcialProducto
// }
// const totalCost =  (producto) =>{
//   let costoTotalS = localStorage.getItem('totalCostPedido')


//   if(costoTotalS != null){
//     costoTotalS = parseInt(costoTotalS);

//     localStorage.setItem("totalCostPedido", costoTotalS + producto.precioMayorista)


//   }else{
//     localStorage.setItem
//   }
//   localStorage.setItem("totalCostPedido",  producto.precioMayorista)
// }

const agregarProductoAlPedido = () => {

  productosParaElPedido.forEach(p => {
    let ip = {
      id: p._id,

    }
  })
}
let clienteSeleccionado = "";
let clienteNombre = ""
const seleccionCliente = document.querySelector('#seleccionCliente');

seleccionCliente.addEventListener('change', event => {
  contenedorBusquedaGRAL.classList.remove('d-none');
  contenedorBusquedaGRAL.classList.add('d-block')
  clienteSeleccionado = seleccionCliente.options[seleccionCliente.selectedIndex].value;
  clienteNombre = seleccionCliente.options[seleccionCliente.selectedIndex].text;

  console.log('DisplayTabla y busqueda' + clienteSeleccionado + clienteNombre
  );
  // 👉️ get selected VALUE
});

console.log(clienteNombre)
document.getElementById('eliminarProductos').addEventListener('click', function () {
  inputBuscar.value = "";

  inputBuscar.focus();

  displayProductos.innerHTML = "";
})

// finalizar pedido y guardarlo
finalizarPedidoBTN.onclick = async () => {


  var sum = 0;//Initial value hast to be 0

  var sum1 = 0;//Initial value hast to be 0     
  for (let i = 0; i < productosAgregadosArr.length; i++) {
    var number = parseFloat(productosAgregadosArr[i].precioMayorista);//Convert to numbers with parseFloat
    sum += number;//Sum the numbers
  }
  console.log('el precio total es:' + sum)

  montoFinalPedido.innerHTML = sum;//Output 70

  for (let n = 0; n < productosAgregadosArr.length; n++) {
    var number1 = parseFloat(productosAgregadosArr[n].cantidad);//Convert to numbers with parseFloat
    sum1 += number1;//Sum the numbers
  }

  console.log('la cantidad total es:' + sum1)


  //Maqueta de datos, remotamente la definitiva.

  // let cantidadTotal = 0;
  // productosAgregadosArr.map(p => {
  // 	cantidadTotal = p.cantidad + cantidadTotal
  // })
  // cantidadTotal = cantidadTotal - 1;



  const stringValorDelProducto = () => {
    let stringBase = ""
    productosAgregadosArr.map(p => {
      if (p.nombre != "vacio") {
        stringBase = stringBase + `${p.nombre}x${p.cantidad}: $${p.cantidad}\n`


      }
    })
    return stringBase;



  }
  let idArray = [];
  for (let i = 0; i < productosAgregadosArr.length; i++) {
    idArray.push(productosAgregadosArr[i].id);
    // console.log(productosAgregadosArr[i].nombre)
  }
  // const ventaRealizada = {
  //   let estadoDePedidoCambio = 'PEDIDO';

  // if(checkboxEstado.checked) {
  //   estadoDePedidoCambio = 'ENTREGADO';

  //   }else{
  //     estadoDePedidoCambio = 'PEDIDO';

  //   }
  // let Archivar = 'NO'
  // if(checkboxArchivar.checked) {
  //   Archivar = 'SI'


  // }else{
  //   Archivar = 'NO'

  // }
  // }
  const res3 = await axios.post('/pedidos/save-pedido', {
    cliente: clienteSeleccionado,
    productosPedidos:idArray,
    productosPedidosNombre: productosAgregadosArr,
    cantidadDeProductos: sum1,
    estadoDePedidoCambio: 'PEDIDO',
    Archivar: 'NO',
    importeTotal: sum,

  })
  // usuarioRepartidor: `${idRepartidor}`

  if (res3) {
    // hacerOtroPedido.classList.remove('d-none');

    // hacerOtroPedido.classList.add('d-block');
    // console.log("PEDIDOFINALIZADO")
    window.location.href = '/pedidos/crear-pedido/b';    

  }



  // console.log(ventaRealizada)
  // console.log(ventaRealizada.valorDelProducto)

  // set time out para el aler de venta finalizada






}