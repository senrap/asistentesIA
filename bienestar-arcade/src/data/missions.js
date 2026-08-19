/**
 * Pool de misiones traviesas. Cada dia se sortean 3, siempre de categorias
 * distintas, para que el dia tenga variedad y no tres sentadillas seguidas.
 *
 * mins = duracion estimada (1 a 5 minutos)
 * pts  = puntaje al completarla
 */
export const MISSIONS = [
  // --- MOVIMIENTO DISRUPTIVO ---
  { id: 'mov-01', cat: 'movimiento', title: '15 SENTADILLAS REBELDES', desc: 'Hacelas en un lugar inusual: el pasillo, el ascensor, atras de la puerta de la oficina.', mins: 2, pts: 20 },
  { id: 'mov-02', cat: 'movimiento', title: 'ESCALERA EN MODO TURBO', desc: 'Subi o baja un piso completo por escalera, aunque el ascensor te este esperando abierto.', mins: 3, pts: 20 },
  { id: 'mov-03', cat: 'movimiento', title: 'BAILE DE 1 TEMA', desc: 'Poné una cancion y movete como si nadie te viera. Bonus si alguien te ve.', mins: 3, pts: 25 },
  { id: 'mov-04', cat: 'movimiento', title: 'LLAMADA CAMINANDO', desc: 'La proxima llamada la atendes de pie y caminando. Nada de silla.', mins: 5, pts: 20 },
  { id: 'mov-05', cat: 'movimiento', title: '10 ELEVACIONES DE TALON', desc: 'Mientras se calienta el agua, la impresora imprime o el mail carga.', mins: 1, pts: 15 },
  { id: 'mov-06', cat: 'movimiento', title: 'ESTIRAR COMO GATO', desc: 'Manos al techo, dedos bien largos, y despues tocate las puntas de los pies.', mins: 2, pts: 15 },
  { id: 'mov-07', cat: 'movimiento', title: 'PLANCHA DE 30 SEGUNDOS', desc: 'Donde estes. Si te tiembla todo, ganaste igual.', mins: 1, pts: 20 },
  { id: 'mov-08', cat: 'movimiento', title: 'LA VUELTA MANZANA CORTA', desc: 'Salí a la calle y caminá 5 minutos sin destino ni objetivo productivo.', mins: 5, pts: 25 },

  // --- SALUD OCULAR ---
  { id: 'ocu-01', cat: 'ocular', title: 'DESBLOQUEO A 6 METROS', desc: 'Mirá un punto lejano durante 2 minutos. La pantalla puede esperar.', mins: 2, pts: 20 },
  { id: 'ocu-02', cat: 'ocular', title: 'REGLA 20-20-20', desc: 'Cada 20 minutos, 20 segundos mirando algo a 20 pies. Hacelo 3 veces seguidas.', mins: 2, pts: 20 },
  { id: 'ocu-03', cat: 'ocular', title: 'PALMEO OSCURO', desc: 'Tapate los ojos con las palmas (sin apretar) y quedate en negro absoluto 60 segundos.', mins: 1, pts: 15 },
  { id: 'ocu-04', cat: 'ocular', title: 'PARPADEO CONSCIENTE', desc: '20 parpadeos lentos y completos. Estuviste con los ojos secos toda la mañana.', mins: 1, pts: 15 },
  { id: 'ocu-05', cat: 'ocular', title: 'INFINITO CON LOS OJOS', desc: 'Dibujá un 8 acostado en el aire moviendo solo los ojos. Cinco vueltas para cada lado.', mins: 2, pts: 15 },
  { id: 'ocu-06', cat: 'ocular', title: 'CAZA DE VERDE', desc: 'Buscá algo verde y vivo (planta, arbol, pasto) y miralo fijo 90 segundos.', mins: 2, pts: 20 },
  { id: 'ocu-07', cat: 'ocular', title: 'BRILLO AL MINIMO', desc: 'Baja el brillo de todas tus pantallas un escalon y dejalo asi el resto del dia.', mins: 1, pts: 15 },
  { id: 'ocu-08', cat: 'ocular', title: 'ENFOQUE CERCA / LEJOS', desc: 'Pulgar a 20 cm, ventana al fondo. Alterná el foco 10 veces.', mins: 2, pts: 15 },

  // --- NUTRICION ALEGRE ---
  { id: 'nut-01', cat: 'nutricion', title: 'AGUA CON LIMON PRIMERO', desc: 'Un vaso de agua con limon antes del primer cafe del dia. El cafe llega despues.', mins: 2, pts: 20 },
  { id: 'nut-02', cat: 'nutricion', title: 'VASO ANTES DE LA PANTALLA', desc: 'Tomá un vaso entero de agua antes de volver a mirar el telefono.', mins: 1, pts: 15 },
  { id: 'nut-03', cat: 'nutricion', title: 'BOCADO A CIEGAS', desc: 'Comé un bocado con los ojos cerrados, masticando 20 veces. Se siente raro. Es la idea.', mins: 2, pts: 20 },
  { id: 'nut-04', cat: 'nutricion', title: 'FRUTA DE CONTRABANDO', desc: 'Metele una fruta a un momento donde normalmente irian galletitas.', mins: 3, pts: 20 },
  { id: 'nut-05', cat: 'nutricion', title: 'ALMUERZO SIN PANTALLA', desc: 'Cinco minutos de comida sin celular, sin mail, sin serie. Solo la comida.', mins: 5, pts: 25 },
  { id: 'nut-06', cat: 'nutricion', title: 'UN COLOR NUEVO AL PLATO', desc: 'Sumale al plato algo de un color que hoy todavia no comiste.', mins: 3, pts: 20 },
  { id: 'nut-07', cat: 'nutricion', title: 'INFUSION LENTA', desc: 'Prepará un te o mate y tomate los primeros 3 minutos sin hacer nada mas.', mins: 3, pts: 20 },
  { id: 'nut-08', cat: 'nutricion', title: 'MEDIO VASO EXTRA', desc: 'Cada vez que pases por la cocina hoy, medio vaso de agua. Minimo tres veces.', mins: 2, pts: 15 },

  // --- DIGITAL DETOX ---
  { id: 'det-01', cat: 'detox', title: 'MODO CUEVA 20 MIN', desc: 'Modo avion o no molestar durante 20 minutos. El mundo sobrevive.', mins: 5, pts: 25 },
  { id: 'det-02', cat: 'detox', title: 'TELEFONO EN OTRA HABITACION', desc: 'Dejalo lejos 15 minutos mientras hacés otra cosa. Que camine el que quiera revisarlo.', mins: 5, pts: 25 },
  { id: 'det-03', cat: 'detox', title: 'CAZA DE NOTIFICACIONES', desc: 'Apagá las notificaciones de 3 apps que no las necesitan. Para siempre.', mins: 3, pts: 25 },
  { id: 'det-04', cat: 'detox', title: 'ESCALA DE GRISES', desc: 'Poné el celular en blanco y negro por una hora. Aburre lindo.', mins: 2, pts: 20 },
  { id: 'det-05', cat: 'detox', title: 'CERO SCROLL EN LA FILA', desc: 'La proxima espera (fila, ascensor, colectivo) la hacés sin sacar el telefono.', mins: 3, pts: 20 },
  { id: 'det-06', cat: 'detox', title: 'CIERRE DE PESTAÑAS', desc: 'Cerrá todas las pestañas abiertas menos una. Sí, todas.', mins: 2, pts: 15 },
  { id: 'det-07', cat: 'detox', title: 'BAÑO SIN PANTALLA', desc: 'Ir al baño sin llevar el telefono. Clasico subestimado.', mins: 3, pts: 15 },
  { id: 'det-08', cat: 'detox', title: 'PRIMERA HORA LIMPIA', desc: 'Ni mail ni redes durante los primeros 20 minutos despues de despertarte.', mins: 5, pts: 25 },

  // --- PRESENCIA / SENSORIAL ---
  { id: 'pre-01', cat: 'presencia', title: 'DESCALZO SOBRE EL PISO FRIO', desc: 'Sacate los zapatos y quedate parado sobre el piso frio 60 segundos. Sentí la temperatura.', mins: 1, pts: 20 },
  { id: 'pre-02', cat: 'presencia', title: 'AGUA FRIA EN LAS MUÑECAS', desc: 'Treinta segundos de agua fria en las muñecas y la nuca. Reinicio instantaneo.', mins: 1, pts: 15 },
  { id: 'pre-03', cat: 'presencia', title: 'INVENTARIO 5-4-3-2-1', desc: '5 cosas que ves, 4 que escuchas, 3 que tocas, 2 que olés, 1 que saboreás.', mins: 3, pts: 25 },
  { id: 'pre-04', cat: 'presencia', title: 'RESPIRACION 4-7-8', desc: 'Inhalá 4, sostené 7, exhalá 8. Cuatro rondas completas.', mins: 3, pts: 20 },
  { id: 'pre-05', cat: 'presencia', title: 'SOL O VIENTO EN LA CARA', desc: 'Salí afuera y quedate 2 minutos con el sol o el viento dandote en la cara.', mins: 2, pts: 20 },
  { id: 'pre-06', cat: 'presencia', title: 'MAPA DE SONIDOS', desc: 'Ojos cerrados: identificá el sonido mas lejano que puedas escuchar.', mins: 2, pts: 15 },
  { id: 'pre-07', cat: 'presencia', title: 'MANOS EN AGUA CALIENTE', desc: 'Lavate las manos prestando atencion real a la temperatura y la textura del jabon.', mins: 1, pts: 15 },
  { id: 'pre-08', cat: 'presencia', title: 'UN MENSAJE AGRADECIDO', desc: 'Mandale a alguien un mensaje diciendole algo concreto que le agradecés.', mins: 3, pts: 25 },
]

/** Micro-tarea del Comodin Travieso: 10 segundos y la racha se salva. */
export const WILDCARD_TASK = {
  id: 'wildcard',
  title: 'RESPIRA 3 VECES',
  desc: 'Tres respiraciones profundas. Nada mas. Hoy con eso alcanza.',
  seconds: 10,
  pts: 5,
}

export const MISSIONS_BY_CAT = MISSIONS.reduce((acc, m) => {
  ;(acc[m.cat] ||= []).push(m)
  return acc
}, {})
