let traducciones = {};
let idiomaActual = "es";
let mineralDelDia = null;
let intentos = 0;
const maxIntentos = 6;
let minerales = [];
let cabeceraMostrada = false;

function setIdioma(idioma) {
  fetch(`lang/${idioma}.json`)
    .then(res => res.json())
    .then(data => {
      traducciones = data;
      idiomaActual = idioma;
      localStorage.setItem("idioma", idioma);
      aplicarTraducciones();
    });
}

function aplicarTraducciones() {
  document.getElementById("titulo").innerText = traducciones.titulo || "Mineraldle";
  document.getElementById("inputMineral").placeholder = traducciones.input_placeholder || "Escribe un mineral...";
  document.getElementById("btnAdivinar").innerText = traducciones.boton_adivinar || "Adivinar";
}

document.addEventListener("DOMContentLoaded", () => {
  const guardado = localStorage.getItem("idioma") || "es";
  setIdioma(guardado);

  fetch("minerales.json")
    .then(res => res.json())
    .then(data => {
      minerales = data;
      const hoy = new Date();
      const diaDelAno = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / 86400000);
      mineralDelDia = minerales[diaDelAno % minerales.length];
      iniciarAutocompletado();
    });

  document.getElementById("btnAdivinar").addEventListener("click", intentarAdivinar);
});

function iniciarAutocompletado() {
  const input = document.getElementById("inputMineral");
  const list = document.getElementById("autocomplete-list");

  input.addEventListener("input", function () {
    const val = this.value.toLowerCase();
    list.innerHTML = "";
    if (!val) return;

    const coincidencias = minerales.filter(m =>
      m.nombre.toLowerCase().includes(val)
    );

    coincidencias.forEach(mineral => {
      const li = document.createElement("li");
      li.textContent = mineral.nombre;
      li.addEventListener("click", () => {
        input.value = mineral.nombre;
        list.innerHTML = "";
      });
      list.appendChild(li);
    });
  });

  input.addEventListener("focus", function () {
    input.dispatchEvent(new Event('input'));
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".autocomplete-container")) {
      list.innerHTML = "";
    }
  });
}

function intentarAdivinar() {
  const input = document.getElementById("inputMineral").value.trim().toLowerCase();
  const mineral = minerales.find(m => m.nombre.toLowerCase() === input);
  if (!mineral) {
    alert("Mineral no encontrado en la base de datos.");
    return;
  }

  const fila = document.createElement("tr");

  // Create each cell with proper content and styling
  const celdaNombre = document.createElement("td");
  celdaNombre.className = "imagen-nombre";
  celdaNombre.innerHTML = `
    <div class="cuadro-icono">
      <img src="img/${mineral.nombre.toLowerCase()}.png" alt="${mineral.nombre}" />
      <span>${capitalizar(mineral.nombre)}</span>
    </div>
  `;

  const celdaDureza = document.createElement("td");
  celdaDureza.className = compararClase(mineral.dureza, mineralDelDia.dureza);
  celdaDureza.textContent = mineral.dureza;

  const celdaSistema = document.createElement("td");
  celdaSistema.className = compararClase(mineral.sistema, mineralDelDia.sistema);
  celdaSistema.textContent = mineral.sistema.map(s => capitalizar(s)).join(", ");

  const celdaBrillo = document.createElement("td");
  celdaBrillo.className = compararClase(mineral.brillo, mineralDelDia.brillo);
  celdaBrillo.textContent = mineral.brillo.map(b => capitalizar(b)).join(", ");

  const celdaGrupo = document.createElement("td");
  celdaGrupo.className = compararClase(mineral.grupo, mineralDelDia.grupo);
  celdaGrupo.textContent = mineral.grupo.map(g => capitalizar(g)).join(", ");

  // Append all cells to the row
  fila.appendChild(celdaNombre);
  fila.appendChild(celdaDureza);
  fila.appendChild(celdaSistema);
  fila.appendChild(celdaBrillo);
  fila.appendChild(celdaGrupo);

  document.getElementById("tabla-cuerpo").appendChild(fila);

  intentos++;
  if (mineral.nombre === mineralDelDia.nombre) {
    document.getElementById("resultado").innerText = (traducciones.mensajes?.correcto || "¡Correcto!") + " " + mineralDelDia.nombre;
  } else if (intentos >= maxIntentos) {
    document.getElementById("resultado").innerText = (traducciones.mensajes?.fallo || "Has fallado.") + " " + mineralDelDia.nombre;
  }

  // Clear the input
  document.getElementById("inputMineral").value = "";
}




function compararClase(valor, objetivo) {
  const val = Array.isArray(valor) ? valor.map(v => String(v).toLowerCase()) : [String(valor).toLowerCase()];
  const obj = Array.isArray(objetivo) ? objetivo.map(o => String(o).toLowerCase()) : [String(objetivo).toLowerCase()];
  const coincidencias = val.filter(v => obj.includes(v));

  const valSet = new Set(val);
  const objSet = new Set(obj);
  const conjuntosIguales = valSet.size === objSet.size && [...valSet].every(v => objSet.has(v));

  if (conjuntosIguales) return "verde";
  else if (coincidencias.length > 0) return "amarillo";
  else return "rojo";
}




function comparar(valor, objetivo) {
  const val = Array.isArray(valor) ? valor.map(v => String(v).toLowerCase()) : [String(valor).toLowerCase()];
  const obj = Array.isArray(objetivo) ? objetivo.map(o => String(o).toLowerCase()) : [String(objetivo).toLowerCase()];
  const coincidencias = val.filter(v => obj.includes(v));

  const valSet = new Set(val);
  const objSet = new Set(obj);
  const conjuntosIguales = valSet.size === objSet.size && [...valSet].every(v => objSet.has(v));

  let clase = "rojo";
  if (conjuntosIguales) {
    clase = "verde";
  } else if (coincidencias.length > 0) {
    clase = "amarillo";
  }

  return `<td class="${clase}">${val.map(v => capitalizar(v)).join(", ")}</td>`;
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
