# Sistema de Agencia de Viajes

![commits](https://badgen.net/github/commits/clubdecomputacion/lpa1-taller-requerimientos?icon=github)
![last_commit](https://img.shields.io/github/last-commit/clubdecomputacion/lpa1-taller-requerimientos)

- ver [badgen](https://badgen.net/) o [shields](https://shields.io/) para otros tipos de _badges_

## Autor

- [@estudiante](https://www.github.com/estudiante)

## Descripción del Proyecto

El **Sistema de Agencia de Viajes** es una plataforma integral diseñada para optimizar la administración y las reservas de una red de hoteles.

**Características principales:**

* **Gestión de Alojamientos:** Permite administrar perfiles detallados de hoteles y habitaciones (incluyendo fotografías y servicios), además de contar con un control de estado para inhabilitar espacios temporalmente por mantenimiento o remodelación.
* **Precios Dinámicos y Calendarios:** Calcula las tarifas de forma automática basándose en la temporada regional y la cantidad de huéspedes. Se apoya en calendarios precisos para controlar la disponibilidad de cada habitación.
* **Búsqueda y Reservas:** Ofrece a los clientes un buscador avanzado con filtros por fecha, ubicación, precio y calificación. También gestiona de forma automatizada las políticas de pago y cancelación específicas de cada establecimiento.
* **Sistema de Calificaciones:** Integra un módulo de reseñas donde los huéspedes evalúan su estancia, generando calificaciones promedio (por habitación y por hotel) visibles para futuros viajeros.

Este software ha sido diseñado bajo los principios de **Análisis y Diseño Orientado a Objetos (POO)** en Python, garantizando una arquitectura estructurada y basada estrictamente en los requerimientos extraídos del cliente.

## Documentación

Revisar la documentación en [`./docs`](./docs)

### Requerimientos

**Gestión de Hoteles y Habitaciones:**

* **R1:** El sistema debe permitir el registro de un nuevo hotel almacenando su nombre, dirección, teléfono, correo electrónico, ubicación geográfica, descripción de servicios (restaurante, piscina, gimnasio) y fotografías.
* **R2:** El sistema debe permitir la configuración de ofertas especiales y promociones por temporada para los hoteles, así como la oferta de servicios adicionales como estacionamiento o áreas de coworking.
* **R3:** El sistema debe permitir registrar las habitaciones de cada hotel, incluyendo su tipo, descripción, precio, servicios incluidos, capacidad y fotos.
* **R4:** El sistema debe manejar un estado de actividad para los hoteles, permitiendo marcarlos como inactivos (por ejemplo, por reformas) para que no estén disponibles para reservas.
* **R5:** El sistema debe manejar un estado de actividad independiente para cada habitación (activa o inactiva por mantenimiento, remodelación o desinfección). Sólo las habitaciones activas pueden reservarse.

**Precios, Disponibilidad y Políticas:**

* **R6:** El sistema debe calcular el precio de la habitación dinámicamente dependiendo de la cantidad de personas a alojarse (sin exceder la capacidad) y de la temporada.
* **R7:** El sistema debe soportar la gestión de temporadas a través de un calendario regional general y un calendario específico por cada hotel.
* **R8:** El sistema debe contar con un calendario detallado por cada habitación para indicar los días en los que está ocupada y los días disponibles para reservar.
* **R9:** El sistema debe soportar múltiples condiciones de pago (pago completo por adelantado o pago al llegar) según la configuración del hotel.
* **R10:** El sistema debe gestionar diferentes políticas de cancelación (que varían por hotel, tipo de habitación y temporada) y determinar si aplica un reembolso completo o una penalidad.

**Interacción con el Cliente y Reservas:**

* **R11:** El sistema debe permitir el registro de clientes con su nombre completo, número de teléfono, correo electrónico y dirección.
* **R12:** El sistema debe permitir a los clientes realizar búsquedas de habitaciones filtrando por fecha, ubicación, calificación o precio, y permitir la combinación de estos criterios.
* **R13:** El sistema debe mostrar el detalle de la habitación seleccionada por el cliente, incluyendo características, servicios, fotos, calificaciones y comentarios de otros huéspedes.
* **R14:** El sistema debe permitir a los clientes dejar una calificación y comentarios después de su estancia.
* **R15:** El sistema debe calcular una calificación promedio por cada habitación de manera individual, y una calificación promedio general para todo el hotel.
* **R16:** El sistema debe formalizar la reserva una vez que el cliente confirma su selección de habitación y se verifica el pago correspondiente.

### Diseño

**1. Clase `Hotel`**

* **Atributos:** `nombre`, `direccion`, `telefono`, `correo`, `ubicacion`, `servicios_generales`, `fotos`, `estado` (activo/inactivo), `politicas_pago`, `politicas_cancelacion`, `habitaciones` (Lista de objetos `Habitacion`), `promociones`.
* **Métodos:** * `agregar_habitacion()`
  * `cambiar_estado()`
  * `calcular_calificacion_promedio()` (promedia las calificaciones de sus habitaciones)

**2. Clase `Habitacion`**

* **Atributos:** `numero` (o ID), `tipo`, `descripcion`, `precio_base`, `servicios_incluidos`, `capacidad_maxima`, `fotos`, `estado` (activa/inactiva), `calendario_disponibilidad`, `comentarios` (Lista de objetos `Comentario`).
* **Métodos:**
  * `calcular_precio(cantidad_personas, fecha)`
  * `verificar_disponibilidad(fechas)`
  * `cambiar_estado()`
  * `agregar_comentario()`
  * `calcular_calificacion_promedio()`

**3. Clase `Cliente`**

* **Atributos:** `nombre_completo`, `telefono`, `correo`, `direccion`, `historial_reservas`.
* **Métodos:**
  * `buscar_habitacion(criterios)`
  * `realizar_reserva()`
  * `dejar_comentario(habitacion, calificacion, texto)`

**4. Clase `Reserva`**

* **Atributos:** `cliente` (Objeto `Cliente`), `habitacion` (Objeto `Habitacion`), `fecha_inicio`, `fecha_fin`, `cantidad_personas`, `estado_pago`, `monto_total`.
* **Métodos:**
  * `confirmar_pago()`
  * `cancelar_reserva()`
  * `calcular_reembolso()`

**5. Clase `Comentario`**

* **Atributos:** `autor` (Objeto `Cliente`), `calificacion` (1 a 5), `texto`, `fecha`.

**6. Clase `SistemaReservas` (Clase controladora/Gestor principal)**

* **Atributos:** `hoteles` (Lista de objetos `Hotel`), `clientes` (Lista de objetos `Cliente`), `calendario_regional` (Gestión de temporadas altas/bajas).
* **Métodos:**
  * `registrar_hotel()`
  * `registrar_cliente()`
  * `buscar_habitaciones(parametros)`

### Tárifas

| destino | pasajes | silver | gold | platinum |
| :------ | ------: | -----: | ---: | -------: |
| Aruba   |     418 |    134 |  167 |      191 |
| Bahamas |     423 |    112 |  183 |      202 |
| Cancún |     350 |    105 |  142 |      187 |
| Hawaii  |     858 |    210 |  247 |      291 |
| Jamaica |     380 |    115 |  134 |      161 |
| Madrid  |     496 |    190 |  230 |      270 |
| Miami   |     334 |    122 |  151 |      183 |
| Moscu   |     634 |    131 |  153 |      167 |
| NewYork |     495 |    104 |  112 |      210 |
| Panamá |     315 |    119 |  138 |      175 |
| Paris   |     512 |    210 |  260 |      290 |
| Rome    |     478 |    184 |  220 |      250 |
| Seul    |     967 |    205 |  245 |      265 |
| Sidney  |    1045 |    170 |  199 |      230 |
| Taipei  |     912 |    220 |  245 |      298 |
| Tokio   |     989 |    189 |  231 |      255 |

## Instalación

TODO: Corregir la explicación de la instalación - Morbi quam lectus, tempus sit amet mi non, facilisis dignissim erat. Aenean tortor libero, rhoncus eu eleifend ut, volutpat id nisi. Ut porta eros at ante rutrum pharetra. Integer nec nulla dictum, vestibulum ligula id, hendrerit ex. Morbi eget tortor metus.

1. Clonar el proyecto

   ```bash
   git clone https://github.com/clubdecomputacion/lpa1-taller-requerimientos.git
   ```
2. Crear y activar entorno virtual

   ```bash
   cd lpa1-taller-requerimientos
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Instalar librerías y dependencias

   ```bash
   pip install -r requirements.txt
   ```

## Ejecución

TODO: Corregir la explicación de la ejecución - Maecenas sed lorem at arcu varius mollis. Sed eleifend nulla ut blandit interdum. Donec sollicitudin nunc at orci facilisis dignissim. Donec at arcu luctus, commodo magna eget, blandit leo.

1. Ejecutar el proyecto

   ```bash
   cd lpa1-taller-requerimientos
   python3 app.py
   ```
