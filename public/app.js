
const keyCodes = () => {
    document.addEventListener('keydown', function (e) {
      console.log(
        'keyCodeDEP', e.which,
        'key', e.key,
        'code', e.code,
        'location', e.location
      );
    });
  };
  // keyCodes();

  const ul = document.querySelector('#ulparaprod');
  const buscarproducto = document.querySelector('#buscarproducto');
  const formSearch = document.querySelector('#formSearch');
  const formSearchCodigo = document.querySelector('#formSearchCodigo');

  const inputBuscar = document.querySelector('#inputBuscar');
  const buscarcodigo = document.querySelector('#buscarcodigo');
const alerP = document.querySelector('#alerP');
  
  const tableBody = document.querySelector('.tableBody');

  formSearch.addEventListener('submit', async function(event){
    event.preventDefault();
 
    try {
      const query_buscar = inputBuscar.value;
      console.log(query_buscar)
      const res = await axios.post('/administrador/buscar/buscar-codigo', {codigo: query_buscar }); 
      const producto = res.data;


      console.log(res.data)  
      if(producto._id){
        const td0 = document.createElement('td');
        const td1 = document.createElement('td');
  
        const td2 = document.createElement('td');
  
        const td3 = document.createElement('td');
  
        const td4 = document.createElement('td');
  
        const tr = document.createElement('tr');
  
        const ul = document.createElement('ul');
        const li = document.createElement('li');
        const li2 = document.createElement('li');
        const accion1 = document.createElement('a');
        const imgButton1 = document.createElement('img');
        const accion2 = document.createElement('a');

          accion1.href =`/administrador/productos/${producto._id}/upstockprecio`;
          imgButton1.classList.add('editButton')
            imgButton1.src='/imgs/png/contract.png'
        td1.textContent= producto.precioMinorista;
        td0.textContent= producto.nombre;
        td2.textContent= producto.marca;
        td3.textContent= producto.cantidad;
        accion1.append(imgButton1);
        tr.append(td0,td1,td2,td3,accion1)
        tableBody.append(tr);

        inputBuscar.value="";
        
      inputBuscar.focus();
 
      }
     
      inputBuscar.value="";

    
        } catch (error) {

   
          inputBuscar.value="";

       inputBuscar.focus();
        
          alerP.classList.remove('d-none')
          setTimeout(() => {
        alerP.classList.add('d-none')
            }, 3000)
    }
   
  })


  // formSearchCodigo.addEventListener('submit', async function(event){
  //   event.preventDefault();
  //   const query_buscar_codigo = formSearchCodigo.elements.buscarcodigo.value;
  //   console.log(query_buscar_codigo)
  //   try {
      
  //     const res = await axios.post('/administrador/productos/buscar-codigo', {buscar: query_buscar_codigo }); 
  //     const productosDeCodigo = res.data;

  //     console.log(productosDeCodigo);  

  //     // for (let producto of productosDeCodigo){

  //     //   const td0 = document.createElement('td');
  //     //   const td1 = document.createElement('td');
  
  //     //   const td2 = document.createElement('td');
  
  //     //   const td3 = document.createElement('td');
  
  //     //   const td4 = document.createElement('td');
  
  //     //   const tr = document.createElement('tr');
  
  //     //   const ul = document.createElement('ul');
  //     //   const li = document.createElement('li');
  //     //   const li2 = document.createElement('li');
  //     //   const accion1 = document.createElement('a');
  //     //   const accion2 = document.createElement('a');
  
  //     //   td1.textContent= producto.precioMinorista;
  //     //   td0.textContent= producto.nombre;
  //     //   td2.textContent= producto.marca;
  //     //   td3.textContent= producto.cantidad;
  
  //     //   tr.append(td0,td1,td2,td3)
  //     //   tableBody.append(tr);
  //     //   console.log(producto);  

  //     // }




  //     formSearchCodigo.elements.buscarcodigo.value = '';
  //     buscarcodigo.focus();
  //       } catch (error) {
  //     console.error(error);
  //   }
   
  // })
  // const agregarPeeroducto = (producto)=>{
  //     const td0 = document.createElement('td');
  //     const td1 = document.createElement('td');

  //     const td2 = document.createElement('td');

  //     const td3 = document.createElement('td');

  //     const td4 = document.createElement('td');

  //     const tr = document.createElement('tr');

  //     const ul = document.createElement('ul');
  //     const li = document.createElement('li');
  //     const li2 = document.createElement('li');
  //     const accion1 = document.createElement('a');
  //     const accion2 = document.createElement('a');

  //     td0.textContent= producto.precioMinorista;
  //     td1.textContent= producto.nombre;
  //     td2.textContent= producto.marca;
  //     td3.textContent= producto.cantidad;

  //     tr.append(td0,td1,td2,td3)
  //     tableBody.append(tr);
  
  //   }

    
  
