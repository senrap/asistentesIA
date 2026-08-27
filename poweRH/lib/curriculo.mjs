/* ==========================================================================
   PoweRH — el contenido del programa.

   ACÁ VIVE TODO LO QUE NO CAMBIA entre una cursada y la otra: los bloques, sus
   objetivos, las tarjetas con el material, la ficha del facilitador y los
   textos del sitio. Se edita en este archivo, se commitea, y se ve en el
   próximo deploy.

   Lo que SÍ cambia en cada cursada —el cliente, cuántas sesiones tiene, cuándo
   empieza y termina, el link al calendario y las grabaciones— sale del Google
   Sheet. Eso está en lib/sheet.mjs.

   Cómo se abren los bloques
   -------------------------
   No hay fechas por bloque. Cada bloque declara qué sesiones cubre, y se abre
   solo cuando alguna de esas sesiones tiene grabación cargada en la planilla.
   Subir la grabación es lo único que hay que hacer para liberar un bloque.

   scripts/build.mjs empaqueta este archivo a assets/curriculo.js para el
   navegador; los dos están versionados.
   ========================================================================== */

export default {
  /* ---------------------------------------------------------------- Marca */
  nombre: 'PoweRH',
  /** El nombre "formal", el que va en el certificado de LinkedIn. */
  titulo: 'People Analytics con Power BI',
  organizacion: 'Consultora HACHE',

  hero: {
    titulo: '3, 2, 1… despega PoweRH 🚀',
    bajada:
      '¡Abróchense los cinturones! Comienza nuestro viaje al mundo de People Analytics con ' +
      'Power BI, una herramienta que revoluciona la forma en que trabajamos con datos en ' +
      'Recursos Humanos.'
  },

  /* ----------------------------------------------------------- Bienvenida */
  bienvenida: {
    titulo: 'Te damos la bienvenida',
    lead:
      'Esta página es tu punto de partida. Guardala en favoritos: acá vas a encontrar ' +
      'siempre las grabaciones, el material de cada bloque y los canales para consultar.',
    nota:
      '🛋️ Por favor conectate puntual: vamos a ir trabajando de manera escalonada en un ' +
      'mismo proyecto 🧗🏽 y eso ayuda a que podamos aprovechar el tiempo al máximo 💪'
  },

  /**
   * Las dos tarjetas de la bienvenida. Están fuera de los bloques a propósito:
   * los bloques se abren con las grabaciones, y esto hay que poder leerlo antes
   * del primer encuentro.
   */
  antes: [
    {
      etiqueta: '🚨 Antes de empezar',
      titulo: '¿Qué necesito hacer antes de empezar?',
      texto: 'Solo descargar **Power BI Desktop**. Te dejamos el paso a paso en este video.',
      link: { texto: 'Ver cómo instalarlo', url: 'https://youtu.be/qs5TdFoSxVI' },
      alerta: true
    },
    {
      etiqueta: '🧑🏼‍🏫 Punto de partida',
      titulo: '¿Son necesarios conocimientos previos?',
      texto:
        '¡No! Este workshop está pensado para que aprendas a analizar datos con Power BI ' +
        'desde cero. Vas a recorrer el proceso completo pasando por cada una de sus etapas: ' +
        '**importación, transformación, análisis y visualización** de datos.'
    }
  ],

  /* ---------------------------------------------------------- Facilitador */
  facilitador: {
    nombre: 'Pablo Senra',
    rol: 'Fundador de HACHE · People Analytics',
    // El archivo va en assets/, ya recortado en cuadrado. Si no está o no
    // carga, quedan las iniciales.
    foto: '/assets/pablo.png',
    iniciales: 'PS',
    linkedin: 'https://www.linkedin.com/in/pablosenra/',
    mail: 'pablo@hache.com.ar',
    cita:
      'Buscamos insights en los datos que nos permitan potenciar el logro de los objetivos ' +
      'e incrementar el bienestar de los colaboradores.',
    bio: `**Pablo Senra** es un apasionado por traducir datos en acciones que potencien a las organizaciones.

Esta historia comenzó muchos años atrás, cuando trabajaba en el área y notó con preocupación que muchas veces en HR nos cuesta sustentar nuestras decisiones como sí lo hacen otras áreas de la organización.

Comenzó a investigar con datos y se enamoró de la **capacidad que tienen para impulsar conversaciones significativas con el resto de la organización**. ¡Ya no pudo dejarlo atrás! Así es que decidió fundar HACHE, y hoy es consultor, profesor en ITBA, speaker e influencer reconocido en el mundo de People Analytics y HR.

Cuando no está sumergido en conversaciones sobre datos y talento, disfruta de ser papá de Baltu, hincha de Racing y un viajero incansable. Sueña con salir en roadtrip conectándose con la comunidad de People Analytics en cada ciudad que visite 🚙`
  },

  /* -------------------------------------------------------------- Bloques
     "sesiones" es qué encuentros cubre cada bloque. Es lo que lo destraba:
     apenas una de esas sesiones tiene grabación en la planilla, el bloque se
     abre. Si una cursada tiene menos sesiones que las que declaran los bloques,
     los últimos simplemente se quedan cerrados.

     Las tarjetas se ordenan por tipo: primero el material y la tarea —lo que se
     viene a buscar— y el texto largo al final.
     -------------------------------------------------------------------- */
  bloques: [
    {
      nombre: 'Bloque 1: Los datos pueden transformar HR',
      titulo: 'Los datos pueden transformar HR con People Analytics & Power BI',
      emoji: '🎯',
      sesiones: [1, 2],
      bajada:
        'Qué es People Analytics, las 4 vistas de Power BI y cómo obtener y transformar tus datos.',
      objetivo: `Al finalizar este bloque vas a tener mayor claridad sobre **qué es People Analytics** y cuáles son los beneficios de comenzar a tomar decisiones basadas en datos.

También presentaremos **Power BI** y el caso de análisis que trabajaremos, y nos adentraremos en el mundo de **ETL** (Extracción, Transformación y Carga). Vamos a aprender a manipular nuestros datos para que sean más útiles y fáciles de analizar.`,
      tarjetas: [
        {
          tipo: 'material',
          titulo: 'Base para el ejercicio',
          texto:
            'Acá está **la base que vamos a utilizar** durante todo el workshop. Descargala ' +
            'antes de la primera sesión así arrancamos todos desde el mismo lugar.',
          archivos: [
            {
              nombre: 'Nómina Panda',
              url: 'https://drive.google.com/file/d/1Y3zWC6LgODmkbRq0KFg2Rx4wwZ4GO-wd/view'
            }
          ]
        },
        {
          tipo: 'material',
          titulo: 'Presentación',
          texto: 'Te dejamos la presentación que compartimos en este bloque.',
          archivos: [
            {
              nombre: 'PoweRH · Bloque 1 (PDF)',
              url: 'https://drive.google.com/file/d/10PKtrIWRXgkc-MHKji9etu4gYKWEjB-g/view'
            }
          ]
        },
        {
          tipo: 'tarea',
          titulo: 'Tarea',
          texto: `Siempre es un excelente momento para practicar.

1. Creá un nuevo archivo de Power BI e **importá** una base (puede ser la del curso u otra que tengas).
2. Entrá a **Transformar datos** y creá al menos **5 pasos** de transformación. Acordate de chequear el tipo de datos de cada columna.
3. **Documentá** alguno de esos pasos haciendo click derecho sobre el nombre del paso y entrando a Propiedades, para cambiarle el nombre y explicar qué hace. Es una excelente forma de recordar después el proceso.`
        },
        {
          tipo: 'contenido',
          titulo: 'Las 4 vistas de Power BI',
          texto: `Power BI tiene **4 vistas** 😎, y según en cuál estés vas a poder hacer cosas distintas.

- 🛠 **Transformar datos:** el editor donde preparás los datos para el posterior análisis.
- 🎨 **Vista Informe:** el lugar donde vamos a graficar nuestro informe.
- 🗃 **Vista de Datos:** nos permite ver la tabla, revisar formatos y crear columnas calculadas.
- 🧩 **Vista de Modelo:** acá relacionamos nuestras diferentes tablas.`
        },
        {
          tipo: 'contenido',
          titulo: 'Obtener datos',
          texto: `Power BI trabaja con datos que están en **orígenes externos**. Recordá que *lo primero que tenés que hacer* es conectar tus datos.

Podés hacerlo desde el menú de Inicio con el botón de **Obtener datos**, o directamente desde Excel si vas a trabajar con ese origen.

Cuando conectes datos cargados manualmente en Excel, te recomendamos darles **formato de tabla** antes de importarlos.`
        },
        {
          tipo: 'contenido',
          titulo: 'Transformar datos',
          texto: `Al importar una base de datos es importante pasar por **Transformar datos** y prepararlos antes de comenzar el análisis. Algunas transformaciones que hicimos:

- Chequear el tipo de datos (mucho muy importante 😂)
- Filtrar filas en blanco y elegir columnas
- Modificar formatos (mayúsculas, minúsculas, etc.)
- Combinar columnas
- Reemplazar y extraer valores
- Operaciones de fecha
- Operaciones matemáticas y de redondeo
- Crear columnas condicionales (generaciones, rangos de edad, etc.)

## Tres cosas para no marearte

- Si te aparece un paso llamado **"Filas Filtradas"** y no lo aplicaste intencionalmente, la recomendación es eliminarlo con la "x".
- Si te aparece el cartel de **"Insertar un paso"**, salvo que lo estés haciendo a propósito, cancelá y posicionate en el último paso del menú de pasos aplicados antes de volver a crearlo.
- Cuando termines de trabajar en esta vista, aplicá los cambios desde el menú de inicio clickeando en **Cerrar y aplicar**.`
        }
      ]
    },

    {
      nombre: 'Bloque 2: De la transformación de datos a la visualización',
      titulo: 'De la transformación de datos a la visualización de información',
      emoji: '📊',
      sesiones: [3, 4],
      bajada:
        'Cinco pasos para construir buenas visualizaciones y los poderes ocultos de los gráficos.',
      objetivo: `Viajaremos desde la transformación de datos hasta la **visualización de información significativa**, con herramientas y técnicas para comprender mejor nuestra fuerza laboral y tomar decisiones informadas en Recursos Humanos.

Dicen que una imagen vale más que mil palabras: en este bloque empezamos a construir nuestra primera página de informe.`,
      tarjetas: [
        {
          tipo: 'material',
          titulo: 'Plantilla para el desafío',
          texto: `Vamos a usar esta imagen para acompañar los ejercicios del primer desafío.

Las plantillas se agregan desde **fondo de página** en el rodillo. Acordate siempre de **ajustar** la imagen y poner la **transparencia en 0%**.`,
          archivos: [
            {
              nombre: 'Plantilla del desafío',
              url: 'https://drive.google.com/file/d/10j0GH2so4pVNXhv3dP7kChOqYOwAJyw0/view'
            }
          ]
        },
        {
          tipo: 'material',
          titulo: 'Presentación',
          texto: 'Te compartimos la presentación del segundo bloque.',
          archivos: [
            {
              nombre: 'PoweRH · Bloque 2 (PDF)',
              url: 'https://drive.google.com/file/d/1upsLaZ2aMpaH1z6Sq0Q8CqhXYolow67n/view'
            }
          ]
        },
        {
          tipo: 'tarea',
          titulo: 'Tarea',
          texto: `Vamos a practicar un poco con lo que fuimos viendo.

## Diversidad de género

Creá un gráfico que muestre la distribución del headcount por género.

## Diversidad de género por nivel

Para analizar más en profundidad qué tan diversos somos, abrí esta información por los niveles que creamos en la primera página.

## Distribución de la nómina por generación

Es importante que la visualización respete el orden jerárquico de las generaciones para que el impacto visual sea más claro. Puede que encuentres un desafío especial en estos dos últimos gráficos para ordenar las variables del Eje Y, ya que son categóricas (de texto).

Podés [ayudarte con este tutorial](https://www.youtube.com/watch?v=vUB88vjypGk) de nuestro canal. Suscribite para recibir info de los videos nuevos que vayamos subiendo.

Por otro lado, vas a ver que las etiquetas muestran una frecuencia relativa (% del total). La pista para que encuentres cómo hacerlo es que busques en el menú de opciones del Eje X, donde llevaste la cantidad de personas.

## Mediana de compensación por género

Para terminar, calculá la mediana de compensación y abrila por dos variables: nivel y género. Es muy parecido a lo que hicimos en la primera página; si no sabés cómo llegar, podés empezar desde ahí.

Tratá de generarlo lo más parecido posible a la imagen y en el check in de la próxima sesión lo vemos.`,
          archivos: [
            {
              nombre: 'Plantilla de la tarea',
              url: 'https://drive.google.com/file/d/1mneUWdH3st95BS2zihqNf-aFWwCAL96L/view'
            }
          ]
        },
        {
          tipo: 'contenido',
          titulo: '5 pasos para crear buenas visualizaciones',
          texto: `## 1️⃣ Elegir la visualización

- 🔲 Si sólo vas a mostrar un dato, la **tarjeta** es una excelente opción.
- 📊 Si necesitás comparar valores o establecer un ranking, usá gráficos de **barras o columnas**. Un consejo para elegir: barras para variables categóricas (texto), columnas para variables numéricas o de tiempo.
- 📈 Los **gráficos de líneas** suelen usarse para mostrar tendencia en el tiempo.
- 🎂 Los **gráficos de torta o anillos** usalos con cuidado y para 2 o 3 segmentos máximo.
- 🎛 Los **segmentadores** te permiten filtrar a los demás gráficos.
- 📄 Las **tablas y matrices** son buenas para datos que se necesiten recorrer uno a uno; lo ideal es usarlas con conjuntos de hasta 20 datos.

## 2️⃣ Seleccionar los campos

Este paso es muy simple, Power BI permite arrastrar y tirar. En general los gráficos muestran un valor (la columna que llevás a *valores*) y lo segmentan de alguna forma (la columna que va al eje, a detalles o a leyenda).

## 3️⃣ Elegir la operación

Acá definís la operación a realizar (suma, promedio, mediana…) desde el menú ▼. En ese mismo menú encontrás cómo mostrar el valor **como porcentaje del total**, y si estás en una variable de segmentación podés agruparla con la función **Nuevo grupo**.

## 4️⃣ Aplicar filtros

Los filtros son muy parecidos a los de Excel, pero acá los aplicás en tres niveles:

- 📊 A un único gráfico (*en este gráfico hablo de los líderes solamente*).
- 📄 A todos los gráficos de una página (*en esta página hablo de activos*).
- 📕 A todo el informe (*quiero que todo el informe sea de un área*).

## 5️⃣ Trabajar sobre el formato

👩‍🎨 El rodillo te permite cambiar casi todo lo que tiene que ver con el formato.

Si querés trabajar con plantillas como hicimos en el workshop, tené en cuenta que se agregan desde **fondo de página** en el rodillo (no tenés que tener ningún gráfico seleccionado al entrar) y acordate de poner la **transparencia en 0%**.`
        },
        {
          tipo: 'contenido',
          titulo: 'Poderes ocultos de las visualizaciones',
          texto: `🤿 Si tenés más de un campo en el eje del objeto visual van a aparecer las opciones de **Explorar en profundidad** o *drill down*. Te permiten cambiar el nivel de detalle (granularidad) con que segmentás esos valores. Podés recorrer los diferentes niveles con las flechas ↑ ↓ ⇊ que aparecen sobre el gráfico.

🐱‍💻 Por otro lado, recordá que los gráficos **se pueden filtrar entre sí**. Si querés modificar ese funcionamiento, entrá a Formato → **Editar interacciones**.`
        }
      ]
    },

    {
      nombre: 'Bloque 3: Desbloquear el potencial de los datos con DAX',
      titulo: 'De la foto a la evolución temporal: desbloqueamos el poder de los datos con DAX',
      emoji: '🚀',
      sesiones: [5, 6],
      bajada:
        'Dejamos la foto de un momento para entender tendencias en el tiempo, con columnas y medidas.',
      objetivo: `Vamos a dejar de examinar la foto de un momento específico para **visualizar y entender tendencias a lo largo del tiempo**. Aprenderemos a transformar datos estáticos en información dinámica y significativa.

También vamos a sumergirnos en **DAX** (Data Analysis Expressions), el lenguaje que permite crear fórmulas y expresiones para cálculos complejos, resúmenes y filtrados.`,
      tarjetas: [
        {
          tipo: 'material',
          titulo: 'Base para el ejercicio',
          texto:
            'Para poder mirar la evolución en el tiempo necesitamos más de una foto. Acá está ' +
            'la base con los meses siguientes.',
          archivos: [
            {
              nombre: 'Panda · otros meses',
              url: 'https://drive.google.com/file/d/1TFpU-mDu002bTAgGKeXBfIUIp7wH58Zm/view'
            }
          ]
        },
        {
          tipo: 'material',
          titulo: 'Plantilla Evolución HC',
          texto:
            'La plantilla de la página de evolución de headcount, para que tu informe quede ' +
            'como el que vamos armando en vivo.',
          archivos: [
            {
              nombre: 'Plantilla Evolución HC',
              url: 'https://drive.google.com/file/d/1bdgQ0QliPF-2FLmhYd7ePSjwrnSudKh_/view'
            }
          ]
        },
        {
          tipo: 'enlace',
          titulo: 'Para seguir investigando DAX',
          texto: `¿Querés investigar otra forma de trabajar con múltiples fotos? Te dejamos algunos recursos:

- [Tutorial de HACHE sobre cómo calcular ausentismo con DAX](https://www.youtube.com/@ConsultoraHACHE)
- [La guía de fórmulas de DAX](https://learn.microsoft.com/es-es/dax/dax-function-reference) (son muchas, andá con paciencia)
- [Traductor de funciones de Excel](https://es.excel-translator.de/translator/), el que conversamos en la sesión.`
        },
        {
          tipo: 'contenido',
          titulo: 'Columnas DAX',
          texto: `- Una columna en DAX es similar a una columna en Excel: contiene valores calculados a partir de una fórmula.
- Las columnas **se agregan a las tablas** y se calculan **fila por fila**.
- Un ejemplo sería una columna que calcule la compensación neta de cada persona multiplicando el sueldo bruto por 83%. Devuelve un valor fila a fila.

Se escribiría así:

\`Comp. Neta = Tabla[Compensación Bruta] * 0.83\`

También podemos usar funciones. Por ejemplo, para calcular la edad:

\`Edad al día de hoy = ROUNDDOWN ( YEARFRAC ( Tabla[Fecha Nacimiento], TODAY (), 3 ), 0 )\``
        },
        {
          tipo: 'contenido',
          titulo: 'Medidas DAX',
          texto: `- Las medidas son cálculos hechos **en tiempo real** sobre los datos, en lugar de ser precalculadas y almacenadas en la tabla como las columnas.
- **No se visualizan en la tabla**, pero podés usarlas en los objetos visuales.
- Se crean con funciones DAX que operan sobre columnas o tablas completas. Son útiles para totales, promedios, contar elementos, etc., sobre los datos agregados.
- Por ejemplo, una medida podría ser el headcount:

\`Headcount = CALCULATE ( DISTINCTCOUNT ( Tabla[Legajo] ), ISBLANK ( Tabla[Fecha de egreso] ) )\`

## Analogía con Excel

Pensá en una fórmula de Excel en la que no necesitás calcular un valor para cada fila, sino un resultado general basado en un conjunto de datos. Por ejemplo, el promedio de una columna con \`=PROMEDIO(A:A)\`.

Las medidas **no consumen memoria RAM**, así que siempre que puedas es mejor hacer medidas que columnas: no van a hacer lento tu informe, cosa que sí pasa cuando agregás muchas columnas calculadas.`
        },
        {
          // Vino del bloque 4. Acá tiene más sentido: es justo donde entra la
          // base con los meses siguientes, que es una tabla nueva al modelo.
          tipo: 'contenido',
          titulo: 'Importar y conectar una nueva tabla al modelo',
          texto: `En Power BI podés importar tablas de diferentes lugares y establecer relaciones entre ellas. Si al importar una tabla nueva no se conecta automáticamente, podés hacerlo **arrastrando una columna sobre la otra** en la vista de modelo.

Cuando conectes tablas, hacelo **con códigos únicos en lugar de nombres**. En vez de unir dos tablas por nombre y apellido, usá número de legajo o documento: las conexiones quedan más eficientes y precisas.`
        }
      ]
    },

    {
      nombre: 'Bloque 4: De tu análisis a las decisiones',
      titulo: 'Es momento de transformar tu análisis en decisiones',
      emoji: '🧩',
      sesiones: [7, 8],
      bajada:
        'Modelado en estrella, relaciones entre tablas y todas las formas de compartir tu informe.',
      objetivo: `En este bloque conectamos todo lo que estuvimos viendo para **finalizar nuestro informe** y que funcione de manera 100% dinámica.

Hablaremos de **modelado dimensional** y de cómo compartir el informe con el resto de la organización.`,
      tarjetas: [
        {
          tipo: 'contenido',
          titulo: 'Modelado en estrella',
          texto: `En Power BI solemos trabajar con lo que se denomina **modelado en estrella**. Los datos se organizan alrededor de una **tabla de hechos**, que contiene las métricas numéricas, rodeada de **tablas dimensionales** que describen los distintos aspectos del personal y la organización.

La tabla de hechos es el corazón del modelo: guarda las medidas clave que querés analizar —cantidad de contrataciones, salario promedio, horas trabajadas—. Las tablas dimensionales representan el tiempo, el maestro de posiciones o el de edificios laborales.

1. **Simplicidad y claridad:** facilita entender la relación entre las métricas y las dimensiones del negocio.
2. **Rendimiento optimizado:** separar las medidas de las dimensiones mejora el rendimiento de las consultas.
3. **Flexibilidad:** se adapta a medida que cambian las necesidades de análisis.`
        },
        {
          tipo: 'contenido',
          titulo: 'Los valores de cardinalidad',
          texto: `- **Varios a uno (\\*:1)** indica una relación del tipo *dato a dimensión*. Por ejemplo, una tabla de capacitaciones con varias filas por participante, asociada a una tabla de personas con una fila para cada una. Es la más habitual.
- **Uno a uno (1:1)** se usa para vincular entradas individuales de tablas de referencia. No es habitual: de hecho lo mejor suele ser reemplazar la relación por una combinación en la vista de transformar datos.
- 🚫 **Varios a varios (\\*:\\*)**: si bien Power BI lo permite, no es recomendable. Si necesitás ese tipo de conexión, creá una tabla intermedia con valores únicos.

🔗 El modelado es un tema complejo que vas a ir aprendiendo a medida que avances en los proyectos. Mi recomendación es que empieces con una tabla y de a poco vayas sumando más información, conectándola y respondiendo preguntas en conjunto. Paso a paso.`
        },
        {
          tipo: 'contenido',
          titulo: 'Compartir tu informe',
          texto: `Power BI ofrece diferentes formas de compartir la información:

## Enviar el archivo .pbix
👍 Quien lo reciba va a poder modificarlo y consultar toda la información como si fuera vos.
👎 La ventaja es también la desventaja: no podés filtrar el acceso a los datos crudos ni proteger el archivo de modificaciones que generen errores.

## Exportar a PDF
Desde Archivo → Exportar → Exportar a PDF.
👍 Es rápido, el destinatario no necesita Power BI y podés mandarlo por mail.
👎 Es una foto, sin dinamismo.

## Publicar el informe
Desde Archivo → Publicar, o sea subirlo a la nube.
👍 Es gratuito y tan seguro como cualquier cosa protegida por contraseña en la nube.
👍 Genera una copia de seguridad que te permite recuperar el archivo.
👍 Podés acceder desde cualquier dispositivo y presentar a pantalla completa.
👎 No vas a poder enviárselo a otras personas salvo que compartas tu contraseña.

## Compartir con licencia PRO
👍 El acceso está protegido por usuario y contraseña en los servidores de Microsoft.
👍 Podés definir roles para decidir qué ve cada usuario (seguridad a nivel de fila).
👎 Es el único camino con costo: hay que abonar una licencia por usuario, que ronda los USD 10 mensuales.

## Compartir en la web de forma pública
👍 Es una forma muy simple y dinámica de compartir la info, si los datos no son confidenciales. Lamentablemente eso es más la excepción que la regla en HR.
👎 No tiene seguridad: cualquier persona con el link puede ver tus datos. Por defecto está deshabilitada y debe habilitarla el administrador del dominio.`
        }
      ]
    }
  ],

  /* ------------------------------------------------------------ La despedida
     La página /idcurso/cierre. Se linkea desde la ruta de bloques cuando ya
     están todas las grabaciones cargadas, y por link directo anda siempre.
     -------------------------------------------------------------------- */
  cierre: {
    titulo: '¡Felicitaciones! 🎓🥳',
    gif: 'https://media1.tenor.com/m/NRvAuY9ug-gAAAAC/applause-clapping.gif',
    gracias: '¡MUCHAS GRACIAS!',
    texto: `Para nosotros fue un placer acompañarte en esta etapa de tu camino de desarrollo y juntos sumergirnos en los datos para tomar mejores decisiones. Recordá que "dato mata relato" y ahora tenés nuevas herramientas para potenciar HR.

No queremos despedirnos, por eso te dejamos algunas acciones para seguir en contacto.`,
    acciones: [
      {
        emoji: '🤔',
        titulo: '¿Qué te pareció?',
        texto:
          'Por favor tomate dos minutos para contarnos brevemente tu experiencia y cómo ' +
          'podemos seguir mejorando desde aquí.',
        boton: 'Contarnos tu experiencia',
        url: 'https://docs.google.com/forms/d/e/1FAIpQLScClazsC4nUL4k69Ztn0_LICjKX47cHuoSEV2s7XVqRnpFPcw/viewform?usp=send_form'
      },
      {
        emoji: '📺',
        titulo: '¡A volver a verlo!',
        texto:
          'En la web quedan disponibles las grabaciones y todos los materiales, junto con ' +
          'los tips y recomendaciones que te acompañarán en tus proyectos.',
        boton: 'Volver al workshop',
        // Sin url: la arma cierre.js, porque depende del curso.
        volverAlCurso: true
      }
    ],
    /** El certificado, que tiene su propio paso a paso. */
    certificado: {
      emoji: '🎓',
      titulo: '¡Ahora sí! Descargá tu certificado',
      texto:
        'Entrá, hacé click en la pestaña **Certificados** y completá tu mail.',
      boton: 'Descargar el certificado',
      url: 'https://presentismoworkshops.vercel.app/',
      linkedin: {
        texto: 'Sumalo a LinkedIn así todos conocen esta nueva skill en tu perfil.',
        boton: 'Agregarlo a LinkedIn',
        url: 'https://tinyurl.com/certificadolinkedin'
      },
      /** Los campos a copiar en el formulario de LinkedIn. */
      campos: [
        { etiqueta: 'Nombre', valor: 'People Analytics con Power BI' },
        { etiqueta: 'Organización', valor: 'Consultora HACHE' },
        { etiqueta: 'Fecha de emisión', valor: '', hoy: true },
        {
          etiqueta: 'Fecha de expiración',
          valor: 'Tildá la opción de que no tiene fecha de vencimiento.'
        },
        {
          etiqueta: 'Añadir contenido multimedia',
          valor: 'Cargá el certificado que descargaste.'
        }
      ]
    },
    despedida: '¡HASTA QUE PEOPLE ANALYTICS NOS VUELVA A ENCONTRAR! 🚀'
  },

  /* --------------------------------------------------------------- Soporte */
  ayuda: {
    titulo: '¿Necesitás una mano?',
    texto: 'Si algo no se entiende o algo no funciona, escribinos y lo resolvemos.',
    mail: 'info@hache.com.ar'
  },

  /* ------------------------------------------------------------- Comunidad
     Sin "Conectar con Pablo": ese link ya está arriba, en la ficha de quién te
     guía, y repetirlo acá gastaba un lugar de la grilla.
     -------------------------------------------------------------------- */
  redes: [
    { emoji: '📷', titulo: 'Instagram', bajada: 'Conectemos en @consultora_hache',
      url: 'https://www.instagram.com/consultora_hache/' },
    { emoji: '🏢', titulo: 'HACHE en LinkedIn', bajada: 'Seguí a la consultora',
      url: 'https://www.linkedin.com/company/consultorahache/' },
    { emoji: '💙', titulo: 'Grupo de amigos de HACHE', bajada: 'La comunidad, en LinkedIn',
      url: 'https://www.linkedin.com/groups/12134403/' },
    { emoji: '▶️', titulo: 'YouTube', bajada: 'Tutoriales para seguir aprendiendo Power BI',
      url: 'https://www.youtube.com/@ConsultoraHACHE' }
  ],

  web: 'https://www.hacheconsultora.com'
};
