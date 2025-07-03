let traducciones = {};
let idiomaActual = "es";
let mineralDelDia = null;
let intentos = 0;
const maxIntentos = 10;
let juegoTerminado = false;
let minerales = [];
let cabeceraMostrada = false;

function updateCounter() {
  const valor = maxIntentos - intentos;
  document.getElementById("counter-value").innerText = valor;
}

function deshabilitarJuego() {
  document.getElementById("inputMineral").disabled = true;
  document.getElementById("btnAdivinar").disabled = true;
}

function mostrarModal(gano) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-title").innerText = gano
    ? traducciones.mensajes?.ganaste_titulo || "YOU WON!"
    : traducciones.mensajes?.perdiste_titulo || "GAME OVER";
  document.getElementById("modal-mineral").innerText =
    (traducciones.mensajes?.mineral_era || "El mineral era:") +
    " " +
    traducirValor(mineralDelDia.nombre);
  document.getElementById("modal-img").src =
    "img/" + mineralDelDia.nombre.toLowerCase() + ".png";
  document.getElementById("modal-img").alt = traducirValor(mineralDelDia.nombre);
  document.getElementById("modal-intentos").innerText =
    (traducciones.mensajes?.intentos || "Intentos:") + " " + intentos;
  modal.classList.remove("hidden");
}

function mostrarFuegos() {
  const fw = document.getElementById("fireworks");
  fw.classList.remove("hidden");
  setTimeout(() => fw.classList.add("hidden"), 2000);
}

function traducirValor(valor) {
  const key = String(valor).toLowerCase();
  return (traducciones.valores && traducciones.valores[key]) || valor;
}

function traducirLista(arr) {
  return arr.map(traducirValor);
}

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
  if (traducciones.propiedades) {
    document.getElementById("th-grupo").innerText = traducciones.propiedades.grupo || "Grupo";
    document.getElementById("th-sistema").innerText = traducciones.propiedades.sistema || "Sistema";
    document.getElementById("th-color").innerText = traducciones.propiedades.color || "Color";
    document.getElementById("th-brillo").innerText = traducciones.propiedades.brillo || "Brillo";
    document.getElementById("th-dureza").innerText = traducciones.propiedades.dureza || "Dureza";
    document.getElementById("th-densidad").innerText = traducciones.propiedades.densidad || "Densidad";
  }
  document.getElementById("counter-label").innerText =
    (traducciones.mensajes?.intentos_restantes || "Intentos:");
  updateCounter();
}

document.addEventListener("DOMContentLoaded", () => {
  const guardado = localStorage.getItem("idioma") || "es";
  setIdioma(guardado);
  updateCounter();

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
  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
  });
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

async function intentarAdivinar() {
  if (juegoTerminado || intentos >= maxIntentos) return;
  const input = document.getElementById("inputMineral").value.trim().toLowerCase();
  const mineral = minerales.find(m => m.nombre.toLowerCase() === input);
  if (!mineral) {
    alert("Mineral no encontrado en la base de datos.");
    return;
  }

  intentos++;
  updateCounter();
  const numeroIntento = intentos;

  const fila = document.createElement("tr");

  const celdaNombre = crearFlipCell(
    `<div class="cuadro-icono">
        <img src="img/${mineral.nombre.toLowerCase()}.png" alt="${traducirValor(mineral.nombre)}" />
        <span>${traducirValor(mineral.nombre)}</span>
     </div>`,
    "",
    "imagen-nombre"
  );
  const spanNum = document.createElement("span");
  spanNum.className = "numero-intento";
  spanNum.textContent = `#${numeroIntento}`;
  celdaNombre.appendChild(spanNum);
  fila.appendChild(celdaNombre);

  fila.appendChild(
    crearFlipCell(
      traducirLista(mineral.grupo).join(", "),
      compararClase(mineral.grupo, mineralDelDia.grupo)
    )
  );
  fila.appendChild(
    crearFlipCell(
      traducirLista(mineral.sistema).join(", "),
      compararClase(mineral.sistema, mineralDelDia.sistema)
    )
  );
  fila.appendChild(
    crearFlipCell(
      traducirLista(mineral.color).join(", "),
      compararClase(mineral.color, mineralDelDia.color)
    )
  );
  fila.appendChild(
    crearFlipCell(
      traducirLista(mineral.brillo).join(", "),
      compararClase(mineral.brillo, mineralDelDia.brillo)
    )
  );
  fila.appendChild(crearFlipCell(mineral.dureza, compararClase(mineral.dureza, mineralDelDia.dureza)));
  fila.appendChild(crearFlipCell(mineral.densidad, compararClase(mineral.densidad, mineralDelDia.densidad)));

  const cuerpo = document.getElementById("tabla-cuerpo");
  cuerpo.insertBefore(fila, cuerpo.firstChild);
  await revealRow(fila);

  const gano = mineral.nombre === mineralDelDia.nombre;
  if (gano || intentos >= maxIntentos) {
    juegoTerminado = true;
    deshabilitarJuego();
    if (gano) {
      mostrarFuegos();
      setTimeout(() => mostrarModal(true), 2000);
    } else {
      mostrarModal(false);
    }
  }
}




function compararClase(valor, objetivo) {
  const ambosNumeros =
    !Array.isArray(valor) &&
    !Array.isArray(objetivo) &&
    !isNaN(parseFloat(valor)) &&
    !isNaN(parseFloat(objetivo));

  if (ambosNumeros) {
    const diff = Math.abs(parseFloat(valor) - parseFloat(objetivo));
    if (diff === 0) return "verde";
    if (diff <= 1) return "amarillo";
    return "rojo";
  }

  const val = Array.isArray(valor)
    ? valor.map(v => String(v).toLowerCase())
    : [String(valor).toLowerCase()];
  const obj = Array.isArray(objetivo)
    ? objetivo.map(o => String(o).toLowerCase())
    : [String(objetivo).toLowerCase()];
  const coincidencias = val.filter(v => obj.includes(v));

  const valSet = new Set(val);
  const objSet = new Set(obj);
  const conjuntosIguales = valSet.size === objSet.size && [...valSet].every(v => objSet.has(v));

  if (conjuntosIguales) return "verde";
  if (coincidencias.length > 0) return "amarillo";
  return "rojo";
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

function crearFlipCell(contenido, colorClase = "", extra = "") {
  const td = document.createElement("td");
  td.className = `flip-card ${extra}`.trim();

  const inner = document.createElement("div");
  inner.className = "flip-card-inner";

  const front = document.createElement("div");
  front.className = "flip-card-front";
  front.textContent = "?";

  const back = document.createElement("div");
  back.className = `flip-card-back ${colorClase}`.trim();
  back.innerHTML = contenido;

  inner.appendChild(front);
  inner.appendChild(back);
  td.appendChild(inner);

  return td;
}

function revealRow(fila) {
  return new Promise(resolve => {
    const celdas = Array.from(fila.querySelectorAll(".flip-card"));
    celdas.forEach((celda, idx) => {
      setTimeout(() => {
        celda.classList.add("flipped");
        if (idx === celdas.length - 1) {
          setTimeout(resolve, 500);
        }
      }, idx * 500);
    });
  });
}
