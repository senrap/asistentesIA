/* Copia de respaldo del Google Sheet — no editar a mano.
   El sitio la usa solo si no consigue leer la planilla en vivo.
   Generada el 2026-08-27T00:10:17.159Z desde fixtures/ (--local).
   El contenido posterior a ese momento no está acá. */
window.PROGRAMA = {
  "generado": "2026-08-27T00:10:17.159Z",
  "programas": [
    {
      "id": "powerh_1",
      "slug": "powerh_1",
      "nombre": "Power BI para Recursos Humanos",
      "inicio": "2026-03-10",
      "fin": "2026-04-21",
      "sesiones": 6,
      "facilitador": "Pablo",
      "cliente": "Chacomer",
      "logo": "https://i.ibb.co/95ZDmJ4/Logo-HACHE-blanco-estrecho-2-1.png",
      "comentarios": "",
      "bloques": [
        {
          "programa": "powerh_1",
          "nombre": "Bloque 1: Los datos pueden transformar HR",
          "slug": "bloque-1-los-datos-pueden-transformar-hr",
          "titulo": "Los datos pueden transformar HR con People Analytics & Power BI",
          "emoji": "🎯",
          "bajada": "Qué es People Analytics, las 4 vistas de Power BI y cómo obtener y transformar tus datos.",
          "objetivo": "Al finalizar este bloque vas a tener mayor claridad sobre **qué es People Analytics** y cuáles son los beneficios de comenzar a tomar decisiones basadas en datos.\n\nTambién presentaremos **Power BI** y el caso de análisis que trabajaremos, y nos adentraremos en el mundo de **ETL** (Extracción, Transformación y Carga). Vamos a aprender a manipular nuestros datos para que sean más útiles y fáciles de analizar.",
          "fecha": "2026-03-10",
          "orden": 1,
          "_fila": 0,
          "tarjetas": [
            {
              "programa": "powerh_1",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "tipo": "material",
              "titulo": "Base para el ejercicio",
              "texto": "Acá está **la base que vamos a utilizar** durante todo el workshop. Descargala antes de la primera sesión así arrancamos todos desde el mismo lugar.",
              "imagen": "",
              "link": "",
              "archivos": [
                {
                  "nombre": "Nómina Panda",
                  "url": "https://drive.google.com/file/d/1Y3zWC6LgODmkbRq0KFg2Rx4wwZ4GO-wd/view"
                }
              ],
              "fecha": "",
              "orden": 0,
              "_fila": 0,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "tipo": "material",
              "titulo": "Presentación",
              "texto": "Te dejamos la presentación que compartimos en este bloque.",
              "imagen": "",
              "link": "",
              "archivos": [
                {
                  "nombre": "PoweRH · Bloque 1 (PDF)",
                  "url": "https://drive.google.com/file/d/10PKtrIWRXgkc-MHKji9etu4gYKWEjB-g/view"
                }
              ],
              "fecha": "",
              "orden": 0,
              "_fila": 4,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "tipo": "tarea",
              "titulo": "Tarea",
              "texto": "Termina la primera semana y es un excelente momento para practicar.\n\n1. Creá un nuevo archivo de Power BI e **importá** una base (puede ser la del curso u otra que tengas).\n2. Entrá a **Transformar datos** y creá al menos **5 pasos** de transformación. Acordate de chequear el tipo de datos de cada columna.\n3. **Documentá** alguno de esos pasos haciendo click derecho sobre el nombre del paso y entrando a Propiedades, para cambiarle el nombre y explicar qué hace. Es una excelente forma de recordar después el proceso.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 3,
              "_fila": 5,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "tipo": "contenido",
              "titulo": "Las 4 vistas de Power BI",
              "texto": "Power BI tiene **4 vistas** 😎, y según en cuál estés vas a poder hacer cosas distintas.\n\n- 🛠 **Transformar datos:** el editor donde preparás los datos para el posterior análisis.\n- 🎨 **Vista Informe:** el lugar donde vamos a graficar nuestro informe.\n- 🗃 **Vista de Datos:** nos permite ver la tabla, revisar formatos y crear columnas calculadas.\n- 🧩 **Vista de Modelo:** acá relacionamos nuestras diferentes tablas.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 1,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "tipo": "contenido",
              "titulo": "Obtener datos",
              "texto": "Power BI trabaja con datos que están en **orígenes externos**. Recordá que *lo primero que tenés que hacer* es conectar tus datos.\n\nPodés hacerlo desde el menú de Inicio con el botón de **Obtener datos**, o directamente desde Excel si vas a trabajar con ese origen.\n\nCuando conectes datos cargados manualmente en Excel, te recomendamos darles **formato de tabla** antes de importarlos.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 2,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "tipo": "contenido",
              "titulo": "Transformar datos",
              "texto": "Al importar una base de datos es importante pasar por **Transformar datos** y prepararlos antes de comenzar el análisis. Algunas transformaciones que hicimos:\n\n- Chequear el tipo de datos (mucho muy importante 😂)\n- Filtrar filas en blanco y elegir columnas\n- Modificar formatos (mayúsculas, minúsculas, etc.)\n- Combinar columnas\n- Reemplazar y extraer valores\n- Operaciones de fecha\n- Operaciones matemáticas y de redondeo\n- Crear columnas condicionales (generaciones, rangos de edad, etc.)\n\n## Tres cosas para no marearte\n\n- Si te aparece un paso llamado **\"Filas Filtradas\"** y no lo aplicaste intencionalmente, la recomendación es eliminarlo con la \"x\".\n- Si te aparece el cartel de **\"Insertar un paso\"**, salvo que lo estés haciendo a propósito, cancelá y posicionate en el último paso del menú de pasos aplicados antes de volver a crearlo.\n- Cuando termines de trabajar en esta vista, aplicá los cambios desde el menú de inicio clickeando en **Cerrar y aplicar**.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 3,
              "abierta": true
            }
          ],
          "grabaciones": [
            {
              "programa": "powerh_1",
              "sesion": "1",
              "numero": 1,
              "titulo": "People Analytics & Power BI",
              "fecha": "2026-03-10",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "link": ""
            },
            {
              "programa": "powerh_1",
              "sesion": "2",
              "numero": 2,
              "titulo": "Descubriendo el poder de ETL",
              "fecha": "2026-03-17",
              "bloque": "Bloque 1: Los datos pueden transformar HR",
              "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
              "link": "https://us02web.zoom.us/rec/share/T9Go6wWpU7RDNWHV9DNYOtZEAB5MFaS38kju_jVHE3lex_t1Omc-q4FwyNIJOrTi.924Cg7OFZ5rW9Y9R?startTime=1712844261000"
            }
          ],
          "numero": 1,
          "abierto": true
        },
        {
          "programa": "powerh_1",
          "nombre": "Bloque 2: De la transformación de datos a la visualización",
          "slug": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
          "titulo": "De la transformación de datos a la visualización de información",
          "emoji": "📊",
          "bajada": "Cinco pasos para construir buenas visualizaciones y los poderes ocultos de los gráficos.",
          "objetivo": "Viajaremos desde la transformación de datos hasta la **visualización de información significativa**, con herramientas y técnicas para comprender mejor nuestra fuerza laboral y tomar decisiones informadas en Recursos Humanos.\n\nDicen que una imagen vale más que mil palabras: en este bloque empezamos a construir nuestra primera página de informe.",
          "fecha": "2026-03-24",
          "orden": 2,
          "_fila": 1,
          "tarjetas": [
            {
              "programa": "powerh_1",
              "bloque": "Bloque 2: De la transformación de datos a la visualización",
              "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
              "tipo": "material",
              "titulo": "Plantilla para el desafío",
              "texto": "Vamos a usar esta imagen para acompañar los ejercicios del primer desafío.\n\nLas plantillas se agregan desde **fondo de página** en el rodillo. Acordate siempre de **ajustar** la imagen y poner la **transparencia en 0%**.",
              "imagen": "",
              "link": "",
              "archivos": [
                {
                  "nombre": "Plantilla del desafío",
                  "url": "https://drive.google.com/file/d/10j0GH2so4pVNXhv3dP7kChOqYOwAJyw0/view"
                }
              ],
              "fecha": "",
              "orden": 0,
              "_fila": 8,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 2: De la transformación de datos a la visualización",
              "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
              "tipo": "material",
              "titulo": "Presentación",
              "texto": "Te compartimos la presentación del segundo bloque.",
              "imagen": "",
              "link": "",
              "archivos": [
                {
                  "nombre": "PoweRH · Bloque 2 (PDF)",
                  "url": "https://drive.google.com/file/d/1upsLaZ2aMpaH1z6Sq0Q8CqhXYolow67n/view"
                }
              ],
              "fecha": "",
              "orden": 0,
              "_fila": 9,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 2: De la transformación de datos a la visualización",
              "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
              "tipo": "tarea",
              "titulo": "Tarea",
              "texto": "Vamos a practicar un poco con lo que fuimos viendo.\n\n## Diversidad de género\n\nCreá un gráfico que muestre la distribución del headcount por género.\n\n## Diversidad de género por nivel\n\nPara analizar más en profundidad qué tan diversos somos, abrí esta información por los niveles que creamos en la primera página.\n\n## Distribución de la nómina por generación\n\nEs importante que la visualización respete el orden jerárquico de las generaciones para que el impacto visual sea más claro. Puede que encuentres un desafío especial en estos dos últimos gráficos para ordenar las variables del Eje Y, ya que son categóricas (de texto).\n\nPodés [ayudarte con este tutorial](https://www.youtube.com/watch?v=vUB88vjypGk) de nuestro canal. Suscribite para recibir info de los videos nuevos que vayamos subiendo.\n\nPor otro lado, vas a ver que las etiquetas muestran una frecuencia relativa (% del total). La pista para que encuentres cómo hacerlo es que busques en el menú de opciones del Eje X, donde llevaste la cantidad de personas.\n\n## Mediana de compensación por género\n\nPara terminar, calculá la mediana de compensación y abrila por dos variables: nivel y género. Es muy parecido a lo que hicimos en la primera página; si no sabés cómo llegar, podés empezar desde ahí.\n\nTratá de generarlo lo más parecido posible a la imagen y en el check in de la próxima sesión lo vemos.",
              "imagen": "",
              "link": "",
              "archivos": [
                {
                  "nombre": "Plantilla de la tarea",
                  "url": "https://drive.google.com/file/d/1mneUWdH3st95BS2zihqNf-aFWwCAL96L/view"
                }
              ],
              "fecha": "",
              "orden": 3,
              "_fila": 10,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 2: De la transformación de datos a la visualización",
              "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
              "tipo": "contenido",
              "titulo": "5 pasos para crear buenas visualizaciones",
              "texto": "## 1️⃣ Elegir la visualización\n\n- 🔲 Si sólo vas a mostrar un dato, la **tarjeta** es una excelente opción.\n- 📊 Si necesitás comparar valores o establecer un ranking, usá gráficos de **barras o columnas**. Un consejo para elegir: barras para variables categóricas (texto), columnas para variables numéricas o de tiempo.\n- 📈 Los **gráficos de líneas** suelen usarse para mostrar tendencia en el tiempo.\n- 🎂 Los **gráficos de torta o anillos** usalos con cuidado y para 2 o 3 segmentos máximo.\n- 🎛 Los **segmentadores** te permiten filtrar a los demás gráficos.\n- 📄 Las **tablas y matrices** son buenas para datos que se necesiten recorrer uno a uno; lo ideal es usarlas con conjuntos de hasta 20 datos.\n\n## 2️⃣ Seleccionar los campos\n\nEste paso es muy simple, Power BI permite arrastrar y tirar. En general los gráficos muestran un valor (la columna que llevás a *valores*) y lo segmentan de alguna forma (la columna que va al eje, a detalles o a leyenda).\n\n## 3️⃣ Elegir la operación\n\nAcá definís la operación a realizar (suma, promedio, mediana…) desde el menú ▼. En ese mismo menú encontrás cómo mostrar el valor **como porcentaje del total**, y si estás en una variable de segmentación podés agruparla con la función **Nuevo grupo**.\n\n## 4️⃣ Aplicar filtros\n\nLos filtros son muy parecidos a los de Excel, pero acá los aplicás en tres niveles:\n\n- 📊 A un único gráfico (*en este gráfico hablo de los líderes solamente*).\n- 📄 A todos los gráficos de una página (*en esta página hablo de activos*).\n- 📕 A todo el informe (*quiero que todo el informe sea de un área*).\n\n## 5️⃣ Trabajar sobre el formato\n\n👩‍🎨 El rodillo te permite cambiar casi todo lo que tiene que ver con el formato.\n\nSi querés trabajar con plantillas como hicimos en el workshop, tené en cuenta que se agregan desde **fondo de página** en el rodillo (no tenés que tener ningún gráfico seleccionado al entrar) y acordate de poner la **transparencia en 0%**.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 6,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 2: De la transformación de datos a la visualización",
              "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
              "tipo": "contenido",
              "titulo": "Poderes ocultos de las visualizaciones",
              "texto": "🤿 Si tenés más de un campo en el eje del objeto visual van a aparecer las opciones de **Explorar en profundidad** o *drill down*. Te permiten cambiar el nivel de detalle (granularidad) con que segmentás esos valores. Podés recorrer los diferentes niveles con las flechas ↑ ↓ ⇊ que aparecen sobre el gráfico.\n\n🐱‍💻 Por otro lado, recordá que los gráficos **se pueden filtrar entre sí**. Si querés modificar ese funcionamiento, entrá a Formato → **Editar interacciones**.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 7,
              "abierta": true
            }
          ],
          "grabaciones": [
            {
              "programa": "powerh_1",
              "sesion": "3",
              "numero": 3,
              "titulo": "Primeras visualizaciones",
              "fecha": "2026-03-24",
              "bloque": "Bloque 2: De la transformación de datos a la visualización",
              "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
              "link": "https://us02web.zoom.us/rec/share/zqYdjl_R2bia_9KM_NPieWaQ9Et25HTh6CuDutssSxePxlv3sLI_QwC17AWlz1G_.zAA6h8Kno4IFbsXF"
            },
            {
              "programa": "powerh_1",
              "sesion": "4",
              "numero": 4,
              "titulo": "Visualizaciones con impacto",
              "fecha": "2026-03-31",
              "bloque": "Bloque 2: De la transformación de datos a la visualización",
              "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
              "link": "https://us02web.zoom.us/rec/share/mY4jdFIfQMFzqM_mLphozV6LjbwUz3JA20_328BaQ1bxynfjiUsCeY6Y_Yn74nS_.2awmvNE0gp4NF8xY"
            }
          ],
          "numero": 2,
          "abierto": true
        },
        {
          "programa": "powerh_1",
          "nombre": "Bloque 3: Desbloquear el potencial de los datos con DAX",
          "slug": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
          "titulo": "De la foto a la evolución temporal: desbloqueamos el poder de los datos con DAX",
          "emoji": "🚀",
          "bajada": "Dejamos la foto de un momento para entender tendencias en el tiempo, con columnas y medidas.",
          "objetivo": "Vamos a dejar de examinar la foto de un momento específico para **visualizar y entender tendencias a lo largo del tiempo**. Aprenderemos a transformar datos estáticos en información dinámica y significativa.\n\nTambién vamos a sumergirnos en **DAX** (Data Analysis Expressions), el lenguaje que permite crear fórmulas y expresiones para cálculos complejos, resúmenes y filtrados.",
          "fecha": "2026-04-07",
          "orden": 3,
          "_fila": 2,
          "tarjetas": [
            {
              "programa": "powerh_1",
              "bloque": "Bloque 3: Desbloquear el potencial de los datos con DAX",
              "slugBloque": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
              "tipo": "material",
              "titulo": "Base para el ejercicio",
              "texto": "Para poder mirar la evolución en el tiempo necesitamos más de una foto. Acá está la base con los meses siguientes.",
              "imagen": "",
              "link": "",
              "archivos": [
                {
                  "nombre": "Panda · otros meses",
                  "url": "https://drive.google.com/file/d/1TFpU-mDu002bTAgGKeXBfIUIp7wH58Zm/view"
                }
              ],
              "fecha": "",
              "orden": 0,
              "_fila": 11,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 3: Desbloquear el potencial de los datos con DAX",
              "slugBloque": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
              "tipo": "material",
              "titulo": "Plantilla Evolución HC",
              "texto": "La plantilla de la página de evolución de headcount, para que tu informe quede como el que vamos armando en vivo.",
              "imagen": "",
              "link": "",
              "archivos": [
                {
                  "nombre": "Plantilla Evolución HC",
                  "url": "https://drive.google.com/file/d/1bdgQ0QliPF-2FLmhYd7ePSjwrnSudKh_/view"
                }
              ],
              "fecha": "",
              "orden": 0,
              "_fila": 12,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 3: Desbloquear el potencial de los datos con DAX",
              "slugBloque": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
              "tipo": "enlace",
              "titulo": "Para seguir investigando DAX",
              "texto": "¿Querés investigar otra forma de trabajar con múltiples fotos? Te dejamos algunos recursos:\n\n- [Tutorial de HACHE sobre cómo calcular ausentismo con DAX](https://www.youtube.com/@ConsultoraHACHE)\n- [La guía de fórmulas de DAX](https://learn.microsoft.com/es-es/dax/dax-function-reference) (son muchas, andá con paciencia)\n- [Traductor de funciones de Excel](https://es.excel-translator.de/translator/), el que conversamos en la sesión.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 1,
              "_fila": 15,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 3: Desbloquear el potencial de los datos con DAX",
              "slugBloque": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
              "tipo": "contenido",
              "titulo": "Columnas DAX",
              "texto": "- Una columna en DAX es similar a una columna en Excel: contiene valores calculados a partir de una fórmula.\n- Las columnas **se agregan a las tablas** y se calculan **fila por fila**.\n- Un ejemplo sería una columna que calcule la compensación neta de cada persona multiplicando el sueldo bruto por 83%. Devuelve un valor fila a fila.\n\nSe escribiría así:\n\n`Comp. Neta = Tabla[Compensación Bruta] * 0.83`\n\nTambién podemos usar funciones. Por ejemplo, para calcular la edad:\n\n`Edad al día de hoy = ROUNDDOWN ( YEARFRAC ( Tabla[Fecha Nacimiento], TODAY (), 3 ), 0 )`",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 13,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 3: Desbloquear el potencial de los datos con DAX",
              "slugBloque": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
              "tipo": "contenido",
              "titulo": "Medidas DAX",
              "texto": "- Las medidas son cálculos hechos **en tiempo real** sobre los datos, en lugar de ser precalculadas y almacenadas en la tabla como las columnas.\n- **No se visualizan en la tabla**, pero podés usarlas en los objetos visuales.\n- Se crean con funciones DAX que operan sobre columnas o tablas completas. Son útiles para totales, promedios, contar elementos, etc., sobre los datos agregados.\n- Por ejemplo, una medida podría ser el headcount:\n\n`Headcount = CALCULATE ( DISTINCTCOUNT ( Tabla[Legajo] ), ISBLANK ( Tabla[Fecha de egreso] ) )`\n\n## Analogía con Excel\n\nPensá en una fórmula de Excel en la que no necesitás calcular un valor para cada fila, sino un resultado general basado en un conjunto de datos. Por ejemplo, el promedio de una columna con `=PROMEDIO(A:A)`.\n\nLas medidas **no consumen memoria RAM**, así que siempre que puedas es mejor hacer medidas que columnas: no van a hacer lento tu informe, cosa que sí pasa cuando agregás muchas columnas calculadas.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 14,
              "abierta": true
            }
          ],
          "grabaciones": [
            {
              "programa": "powerh_1",
              "sesion": "5",
              "numero": 5,
              "titulo": "Columnas y medidas DAX",
              "fecha": "2026-04-07",
              "bloque": "Bloque 3: Desbloquear el potencial de los datos con DAX",
              "slugBloque": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
              "link": ""
            }
          ],
          "numero": 3,
          "abierto": true
        },
        {
          "programa": "powerh_1",
          "nombre": "Bloque 4: De tu análisis a las decisiones",
          "slug": "bloque-4-de-tu-analisis-a-las-decisiones",
          "titulo": "Es momento de transformar tu análisis en decisiones",
          "emoji": "🧩",
          "bajada": "Modelado en estrella, relaciones entre tablas y todas las formas de compartir tu informe.",
          "objetivo": "En este bloque conectamos todo lo que estuvimos viendo para **finalizar nuestro informe** y que funcione de manera 100% dinámica.\n\nHablaremos de **modelado dimensional** y de cómo compartir el informe con el resto de la organización.",
          "fecha": "2026-04-21",
          "orden": 4,
          "_fila": 3,
          "tarjetas": [
            {
              "programa": "powerh_1",
              "bloque": "Bloque 4: De tu análisis a las decisiones",
              "slugBloque": "bloque-4-de-tu-analisis-a-las-decisiones",
              "tipo": "tarea",
              "titulo": "Desafío final",
              "texto": "",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "2026-12-15",
              "orden": 3,
              "abierta": false
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 4: De tu análisis a las decisiones",
              "slugBloque": "bloque-4-de-tu-analisis-a-las-decisiones",
              "tipo": "contenido",
              "titulo": "Importar y conectar una nueva tabla al modelo",
              "texto": "En Power BI podés importar tablas de diferentes lugares y establecer relaciones entre ellas. Si al importar una tabla nueva no se conecta automáticamente, podés hacerlo **arrastrando una columna sobre la otra** en la vista de modelo.\n\n## Modelado en estrella\n\nEn Power BI solemos trabajar con lo que se denomina **modelado en estrella**. Los datos se organizan alrededor de una **tabla de hechos**, que contiene las métricas numéricas, rodeada de **tablas dimensionales** que describen los distintos aspectos del personal y la organización.\n\nLa tabla de hechos es el corazón del modelo: guarda las medidas clave que querés analizar —cantidad de contrataciones, salario promedio, horas trabajadas—. Las tablas dimensionales representan el tiempo, el maestro de posiciones o el de edificios laborales.\n\n1. **Simplicidad y claridad:** facilita entender la relación entre las métricas y las dimensiones del negocio.\n2. **Rendimiento optimizado:** separar las medidas de las dimensiones mejora el rendimiento de las consultas.\n3. **Flexibilidad:** se adapta a medida que cambian las necesidades de análisis.\n\nCuando conectes tablas, hacelo **con códigos únicos en lugar de nombres**. En vez de unir dos tablas por nombre y apellido, usá número de legajo o documento: las conexiones quedan más eficientes y precisas.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 16,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 4: De tu análisis a las decisiones",
              "slugBloque": "bloque-4-de-tu-analisis-a-las-decisiones",
              "tipo": "contenido",
              "titulo": "Los valores de cardinalidad",
              "texto": "- **Varios a uno (\\*:1)** indica una relación del tipo *dato a dimensión*. Por ejemplo, una tabla de capacitaciones con varias filas por participante, asociada a una tabla de personas con una fila para cada una. Es la más habitual.\n- **Uno a uno (1:1)** se usa para vincular entradas individuales de tablas de referencia. No es habitual: de hecho lo mejor suele ser reemplazar la relación por una combinación en la vista de transformar datos.\n- 🚫 **Varios a varios (\\*:\\*)**: si bien Power BI lo permite, no es recomendable. Si necesitás ese tipo de conexión, creá una tabla intermedia con valores únicos.\n\n🔗 El modelado es un tema complejo que vas a ir aprendiendo a medida que avances en los proyectos. Mi recomendación es que empieces con una tabla y de a poco vayas sumando más información, conectándola y respondiendo preguntas en conjunto. Paso a paso.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 17,
              "abierta": true
            },
            {
              "programa": "powerh_1",
              "bloque": "Bloque 4: De tu análisis a las decisiones",
              "slugBloque": "bloque-4-de-tu-analisis-a-las-decisiones",
              "tipo": "contenido",
              "titulo": "Compartir tu informe",
              "texto": "Power BI ofrece diferentes formas de compartir la información:\n\n## Enviar el archivo .pbix\n👍 Quien lo reciba va a poder modificarlo y consultar toda la información como si fuera vos.\n👎 La ventaja es también la desventaja: no podés filtrar el acceso a los datos crudos ni proteger el archivo de modificaciones que generen errores.\n\n## Exportar a PDF\nDesde Archivo → Exportar → Exportar a PDF.\n👍 Es rápido, el destinatario no necesita Power BI y podés mandarlo por mail.\n👎 Es una foto, sin dinamismo.\n\n## Publicar el informe\nDesde Archivo → Publicar, o sea subirlo a la nube.\n👍 Es gratuito y tan seguro como cualquier cosa protegida por contraseña en la nube.\n👍 Genera una copia de seguridad que te permite recuperar el archivo.\n👍 Podés acceder desde cualquier dispositivo y presentar a pantalla completa.\n👎 No vas a poder enviárselo a otras personas salvo que compartas tu contraseña.\n\n## Compartir con licencia PRO\n👍 El acceso está protegido por usuario y contraseña en los servidores de Microsoft.\n👍 Podés definir roles para decidir qué ve cada usuario (seguridad a nivel de fila).\n👎 Es el único camino con costo: hay que abonar una licencia por usuario, que ronda los USD 10 mensuales.\n\n## Compartir en la web de forma pública\n👍 Es una forma muy simple y dinámica de compartir la info, si los datos no son confidenciales. Lamentablemente eso es más la excepción que la regla en HR.\n👎 No tiene seguridad: cualquier persona con el link puede ver tus datos. Por defecto está deshabilitada y debe habilitarla el administrador del dominio.",
              "imagen": "",
              "link": "",
              "archivos": [],
              "fecha": "",
              "orden": 4,
              "_fila": 18,
              "abierta": true
            }
          ],
          "grabaciones": [
            {
              "programa": "powerh_1",
              "sesion": "6",
              "numero": 6,
              "titulo": "Modelado y cierre",
              "fecha": "2026-04-21",
              "bloque": "Bloque 4: De tu análisis a las decisiones",
              "slugBloque": "bloque-4-de-tu-analisis-a-las-decisiones",
              "link": ""
            }
          ],
          "numero": 4,
          "abierto": true
        }
      ],
      "grabaciones": [
        {
          "programa": "powerh_1",
          "sesion": "1",
          "numero": 1,
          "titulo": "People Analytics & Power BI",
          "fecha": "2026-03-10",
          "bloque": "Bloque 1: Los datos pueden transformar HR",
          "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
          "link": ""
        },
        {
          "programa": "powerh_1",
          "sesion": "2",
          "numero": 2,
          "titulo": "Descubriendo el poder de ETL",
          "fecha": "2026-03-17",
          "bloque": "Bloque 1: Los datos pueden transformar HR",
          "slugBloque": "bloque-1-los-datos-pueden-transformar-hr",
          "link": "https://us02web.zoom.us/rec/share/T9Go6wWpU7RDNWHV9DNYOtZEAB5MFaS38kju_jVHE3lex_t1Omc-q4FwyNIJOrTi.924Cg7OFZ5rW9Y9R?startTime=1712844261000"
        },
        {
          "programa": "powerh_1",
          "sesion": "3",
          "numero": 3,
          "titulo": "Primeras visualizaciones",
          "fecha": "2026-03-24",
          "bloque": "Bloque 2: De la transformación de datos a la visualización",
          "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
          "link": "https://us02web.zoom.us/rec/share/zqYdjl_R2bia_9KM_NPieWaQ9Et25HTh6CuDutssSxePxlv3sLI_QwC17AWlz1G_.zAA6h8Kno4IFbsXF"
        },
        {
          "programa": "powerh_1",
          "sesion": "4",
          "numero": 4,
          "titulo": "Visualizaciones con impacto",
          "fecha": "2026-03-31",
          "bloque": "Bloque 2: De la transformación de datos a la visualización",
          "slugBloque": "bloque-2-de-la-transformacion-de-datos-a-la-visualizacion",
          "link": "https://us02web.zoom.us/rec/share/mY4jdFIfQMFzqM_mLphozV6LjbwUz3JA20_328BaQ1bxynfjiUsCeY6Y_Yn74nS_.2awmvNE0gp4NF8xY"
        },
        {
          "programa": "powerh_1",
          "sesion": "5",
          "numero": 5,
          "titulo": "Columnas y medidas DAX",
          "fecha": "2026-04-07",
          "bloque": "Bloque 3: Desbloquear el potencial de los datos con DAX",
          "slugBloque": "bloque-3-desbloquear-el-potencial-de-los-datos-con-dax",
          "link": ""
        },
        {
          "programa": "powerh_1",
          "sesion": "6",
          "numero": 6,
          "titulo": "Modelado y cierre",
          "fecha": "2026-04-21",
          "bloque": "Bloque 4: De tu análisis a las decisiones",
          "slugBloque": "bloque-4-de-tu-analisis-a-las-decisiones",
          "link": ""
        }
      ],
      "ajustes": {
        "hero.bajada": "Acá está todo lo que necesitás para cursar: el material de cada bloque, las grabaciones y dónde llevar tus dudas.",
        "bienvenida.titulo": "Te damos la bienvenida",
        "bienvenida": "Esta página es tu punto de partida. Guardala en favoritos: acá vas a encontrar siempre las grabaciones, el material de cada bloque y los canales para consultar.",
        "bienvenida.nota": "🛋️ Por favor conectate puntual: vamos a ir trabajando de manera escalonada en un mismo proyecto 🧗🏽 y eso ayuda a que podamos aprovechar el tiempo al máximo 💪",
        "ayuda.titulo": "¿Necesitás una mano?",
        "ayuda": "Si algo no se entiende o algo no funciona, escribinos y lo resolvemos.",
        "mail": "info@hache.com.ar",
        "instagram": "https://www.instagram.com/consultora_hache/",
        "linkedin.hache": "https://www.linkedin.com/company/consultorahache/",
        "linkedin.grupo": "https://www.linkedin.com/groups/12134403/",
        "youtube": "https://www.youtube.com/@ConsultoraHACHE",
        "web": "https://www.hacheconsultora.com",
        "zoom": "https://us02web.zoom.us/j/84283169271",
        "calendario": "https://calendar.google.com/calendar/u/0/r",
        "hero.titulo": "3, 2, 1… despega PoweRH 🚀"
      }
    },
    {
      "id": "Pope17",
      "slug": "Pope17",
      "nombre": "Power People",
      "inicio": "2026-08-19",
      "fin": "2026-12-02",
      "sesiones": 15,
      "facilitador": "Pablo",
      "cliente": "General",
      "logo": "https://i.ibb.co/95ZDmJ4/Logo-HACHE-blanco-estrecho-2-1.png",
      "comentarios": "modelo híbrido",
      "bloques": [],
      "grabaciones": [],
      "ajustes": {
        "hero.bajada": "Acá está todo lo que necesitás para cursar: el material de cada bloque, las grabaciones y dónde llevar tus dudas.",
        "bienvenida.titulo": "Te damos la bienvenida",
        "bienvenida": "Esta página es tu punto de partida. Guardala en favoritos: acá vas a encontrar siempre las grabaciones, el material de cada bloque y los canales para consultar.",
        "bienvenida.nota": "🛋️ Por favor conectate puntual: vamos a ir trabajando de manera escalonada en un mismo proyecto 🧗🏽 y eso ayuda a que podamos aprovechar el tiempo al máximo 💪",
        "ayuda.titulo": "¿Necesitás una mano?",
        "ayuda": "Si algo no se entiende o algo no funciona, escribinos y lo resolvemos.",
        "mail": "info@hache.com.ar",
        "instagram": "https://www.instagram.com/consultora_hache/",
        "linkedin.hache": "https://www.linkedin.com/company/consultorahache/",
        "linkedin.grupo": "https://www.linkedin.com/groups/12134403/",
        "youtube": "https://www.youtube.com/@ConsultoraHACHE",
        "web": "https://www.hacheconsultora.com"
      }
    },
    {
      "id": "pbi_pampa14",
      "slug": "pbi_pampa14",
      "nombre": "Power BI Nivel 2",
      "inicio": "2026-08-31",
      "fin": "2026-10-02",
      "sesiones": 8,
      "facilitador": "Charlie",
      "cliente": "Pampa",
      "logo": "https://i.ibb.co/95ZDmJ4/Logo-HACHE-blanco-estrecho-2-1.png",
      "comentarios": "Nivel 2: Open 31/08 → 5 clases + 2DL (2h c/u) + Demo day",
      "bloques": [],
      "grabaciones": [],
      "ajustes": {
        "hero.bajada": "Acá está todo lo que necesitás para cursar: el material de cada bloque, las grabaciones y dónde llevar tus dudas.",
        "bienvenida.titulo": "Te damos la bienvenida",
        "bienvenida": "Esta página es tu punto de partida. Guardala en favoritos: acá vas a encontrar siempre las grabaciones, el material de cada bloque y los canales para consultar.",
        "bienvenida.nota": "🛋️ Por favor conectate puntual: vamos a ir trabajando de manera escalonada en un mismo proyecto 🧗🏽 y eso ayuda a que podamos aprovechar el tiempo al máximo 💪",
        "ayuda.titulo": "¿Necesitás una mano?",
        "ayuda": "Si algo no se entiende o algo no funciona, escribinos y lo resolvemos.",
        "mail": "info@hache.com.ar",
        "instagram": "https://www.instagram.com/consultora_hache/",
        "linkedin.hache": "https://www.linkedin.com/company/consultorahache/",
        "linkedin.grupo": "https://www.linkedin.com/groups/12134403/",
        "youtube": "https://www.youtube.com/@ConsultoraHACHE",
        "web": "https://www.hacheconsultora.com"
      }
    }
  ],
  "facilitadores": [
    {
      "nombre": "Pablo",
      "rol": "Fundador de HACHE · People Analytics",
      "foto": "",
      "iniciales": "PS",
      "bio": "**Pablo Senra** es un apasionado por traducir datos en acciones que potencien a las organizaciones.\n\nEsta historia comenzó muchos años atrás, cuando trabajaba en el área y notó con preocupación que muchas veces en HR nos cuesta sustentar nuestras decisiones como sí lo hacen otras áreas de la organización.\n\nComenzó a investigar con datos y se enamoró de la **capacidad que tienen para impulsar conversaciones significativas con el resto de la organización**. ¡Ya no pudo dejarlo atrás! Así es que decidió fundar HACHE, y hoy es consultor, profesor en ITBA, speaker e influencer reconocido en el mundo de People Analytics y HR.\n\nCuando no está sumergido en conversaciones sobre datos y talento, disfruta de ser papá de Baltu, hincha de Racing y un viajero incansable. Sueña con salir en roadtrip conectándose con la comunidad de People Analytics en cada ciudad que visite 🚙",
      "linkedin": "https://www.linkedin.com/in/pablosenra/",
      "mail": "pablo@hache.com.ar",
      "cita": "Buscamos insights en los datos que nos permitan potenciar el logro de los objetivos e incrementar el bienestar de los colaboradores."
    },
    {
      "nombre": "Charlie",
      "rol": "Facilitador de Power BI",
      "foto": "",
      "iniciales": "C",
      "bio": "",
      "linkedin": "",
      "mail": "",
      "cita": ""
    },
    {
      "nombre": "Gonza",
      "rol": "Facilitador de Excel",
      "foto": "",
      "iniciales": "G",
      "bio": "",
      "linkedin": "",
      "mail": "",
      "cita": ""
    }
  ],
  "ajustes": {
    "hero.bajada": "Acá está todo lo que necesitás para cursar: el material de cada bloque, las grabaciones y dónde llevar tus dudas.",
    "bienvenida.titulo": "Te damos la bienvenida",
    "bienvenida": "Esta página es tu punto de partida. Guardala en favoritos: acá vas a encontrar siempre las grabaciones, el material de cada bloque y los canales para consultar.",
    "bienvenida.nota": "🛋️ Por favor conectate puntual: vamos a ir trabajando de manera escalonada en un mismo proyecto 🧗🏽 y eso ayuda a que podamos aprovechar el tiempo al máximo 💪",
    "ayuda.titulo": "¿Necesitás una mano?",
    "ayuda": "Si algo no se entiende o algo no funciona, escribinos y lo resolvemos.",
    "mail": "info@hache.com.ar",
    "instagram": "https://www.instagram.com/consultora_hache/",
    "linkedin.hache": "https://www.linkedin.com/company/consultorahache/",
    "linkedin.grupo": "https://www.linkedin.com/groups/12134403/",
    "youtube": "https://www.youtube.com/@ConsultoraHACHE",
    "web": "https://www.hacheconsultora.com"
  }
};
