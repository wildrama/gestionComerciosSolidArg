console.log('pedido impreso')


const tableParaPedidos = document.querySelector('#tableParaPedidos');
const allCheckBox = document.querySelectorAll('input[type=checkbox]:checked')
const printAllbtn = document.querySelector('#imprimirIndividual');
const imprimir1 = document.querySelector('#imprimir1');

const idPedido = document.querySelector('#idPedido').innerHTML;
let orderPrint 
let props 
let prodList 
// let ordersAll = [];
//   let ordersSelectedToPrint = [];
  // let productosPedido = listadoDePedidos.productosNombre;
  // let cliente = listadoDePedidos.cliente
  // let fechaactual = Date.now().toLocaleString();
const traerPedido = async ()=>{
    
    try {
      //example: create a PDF using the template
  
  //add new page or new content -> see jsPDF documentation
  
  //... `
  const res = await axios.get(`/pedidos/${idPedido}/traer-pedido`);


 let order = res.data;
 orderPrint=order;


let productosPedidos = order.productosPedidosNombre;

if(order){
  imprimir1.classList.add("text-muted");
  printAllbtn.classList.remove("d-none")
  printAllbtn.classList.add("d-block")
  imprimir1.classList.add("d-none");

}


 printAllbtn.addEventListener('click',generatePDF);
  
 function generatePDF(){
   var pdfObject = jsPDFInvoiceTemplate.default(props); //returns number of pages created
   // var pdfObject = jsPDFInvoiceTemplate.default({ ...props });
console.log( 'object created' + pdfObject )
 }
 
  props = {
        outputType: jsPDFInvoiceTemplate.OutputType.Save,
        returnJsPDFDocObject: true,
        fileName: "remitoPedido",
        orientationLandscape :false,
        compress: true,

        business: {
          name: "Isidorito",
          address: "San Pedro, Buenos",
          phone: "(3329) 563576",
          email: "distribuidoraisidorito@hotmail.com.com",
          
          website: "www.isidorito.com.ar/nosotros",
        },
        contact: {
          label: "Remito dirigito a:",
          name: `${orderPrint.cliente.dueño}`,
          address:`${orderPrint.cliente.direccion}`,
          phone: `${orderPrint.cliente.telefono1}`,
          email: `${orderPrint.cliente.correo}`,
          
        },
        invoice: {
          label: "Pedido",
        
          invDate: `${orderPrint.updatedAt.toLocaleString()}`,
          invGenDate: `${Date.now().toLocaleString()}`,
          headerBorder: false,
          tableBodyBorder: false,
          header: [
            {
              title: "#", 
              style: { 
                width: 10 
              } 
            }, 
            { 
              title: "Productos descripción",
              style: {
                width: 70
              } 
            }, 
            { 
              title: "Cantidad ",
              style: {
                width:20
              } 
            }, 
            { title: "Por unidad",
          style:{width:30}},
            // { title: "Cantidad"},
            { title: "Parcial",
          style:{
            width:30
          }},
            { title: "Total",
            style:{
              width:30
            }}
          ],
          table: Array.from(productosPedidos,(productoIm,index)=>([

            index+1,
            `${productoIm.nombre} - ${productoIm.marca} `,
            `X-${productoIm.cantidad}`,
            `$${productoIm.precioUnidad}`,
            `$${productoIm.precioMayorista}`,
            '-'
          ])),
          invDescLabel: "Total:",
          invDesc: `${orderPrint.importeTotal}`,
        },
        footer: {
          text: "Este remito generado digitalmente es valido para el pedido ortorgado",
          style: {
                      fontStyle: "normal",
                      fontWeight: "bold",
                
        }},
        pageEnable: true,
        pageLabel: "Page ",
        };
        console.log(orderPrint);

        console.log(props);

      // pdfObject.jsPDFDocObject.save();
  
  
      // mi invoice
     
  // nuevo in
    
  
    } catch (error) {
      console.log(error);
    }
  
  
  }
  imprimir1.addEventListener('click', traerPedido)


 


// const showOrders =  (ordersAll) =>{
//   for( let orderRow of ordersAll ){


//     let rowPedidoRow = document.createElement('tr')
//     let tdClienteNombreLocal = document.createElement('td');
//     let ulProductos = document.createElement('td');
//     let tdPedidoCantidadProductos = document.createElement('td');
//     let tdPrecioTotalPedido = document.createElement('td');
//     let checkboxImprimir = document.createElement('input')
//     let eliminarPedido = document.createElement('div');
//     checkboxImprimir.setAttribute("type", "checkbox");
//     checkboxImprimir.classList.add("check");
//     tdClienteNombreLocal.innerHTML = `${orderRow.cliente.nombreLocal} . ${orderRow.cliente.dueño}`;

//     orderRow.productosPedidosNombre.forEach(producto=>{
//       ulProductos.innerHTML= `
//       <li class="">
//           ${producto.nombre} - ${producto.marca}
//       </li>
//     `;
//     });

//     tdPedidoCantidadProductos.innerHTML = orderRow.cantidadDeProductos;
//     tdPrecioTotalPedido.innerHTML = orderRow.importeTotal;
//     tableParaPedidos.append(rowPedidoRow);
//     eliminarPedido.innerHTML=`<form action="/pedidos/${orderRow._id}?_method=DELETE" method="post">
//     <button class="btn btn-warning">Borrar</button>
// </form>`;
//     rowPedidoRow.append(tdClienteNombreLocal,ulProductos,tdPedidoCantidadProductos,tdPrecioTotalPedido,checkboxImprimir)
    
//     checkboxImprimir.addEventListener('change', () => {
//       console.log(checkboxImprimir.checked);
//   if(checkboxImprimir.checked == true) {
//     ordersSelectedToPrint.push(orderRow)
//     console.log(ordersSelectedToPrint);
//     }
//     if(checkboxImprimir.checked == false){
        
// 							for (let i = 0; i < ordersSelectedToPrint.length; i++) {
// 								if (ordersSelectedToPrint[i].id == orderRow.id) {
// 									ordersSelectedToPrint.splice(i, 1);
// 								}
// 							}
//               console.log('checkboxImprimir desclicleada')
//               console.log(ordersSelectedToPrint);
//               console.log(checkboxImprimir.checked);


//     }
//     console.log(checkboxImprimir.checked.length)
//       //  Array.from(ordersSelectedToPrint[i], (productoIm, index)=>([
//       //     index + 1,
//       //     `${productoIm.cliente.nombreLocal}`,
//       //     `${productoIm.cantidadDeProductos }`,
//       //     `${productoIm.importeTotal }`,

//       // ])),

      
      
//     });
//   };
// };




// mi array

// table: Array.from(orderPrint.productosPedidosNombre).forEach(productoIm=>{
            
              
//   `${productoIm.nombre} - ${productoIm.marca} - ${productoIm.presentacion}`,
//   `${productoIm.cantidad}`,
//   `${productoIm.cantidad}`,
//   `${productoIm.cantidad}`,
//   `${productoIm.cantidad}`,
// }),

    // Window.onload = async () => {
    //     let listadoDePedidos ;
    //     const res = await axios.get('/pedidos/todos-axios');.
    //     listadoDePedidos = res.data;
    //     printAllbtn.addEventListener('click', generatePDF())

    //     async function generatePDF(){
            


    //         var pdfObject = jsPDFInvoiceTemplate.default(props); 
    //         console.log(pdfObject + 'creado')
            
    //    }


    // }


// printAllbtn.addEventListener('click',generatePDF, function(){
//     // var doc = new jsPDF();
//     // console.log(allCheckBox)
//     // // doc.line(10,10,200,200)
//     // var pdfObject = jsPDFInvoiceTemplate.default(props);
    
//     // var margin = 10;
//     // var scale = (doc.internal.pageSize.width - margin *2 )/document.body.scrollWidth;

//     // pedidosSeleccionados.forEach(pedidoImp =>{
//     console.log()

//     //     //or in browser

      
//     //     // doc.addPage("a4")
//     //     // doc.text('primera',10,10)

//     //     // doc.text(`${pedidoImp.cantidad}`,10,20)
    
//     //     // for(let productosElegidos of pedidoImp.productosNombre){
//     //     //     doc.text(`${productosElegidos.nombreProducto}`,10,30)
    
//     //     // }
//     // })
//     // if(pedidos.lenght > 1 ){
//     // }
//     // doc.save(`impresionDeLosPedidos${fechaactual}.pdf`)
    
// })

