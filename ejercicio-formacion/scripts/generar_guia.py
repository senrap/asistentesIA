"""Genera la guía de recomendaciones del ejercicio de formación (PDF, A4, 2 páginas).

Uso:  python3 scripts/generar_guia.py [carpeta_con_fuentes_poppins]
      (desde ejercicio-formacion/)

La carpeta de fuentes tiene que tener Poppins-Regular.ttf, Poppins-SemiBold.ttf y
Poppins-ExtraBold.ttf (Google Fonts). Si no está, usa Helvetica.

Salida: site/assets/guia-del-dato-a-la-decision.pdf
"""

import sys
from datetime import date
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

BASE = Path(__file__).resolve().parent.parent
SALIDA = BASE / "site" / "assets" / "guia-del-dato-a-la-decision.pdf"
LOGO = BASE / "site" / "assets" / "logo-hache-blanco.png"

NAVY, NAVY2, GREEN, GREEN2, GREEN_DARK = (HexColor(c) for c in ("#00344D", "#0A4560", "#00FF90", "#00CC72", "#008C4F"))
GRAY, LIGHT, OFF, WHITE = (HexColor(c) for c in ("#6B7280", "#E8EDF2", "#F4F5F7", "#FFFFFF"))

fuentes = Path(sys.argv[1]) if len(sys.argv) > 1 else BASE / "fonts"
try:
    for nombre in ("Regular", "SemiBold", "ExtraBold"):
        pdfmetrics.registerFont(TTFont(f"Poppins-{nombre}", str(fuentes / f"Poppins-{nombre}.ttf")))
    REG, SEMI, BOLD = "Poppins-Regular", "Poppins-SemiBold", "Poppins-ExtraBold"
except Exception:
    REG, SEMI, BOLD = "Helvetica", "Helvetica-Bold", "Helvetica-Bold"

W, H = A4
M = 46  # margen


def wrap(c, text, font, size, width):
    """Corta un texto en líneas que entran en el ancho dado."""
    lines, line = [], ""
    for word in text.split():
        test = f"{line} {word}".strip()
        if c.stringWidth(test, font, size) <= width:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def paragraph(c, text, x, y, width, font=REG, size=10, color=NAVY, leading=None):
    leading = leading or size * 1.5
    c.setFont(font, size)
    c.setFillColor(color)
    for line in wrap(c, text, font, size, width):
        c.drawString(x, y, line)
        y -= leading
    return y


def header(c, subtitulo):
    c.setFillColor(NAVY)
    c.rect(0, H - 64, W, 64, stroke=0, fill=1)
    logo = ImageReader(str(LOGO))
    lw, lh = logo.getSize()
    c.drawImage(logo, M, H - 41, width=18 * lw / lh, height=18, mask="auto")
    c.setFont(SEMI, 9)
    c.setFillColor(WHITE)
    c.drawRightString(W - M, H - 30, "Power People")
    c.setFillColor(GREEN)
    c.drawRightString(W - M, H - 43, subtitulo)


def footer(c, page):
    c.setStrokeColor(LIGHT)
    c.line(M, 40, W - M, 40)
    c.setFont(REG, 8)
    c.setFillColor(GRAY)
    c.drawString(M, 28, f"© {date.today().year} Consultora HACHE · www.hacheconsultora.com")
    c.drawRightString(W - M, 28, f"{page} / 2")


def label(c, text, x, y, color=GREEN_DARK):
    t = c.beginText(x, y)
    t.setFont(SEMI, 8)
    t.setFillColor(color)
    t.setCharSpace(2)
    t.textLine(text.upper())
    t.setCharSpace(0)
    c.drawText(t)


PASOS = [
    ("La pregunta", "Atada a una decisión, que se responda con datos, que defina qué compara y que no dé por hecha la respuesta."),
    ("Las hipótesis", "Creemos que [programa] mejora o reduce [indicador]. Lo comprobamos comparando con y sin, o antes y después. Una opinión no es una hipótesis."),
    ("El debate con IA", "Usá un LLM como sparring: pedile qué dato te refuta, qué sesgo tenés y qué explicación alternativa existe. No aceptes todo."),
    ("Los datos", "Pedí lo justo: quién, qué hizo, cuánto costó y qué resultado tuvo. Los datos de salud, chats o redes sociales no corresponden."),
    ("El modelo", "Conectá por claves: Legajo para personas, Programa para cursos, Sucursal para resultados. Son relaciones uno a varios."),
    ("El análisis", "Compará con y sin programa y llegá al nivel 4: resultados de negocio. Que un curso guste no dice si sirvió."),
    ("Las recomendaciones", "Cada una responde a un hallazgo, tiene un responsable y se mide con un indicador y una meta."),
    ("La medición", "Todo programa nuevo arranca con un indicador de negocio, un grupo de comparación y una medición a los 3 meses."),
]

NIVELES = [
    ("1", "Reacción", "¿Les gustó?", "Encuesta al terminar el curso."),
    ("2", "Aprendizaje", "¿Aprendieron?", "Evaluación antes y después."),
    ("3", "Conducta", "¿Lo aplican?", "Uso a los 3 meses, observación del líder."),
    ("4", "Resultados", "¿Movió el negocio?", "Rotación, ausentismo, ventas, clientes."),
]

CHECKLIST = [
    "La pregunta abre la presentación y todo lo demás la responde.",
    "Cada hipótesis dice qué se compara y con qué indicador.",
    "Ningún dato pedido es sensible ni innecesario.",
    "Cada slide tiene un título que dice la conclusión.",
    "Lo que funciona se defiende con datos, no con satisfacción.",
    "Cada recomendación tiene responsable, indicador y meta.",
]

IAS = [
    ("Claude o ChatGPT", "Para pensar mejor", "Pedile que haga de escéptico y que te discuta las hipótesis."),
    ("Lovable", "Para construir", "Describí la herramienta en un párrafo y mejorala en 2 o 3 vueltas."),
    ("Gamma", "Para presentar", "Pegá un prompt con hallazgos y recomendaciones; ajustá los títulos."),
]


def pagina_1(c):
    header(c, "Ejercicio de formación")
    y = H - 110
    label(c, "Guía de recomendaciones", M, y)
    c.setFont(BOLD, 30)
    c.setFillColor(NAVY)
    c.drawString(M, y - 36, "Del dato a")
    c.drawString(M, y - 70, "la decisión.")
    c.setFillColor(GREEN2)
    c.rect(M, y - 88, 44, 3, stroke=0, fill=1)
    y = paragraph(c, "Ocho pasos para pensar cualquier análisis de People Analytics, con o sin herramientas. "
                     "Es el recorrido que hiciste en el ejercicio: tenelo a mano en tu próximo proyecto.",
                  M, y - 112, W - 2 * M, size=11, color=GRAY, leading=17)

    col_w = (W - 2 * M - 18) / 2
    top = y - 14
    alto = 112
    for i, (titulo, texto) in enumerate(PASOS):
        col, fila = i % 2, i // 2
        x = M + col * (col_w + 18)
        yy = top - fila * (alto + 12)
        c.setFillColor(OFF)
        c.setStrokeColor(LIGHT)
        c.roundRect(x, yy - alto, col_w, alto, 10, stroke=1, fill=1)
        c.setFillColor(NAVY)
        c.circle(x + 26, yy - 26, 13, stroke=0, fill=1)
        c.setFont(BOLD, 12)
        c.setFillColor(GREEN)
        c.drawCentredString(x + 26, yy - 30.5, str(i + 1))
        c.setFont(SEMI, 13)
        c.setFillColor(NAVY)
        c.drawString(x + 48, yy - 30, titulo)
        paragraph(c, texto, x + 18, yy - 56, col_w - 36, size=9.5, color=GRAY, leading=14)
    footer(c, 1)


def pagina_2(c):
    header(c, "Del dato a la decisión")
    y = H - 104
    label(c, "Cómo medir una formación", M, y)
    c.setFont(BOLD, 18)
    c.setFillColor(NAVY)
    c.drawString(M, y - 26, "Los 4 niveles de Kirkpatrick")
    y -= 46
    col_w = (W - 2 * M - 3 * 10) / 4
    for i, (n, nombre, preg, como) in enumerate(NIVELES):
        x = M + i * (col_w + 10)
        alto = 92 + i * 14
        c.setFillColor(NAVY if i == 3 else NAVY2)
        c.roundRect(x, y - 150, col_w, alto, 8, stroke=0, fill=1)
        top = y - 150 + alto
        c.setFont(SEMI, 7.5)
        c.setFillColor(GREEN)
        c.drawString(x + 12, top - 18, f"NIVEL {n}")
        c.setFont(SEMI, 12)
        c.setFillColor(WHITE)
        c.drawString(x + 12, top - 35, nombre)
        c.setFont(SEMI, 9)
        c.drawString(x + 12, top - 51, preg)
        paragraph(c, como, x + 12, top - 66, col_w - 24, size=8, color=HexColor("#C9D3DC"), leading=11)
    y -= 168
    paragraph(c, "La mayoría de las empresas mide solo el nivel 1. El Directorio se convence con el nivel 4.",
              M, y, W - 2 * M, font=SEMI, size=10, color=GREEN_DARK)

    y -= 40
    label(c, "Antes de presentar, chequeá", M, y)
    y -= 22
    for item in CHECKLIST:
        c.setStrokeColor(GREEN2)
        c.setLineWidth(1.4)
        c.rect(M, y - 3, 11, 11, stroke=1, fill=0)
        y = paragraph(c, item, M + 22, y, W - 2 * M - 22, size=10, leading=15) - 6

    y -= 18
    label(c, "Las 3 IA del ejercicio", M, y)
    y -= 16
    col_w = (W - 2 * M - 2 * 12) / 3
    for i, (nombre, para, tip) in enumerate(IAS):
        x = M + i * (col_w + 12)
        c.setFillColor(OFF)
        c.setStrokeColor(LIGHT)
        c.roundRect(x, y - 100, col_w, 100, 10, stroke=1, fill=1)
        c.setFont(SEMI, 12)
        c.setFillColor(NAVY)
        c.drawString(x + 14, y - 24, nombre)
        c.setFont(SEMI, 8.5)
        c.setFillColor(GREEN_DARK)
        c.drawString(x + 14, y - 39, para)
        paragraph(c, tip, x + 14, y - 56, col_w - 28, size=8.5, color=GRAY, leading=12)
    footer(c, 2)


def main():
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(SALIDA), pagesize=A4)
    c.setTitle("Del dato a la decisión · Guía de recomendaciones")
    c.setAuthor("Consultora HACHE")
    pagina_1(c)
    c.showPage()
    pagina_2(c)
    c.save()
    print(f"PDF generado: {SALIDA} ({REG})")


if __name__ == "__main__":
    main()
