var carritoVisible = false;

function guardarCarritoEnLocalStorage(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Cargar el carrito desde el almacenamiento local
function cargarCarritoDesdeLocalStorage() {
  const carritoJSON = localStorage.getItem("carrito");
  if (carritoJSON) {
    return JSON.parse(carritoJSON);
  }
  return [];
}

// Función para generar el HTML de las cartas de Pokémon
async function generarCartasPokemon() {
  const response = await fetch("https://api.pokemontcg.io/v2/cards");
  const data = await response.json();

  if (!data.data || data.data.length === 0) {
    return "No se encontraron cartas de Pokémon.";
  }

  let cartas = {}; // Objeto para almacenar las cartas por nombre y precio más alto

  data.data.forEach((carta, index) => {
    const imagen = carta.images.small;
    let precio;
    const tipo = carta.types[0];

    if (
      carta &&
      carta.cardmarket &&
      carta.cardmarket.prices &&
      carta.cardmarket.prices.averageSellPrice !== undefined
    ) {
      precio = carta.cardmarket.prices.averageSellPrice;
    } else {
      precio = 10; // Precio ficticio
    }

    // Verifica si ya existe una carta con el mismo nombre
    if (!cartas[carta.name] || cartas[carta.name].precio < precio) {
      cartas[carta.name] = {
        imagen: imagen,
        tipo: tipo,
        precio: precio,
      };
    }
  });

  let html = "";

  // Genera el HTML utilizando las cartas almacenadas en el objeto
  Object.keys(cartas).forEach((nombre) => {
    const carta = cartas[nombre];
    const colores = getColoresDeDegradado(carta.tipo);
    const gradiente = getGradient(colores);

    html += `
      <div class="item" >
          <span class="titulo-item">${nombre}</span>
          <img src="${carta.imagen}" alt="" class="img-item">
          <span class="precio-item">$${carta.precio}</span>
          <button class="boton-item">Agregar al Carrito</button>
      </div>
    `;
  });
  // Inserta el HTML generado dentro del contenedor "contenedor-items"
  document.querySelector(".contenedor-items").innerHTML = html;

  if (document.readyState == "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
}

// Llama a la función para generar las cartas de Pokémon
generarCartasPokemon();

//Variable que mantiene el estado visible del carrito

//Espermos que todos los elementos de la pàgina cargen para ejecutar el script

function ready() {
  //Agregremos funcionalidad a los botones eliminar del carrito
  var botonesEliminarItem = document.getElementsByClassName("btn-eliminar");
  for (var i = 0; i < botonesEliminarItem.length; i++) {
    var button = botonesEliminarItem[i];
    button.addEventListener("click", eliminarItemCarrito);
  }

  //Agrego funcionalidad al boton sumar cantidad
  var botonesSumarCantidad = document.getElementsByClassName("sumar-cantidad");
  for (var i = 0; i < botonesSumarCantidad.length; i++) {
    var button = botonesSumarCantidad[i];
    button.addEventListener("click", sumarCantidad);
  }

  //Agrego funcionalidad al buton restar cantidad
  var botonesRestarCantidad =
    document.getElementsByClassName("restar-cantidad");
  for (var i = 0; i < botonesRestarCantidad.length; i++) {
    var button = botonesRestarCantidad[i];
    button.addEventListener("click", restarCantidad);
  }

  //Agregamos funcionalidad al boton Agregar al carrito
  var botonesAgregarAlCarrito = document.getElementsByClassName("boton-item");
  for (var i = 0; i < botonesAgregarAlCarrito.length; i++) {
    var button = botonesAgregarAlCarrito[i];
    button.addEventListener("click", agregarAlCarritoClicked);
  }

  //Agregamos funcionalidad al botón comprar
  document
    .getElementsByClassName("btn-pagar")[0]
    .addEventListener("click", pagarClicked);
}
//Eliminamos todos los elementos del carrito y lo ocultamos
function pagarClicked() {
  Swal.fire({
    title: "Gracias por la compra",
    icon: "success",
    confirmButtonText: "Aceptar",
    customClass: {
      container: "mi-clase-container", // Clase para el contenedor principal
      title: "mi-clase-titulo", // Clase para el título
      content: "mi-clase-contenido", // Clase para el contenido
      confirmButton: "mi-clase-boton", // Clase para el botón de confirmar
    },
  }).then((result) => {
    console.log("SweetAlert cerrado");
    // Elimino todos los elementos del carrito
    var carritoItems = document.getElementsByClassName("carrito-items")[0];
    while (carritoItems.hasChildNodes()) {
      carritoItems.removeChild(carritoItems.firstChild);
    }
    actualizarTotalCarrito();
    //ocultarCarrito(); // Corregir aquí
  });
}
//Funciòn que controla el boton clickeado de agregar al carrito
function agregarAlCarritoClicked(event) {
  var button = event.target;
  var item = button.parentElement;
  var titulo = item.getElementsByClassName("titulo-item")[0].innerText;
  var precio = item.getElementsByClassName("precio-item")[0].innerText;
  var imagenSrc = item.getElementsByClassName("img-item")[0].src;
  console.log(imagenSrc);

  agregarItemAlCarrito(titulo, precio, imagenSrc);
}

//Funcion que hace visible el carrito
//function hacerVisibleCarrito() {
//carritoVisible = true;
//var carrito = document.getElementsByClassName("carrito")[0];
//carrito.style.marginRight = "0";
//carrito.style.opacity = "1";

//var items = document.getElementsByClassName("contenedor-items")[0];
//items.style.width = "60%";
//}

//Funciòn que agrega un item al carrito
function agregarItemAlCarrito(titulo, precio, imagenSrc) {
  var item = document.createElement("div");
  item.classList.add = "item";
  var itemsCarrito = document.getElementsByClassName("carrito-items")[0];

  //controlamos que el item que intenta ingresar no se encuentre en el carrito
  var nombresItemsCarrito = itemsCarrito.getElementsByClassName(
    "carrito-item-titulo"
  );
  for (var i = 0; i < nombresItemsCarrito.length; i++) {
    if (nombresItemsCarrito[i].innerText == titulo) {
      Swal.fire({
        title: "El item ya se encuentra en el carrito",
        timer: 1500, // 3000 milisegundos (3 segundos)
        showConfirmButton: false,
      });
      return;
    }
  }

  var itemCarritoContenido = `
        <div class="carrito-item">
            <img src="${imagenSrc}" width="80%" alt="" >
            <div class="carrito-item-detalles" >
                <span class="carrito-item-titulo">${titulo}</span>
                <div class="selector-cantidad">
                    <i class="fa-solid fa-minus restar-cantidad"></i>
                    <input type="text" value="1" class="carrito-item-cantidad" disabled>
                    <i class="fa-solid fa-plus sumar-cantidad"></i>
                </div>
                <span class="carrito-item-precio">${precio}</span>
            </div>
            <button class="btn-eliminar">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
  item.innerHTML = itemCarritoContenido;
  itemsCarrito.append(item);

  //Agregamos la funcionalidad eliminar al nuevo item
  item
    .getElementsByClassName("btn-eliminar")[0]
    .addEventListener("click", eliminarItemCarrito);

  //Agregmos al funcionalidad restar cantidad del nuevo item
  var botonRestarCantidad = item.getElementsByClassName("restar-cantidad")[0];
  botonRestarCantidad.addEventListener("click", restarCantidad);

  //Agregamos la funcionalidad sumar cantidad del nuevo item
  var botonSumarCantidad = item.getElementsByClassName("sumar-cantidad")[0];
  botonSumarCantidad.addEventListener("click", sumarCantidad);

  //Actualizamos total
  actualizarTotalCarrito();
}
//Aumento en uno la cantidad del elemento seleccionado
function sumarCantidad(event) {
  var buttonClicked = event.target;
  var selector = buttonClicked.parentElement;
  console.log(
    selector.getElementsByClassName("carrito-item-cantidad")[0].value
  );
  var cantidadActual = selector.getElementsByClassName(
    "carrito-item-cantidad"
  )[0].value;
  cantidadActual++;
  selector.getElementsByClassName("carrito-item-cantidad")[0].value =
    cantidadActual;
  actualizarTotalCarrito();
}
//Resto en uno la cantidad del elemento seleccionado
function restarCantidad(event) {
  var buttonClicked = event.target;
  var selector = buttonClicked.parentElement;
  console.log(
    selector.getElementsByClassName("carrito-item-cantidad")[0].value
  );
  var cantidadActual = selector.getElementsByClassName(
    "carrito-item-cantidad"
  )[0].value;
  cantidadActual--;
  if (cantidadActual >= 1) {
    selector.getElementsByClassName("carrito-item-cantidad")[0].value =
      cantidadActual;
    actualizarTotalCarrito();
  }
}

//Elimino el item seleccionado del carrito
function eliminarItemCarrito(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  //Actualizamos el total del carrito
  actualizarTotalCarrito();

  //la siguiente funciòn controla si hay elementos en el carrito
  //Si no hay elimino el carrito
  //ocultarCarrito();
}
//Funciòn que controla si hay elementos en el carrito. Si no hay oculto el carrito.
function ocultarCarrito() {
  var carritoItems = document.getElementsByClassName("carrito-items")[0];
  if (carritoItems.childElementCount == 0) {
    var carrito = document.getElementsByClassName("carrito")[0];
    carrito.style.marginRight = "-100%";
    carrito.style.opacity = "0";
    carritoVisible = false;

    var items = document.getElementsByClassName("contenedor-items")[0];
    items.style.width = "100%";
  }
}
//Actualizamos el total de Carrito
function actualizarTotalCarrito() {
  var carritoContenedor = document.getElementsByClassName("carrito")[0];
  var carritoItems = carritoContenedor.getElementsByClassName("carrito-item");
  var total = 0;

  for (var i = 0; i < carritoItems.length; i++) {
    var item = carritoItems[i];
    var precioElemento = item.getElementsByClassName("carrito-item-precio")[0];
    var precioTexto = precioElemento.innerText;
    // Quitamos el símbolo peso y comas, y luego convertimos a número de punto flotante
    var precio = parseFloat(precioTexto.replace("$", ""));

    var cantidadItem = item.getElementsByClassName("carrito-item-cantidad")[0];
    var cantidad = parseInt(cantidadItem.value);

    total += precio * cantidad;
  }

  // Formateamos el total con dos decimales y coma
  total = total.toFixed(2);

  document.getElementsByClassName("carrito-precio-total")[0].innerText =
    "$" + total;
}

// Define los colores de degradado según el tipo del Pokémon
const coloresDeDegradado = {
  Normal: ["#E7F3FF", "#D7CCC8", "#FFFFFF"],
  Fire: ["#FF7961", "#FF9E80", "#FFC107", "#FFFFFF"],
  Water: ["#2196F3", "#4CAF50", "#E0F7FA", "#FFFFFF"],
  Grass: ["#C0E28C", "#FFFF8D", "#FFFFFF"],
  Electric: ["#FFFF00", "#FFFF99", "#FFFFCC", "#FFFFFF"],
  Psychic: ["#E91E63", "#F44336", "#FF9E80", "#FFFFFF"],
  Fighting: ["#F44336", "#FF7961", "#FF9E80", "#FFC107"],
  Poison: ["#E040FB", "#F06292", "#FFF443", "#FFFFFF"],
  Ground: ["#D68910", "#F44336", "#FFC107", "#FFFFFF"],
  Flying: ["#00B8D4", "#00ACC1", "#00BCD4", "#FFFFFF"],
  Bug: ["#64DD17", "#C0E28C", "#FFFF8D", "#FFFFFF"],
  Rock: ["#C0C0C0", "#D3D3D3", "#E6E6E6", "#FFFFFF"],
  Ghost: ["#297AB1", "#3F51B5", "#5C6BC0", "#FFFFFF"],
  Ice: ["#00BDE5", "#00ACC1", "#00BCD4", "#FFFFFF"],
  Dragon: ["#00BCD4", "#009688", "#4CAF50", "#FFFFFF"],
  Dark: ["#303F9F", "#2196F3", "#03A9F4", "#FFFFFF"],
  Steel: ["#A52A2A", "#E040FB", "#FF9E80", "#FFFFFF"],
  Fairy: ["#FF80AB", "#FFCEAB", "#FFFFFF"],
};

// Define los colores de degradado para un Pokémon específico
function getColoresDeDegradado(tipo) {
  return coloresDeDegradado[tipo] || coloresDeDegradado["Normal"];
}

// Define el degradado
function getGradient(colores) {
  const gradient = `linear-gradient(${colores.join(", ")})`;

  // Append the new value using concat() without modifying gradient
  const newGradient = gradient.concat(", #FFFFFF 0%");

  return newGradient;
}
