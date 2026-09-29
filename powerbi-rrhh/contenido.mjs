/* ==========================================================================
   Power BI para recursos humanos — el contenido de la página.

   Una sola página, sin planilla y sin sub-páginas: todo lo que se ve sale de
   acá. Se edita este archivo, se corre `node scripts/build.mjs` y se commitea
   el index.html que sale.

   Los textos vienen del currículo de PoweRH, pero esta web es independiente:
   editar uno no toca al otro.
   ========================================================================== */

export default {
  "marca": "Power BI para recursos humanos",
  "hero": {
    "etiqueta": "People Analytics",
    "titulo": "Aprendiendo a tomar decisiones con datos",
    "bajada": "¡Abróchense los cinturones! Comienza nuestro viaje al mundo de People Analytics con Power BI, una herramienta que revoluciona la forma en que trabajamos con datos en Recursos Humanos."
  },
  "facilitador": {
    "nombre": "Pablo Senra",
    "rol": "Fundador de HACHE · People Analytics",
    "foto": "/assets/pablo.png",
    "iniciales": "PS",
    "linkedin": "https://www.linkedin.com/in/pablosenra/",
    "mail": "pablo@hache.com.ar",
    "cita": "Buscamos insights en los datos que nos permitan potenciar el logro de los objetivos e incrementar el bienestar de los colaboradores.",
    "bio": "**Pablo Senra** es un apasionado por traducir datos en acciones que potencien a las organizaciones.\n\nEsta historia comenzó muchos años atrás, cuando trabajaba en el área y notó con preocupación que muchas veces en HR nos cuesta sustentar nuestras decisiones como sí lo hacen otras áreas de la organización.\n\nComenzó a investigar con datos y se enamoró de la **capacidad que tienen para impulsar conversaciones significativas con el resto de la organización**. ¡Ya no pudo dejarlo atrás! Así es que decidió fundar HACHE, y hoy es consultor, profesor en ITBA, speaker e influencer reconocido en el mundo de People Analytics y HR.\n\nCuando no está sumergido en conversaciones sobre datos y talento, disfruta de ser papá de Baltu, hincha de Racing y un viajero incansable. Sueña con salir en roadtrip conectándose con la comunidad de People Analytics en cada ciudad que visite 🚙"
  },
  "antes": [
    {
      "etiqueta": "🚨 Antes de empezar",
      "titulo": "¿Qué necesito hacer antes de empezar?",
      "texto": "Solo descargar **Power BI Desktop**. Te dejamos el paso a paso en este video.",
      "link": {
        "texto": "Ver cómo instalarlo",
        "url": "https://youtu.be/qs5TdFoSxVI"
      },
      "alerta": true
    },
    {
      "etiqueta": "🧑🏼‍🏫 Punto de partida",
      "titulo": "¿Son necesarios conocimientos previos?",
      "texto": "¡No! Estas clases están pensadas para que aprendas a analizar datos con Power BI desde cero. Vas a recorrer el proceso completo pasando por cada una de sus etapas: **importación, transformación, análisis y visualización** de datos."
    },
    {
      "etiqueta": "🎬 Para practicar",
      "titulo": "¿Querés probar Power BI antes de la clase?",
      "texto": "Te dejamos un video de **5 minutos** que te guía en una primera exploración de la herramienta. Con eso llegás con el terreno reconocido.",
      "link": {
        "texto": "Ver el video",
        "url": "https://www.youtube.com/watch?v=TNWk6Yl4d-g&list=PLCn-kwV6QQWnsLzv6IKrHWBb7bdHj7Vlb&index=42&t=3s"
      }
    }
  ],
  "partes": [
    {
      "numero": 1,
      "nombre": "Los datos pueden transformar HR con People Analytics & Power BI",
      "emoji": "🎯",
      "objetivo": "Al finalizar este bloque vas a tener mayor claridad sobre **qué es People Analytics** y cuáles son los beneficios de comenzar a tomar decisiones basadas en datos.\n\nTambién presentaremos **Power BI** y el caso de análisis que trabajaremos, y nos adentraremos en el mundo de **ETL** (Extracción, Transformación y Carga). Vamos a aprender a manipular nuestros datos para que sean más útiles y fáciles de analizar.",
      "tarjetas": [
        {
          "tipo": "material",
          "titulo": "Base para el ejercicio",
          "texto": "Acá está **la base que vamos a utilizar** durante todo el workshop. Descargala antes de la primera sesión así arrancamos todos desde el mismo lugar.",
          "archivos": [
            {
              "nombre": "Nómina Panda",
              "url": "https://drive.google.com/file/d/1Y3zWC6LgODmkbRq0KFg2Rx4wwZ4GO-wd/view"
            }
          ]
        },
        {
          "tipo": "contenido",
          "titulo": "Las 4 vistas de Power BI",
          "texto": "Power BI tiene **4 vistas** 😎, y según en cuál estés vas a poder hacer cosas distintas.\n\n- 🛠 **Transformar datos:** el editor donde preparás los datos para el posterior análisis.\n- 🎨 **Vista Informe:** el lugar donde vamos a graficar nuestro informe.\n- 🗃 **Vista de Datos:** nos permite ver la tabla, revisar formatos y crear columnas calculadas.\n- 🧩 **Vista de Modelo:** acá relacionamos nuestras diferentes tablas."
        },
        {
          "tipo": "contenido",
          "titulo": "Obtener datos",
          "texto": "Power BI trabaja con datos que están en **orígenes externos**. Recordá que *lo primero que tenés que hacer* es conectar tus datos.\n\nPodés hacerlo desde el menú de Inicio con el botón de **Obtener datos**, o directamente desde Excel si vas a trabajar con ese origen.\n\nCuando conectes datos cargados manualmente en Excel, te recomendamos darles **formato de tabla** antes de importarlos."
        },
        {
          "tipo": "contenido",
          "titulo": "Transformar datos",
          "texto": "Al importar una base de datos es importante pasar por **Transformar datos** y prepararlos antes de comenzar el análisis. Algunas transformaciones que hicimos:\n\n- Chequear el tipo de datos (mucho muy importante 😂)\n- Filtrar filas en blanco y elegir columnas\n- Modificar formatos (mayúsculas, minúsculas, etc.)\n- Combinar columnas\n- Reemplazar y extraer valores\n- Operaciones de fecha\n- Operaciones matemáticas y de redondeo\n- Crear columnas condicionales (generaciones, rangos de edad, etc.)\n\n## Tres cosas para no marearte\n\n- Si te aparece un paso llamado **\"Filas Filtradas\"** y no lo aplicaste intencionalmente, la recomendación es eliminarlo con la \"x\".\n- Si te aparece el cartel de **\"Insertar un paso\"**, salvo que lo estés haciendo a propósito, cancelá y posicionate en el último paso del menú de pasos aplicados antes de volver a crearlo.\n- Cuando termines de trabajar en esta vista, aplicá los cambios desde el menú de inicio clickeando en **Cerrar y aplicar**."
        },
        {
          "tipo": "tarea",
          "titulo": "Tarea",
          "texto": "Siempre es un excelente momento para practicar.\n\n1. Creá un nuevo archivo de Power BI e **importá** una base (puede ser la del curso u otra que tengas).\n2. Entrá a **Transformar datos** y creá al menos **5 pasos** de transformación. Acordate de chequear el tipo de datos de cada columna.\n3. **Documentá** alguno de esos pasos haciendo click derecho sobre el nombre del paso y entrando a Propiedades, para cambiarle el nombre y explicar qué hace. Es una excelente forma de recordar después el proceso."
        }
      ]
    },
    {
      "numero": 2,
      "nombre": "De la transformación de datos a la visualización de información",
      "emoji": "📊",
      "objetivo": "Viajaremos desde la transformación de datos hasta la **visualización de información significativa**, con herramientas y técnicas para comprender mejor nuestra fuerza laboral y tomar decisiones informadas en Recursos Humanos.\n\nDicen que una imagen vale más que mil palabras: en este bloque empezamos a construir nuestra primera página de informe.",
      "tarjetas": [
        {
          "tipo": "contenido",
          "titulo": "5 pasos para crear buenas visualizaciones",
          "texto": "## 1️⃣ Elegir la visualización\n\n- 🔲 Si sólo vas a mostrar un dato, la **tarjeta** es una excelente opción.\n- 📊 Si necesitás comparar valores o establecer un ranking, usá gráficos de **barras o columnas**. Un consejo para elegir: barras para variables categóricas (texto), columnas para variables numéricas o de tiempo.\n- 📈 Los **gráficos de líneas** suelen usarse para mostrar tendencia en el tiempo.\n- 🎂 Los **gráficos de torta o anillos** usalos con cuidado y para 2 o 3 segmentos máximo.\n- 🎛 Los **segmentadores** te permiten filtrar a los demás gráficos.\n- 📄 Las **tablas y matrices** son buenas para datos que se necesiten recorrer uno a uno; lo ideal es usarlas con conjuntos de hasta 20 datos.\n\n## 2️⃣ Seleccionar los campos\n\nEste paso es muy simple, Power BI permite arrastrar y tirar. En general los gráficos muestran un valor (la columna que llevás a *valores*) y lo segmentan de alguna forma (la columna que va al eje, a detalles o a leyenda).\n\n## 3️⃣ Elegir la operación\n\nAcá definís la operación a realizar (suma, promedio, mediana…) desde el menú ▼. En ese mismo menú encontrás cómo mostrar el valor **como porcentaje del total**, y si estás en una variable de segmentación podés agruparla con la función **Nuevo grupo**.\n\n## 4️⃣ Aplicar filtros\n\nLos filtros son muy parecidos a los de Excel, pero acá los aplicás en tres niveles:\n\n- 📊 A un único gráfico (*en este gráfico hablo de los líderes solamente*).\n- 📄 A todos los gráficos de una página (*en esta página hablo de activos*).\n- 📕 A todo el informe (*quiero que todo el informe sea de un área*).\n\n## 5️⃣ Trabajar sobre el formato\n\n👩‍🎨 El rodillo te permite cambiar casi todo lo que tiene que ver con el formato.\n\nSi querés trabajar con plantillas como hicimos en el workshop, tené en cuenta que se agregan desde **fondo de página** en el rodillo (no tenés que tener ningún gráfico seleccionado al entrar) y acordate de poner la **transparencia en 0%**."
        },
        {
          "tipo": "contenido",
          "titulo": "Poderes ocultos de las visualizaciones",
          "texto": "🤿 Si tenés más de un campo en el eje del objeto visual van a aparecer las opciones de **Explorar en profundidad** o *drill down*. Te permiten cambiar el nivel de detalle (granularidad) con que segmentás esos valores. Podés recorrer los diferentes niveles con las flechas ↑ ↓ ⇊ que aparecen sobre el gráfico.\n\n🐱‍💻 Por otro lado, recordá que los gráficos **se pueden filtrar entre sí**. Si querés modificar ese funcionamiento, entrá a Formato → **Editar interacciones**."
        },
        {
          "tipo": "tarea",
          "titulo": "Tarea",
          "texto": "Vamos a practicar un poco con lo que fuimos viendo.\n\n## Diversidad de género\n\nCreá un gráfico que muestre la distribución del headcount por género.\n\n## Diversidad de género por nivel\n\nPara analizar más en profundidad qué tan diversos somos, abrí esta información por los niveles que creamos en la primera página.\n\n## Distribución de la nómina por generación\n\nEs importante que la visualización respete el orden jerárquico de las generaciones para que el impacto visual sea más claro. Puede que encuentres un desafío especial en estos dos últimos gráficos para ordenar las variables del Eje Y, ya que son categóricas (de texto).\n\nPodés [ayudarte con este tutorial](https://www.youtube.com/watch?v=vUB88vjypGk) de nuestro canal. Suscribite para recibir info de los videos nuevos que vayamos subiendo.\n\nPor otro lado, vas a ver que las etiquetas muestran una frecuencia relativa (% del total). La pista para que encuentres cómo hacerlo es que busques en el menú de opciones del Eje X, donde llevaste la cantidad de personas.\n\n## Mediana de compensación por género\n\nPara terminar, calculá la mediana de compensación y abrila por dos variables: nivel y género. Es muy parecido a lo que hicimos en la primera página; si no sabés cómo llegar, podés empezar desde ahí.\n\nTratá de generarlo lo más parecido posible a la imagen y en el check in de la próxima sesión lo vemos.",
          "archivos": []
        }
      ]
    }
  ],
  "redes": [
    {
      "emoji": "📷",
      "titulo": "Instagram",
      "bajada": "Conectemos en @consultora_hache",
      "url": "https://www.instagram.com/consultora_hache/"
    },
    {
      "emoji": "🏢",
      "titulo": "HACHE en LinkedIn",
      "bajada": "Seguí a la consultora",
      "url": "https://www.linkedin.com/company/consultorahache/"
    },
    {
      "emoji": "🌐",
      "titulo": "La web de HACHE",
      "bajada": "www.hacheconsultora.com",
      "url": "https://www.hacheconsultora.com"
    }
  ],
  "web": "https://www.hacheconsultora.com",
  "contacto": "info@hache.com.ar",
  "seguir": {
    "titulo": "¿Querés seguir aprendiendo?",
    "texto": "En el canal de HACHE vas a encontrar tutoriales para seguir explorando por tu cuenta. Y si me seguís en redes, te enterás cada vez que compartimos algo nuevo.",
    "botones": [
      {
        "texto": "Ver los tutoriales de HACHE",
        "url": "https://www.youtube.com/@ConsultoraHACHE"
      },
      {
        "texto": "Conectar con Pablo en LinkedIn",
        "url": "https://www.linkedin.com/in/pablosenra/"
      }
    ]
  }
};
