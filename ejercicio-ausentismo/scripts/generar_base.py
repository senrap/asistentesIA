"""Genera la base ficticia de ausentismo del ejercicio de Power People.

Uso:  python3 scripts/generar_base.py   (desde ejercicio-ausentismo/)

Salida en site/datos/:
  - base_ausentismo.xlsx / _csv.zip   recorrido completo: base con 4 errores a propósito
  - base_lista.xlsx / _csv.zip        recorrido exprés: base limpia, con columna Año
  - ejercicio.js              respuestas esperadas + vista previa de las tablas (lo usa la web)

La semilla es fija: correrlo de nuevo devuelve exactamente la misma base.

Simplificaciones a propósito (el ejercicio dura dos clases de una hora):
  - Período: 2024 y 2025 completos.
  - Nadie entra ni sale en el período: la dotación es fija.
  - Días hábiles = lunes a viernes (sin feriados), igual que en la medida DAX.

Errores a propósito (los 4 controles de la slide "Limpiar"):
  1. Fechas guardadas como número de serie de Excel → cambiar tipo a Fecha.
  2. Ausencias duplicadas con el mismo ID_Ausencia → quitar duplicados por ID.
  3. Motivo "Enfermedad" escrito de 3 formas más → reemplazar valores.
  4. Fecha_Fin anterior a Fecha_Inicio → columna personalizada que las ordene.
"""

import io
import json
import random
import zipfile
from datetime import date, timedelta
from pathlib import Path

import pandas as pd

SEED = 2026
INICIO = date(2024, 1, 1)
FIN = date(2025, 12, 31)
SALIDA = Path(__file__).resolve().parent.parent / "site" / "datos"
EXCEL_EPOCH = date(1899, 12, 30)

rng = random.Random(SEED)


def serial(d):
    return (d - EXCEL_EPOCH).days


def es_habil(d):
    return d.weekday() < 5


def sumar_habiles(d, n):
    """Fecha del n-ésimo día hábil contando d como el primero."""
    contados = 0
    while True:
        if es_habil(d):
            contados += 1
            if contados == n:
                return d
        d += timedelta(days=1)


# ---------------------------------------------------------------- empleados

AREAS = {
    # área: (dotación, puestos, sedes, turnos, propensión base)
    "Depósito": (150, ["Supervisor/a de depósito", "Operario/a de depósito", "Autoelevadorista"],
                 ["CABA", "Rosario"], ["Mañana", "Tarde", "Noche"], 1.30),
    "Distribución": (85, ["Coordinador/a de rutas", "Chofer", "Ayudante de reparto"],
                     ["CABA", "Rosario", "Córdoba"], ["Mañana", "Tarde"], 1.05),
    "Atención al Cliente": (60, ["Líder de equipo", "Representante de atención"],
                            ["CABA", "Córdoba"], ["Mañana", "Tarde"], 1.05),
    "Administración": (40, ["Analista administrativo/a", "Asistente administrativo/a"],
                       ["CABA"], ["Mañana"], 0.70),
    "Comercial": (35, ["Key account", "Ejecutivo/a comercial"],
                  ["CABA", "Córdoba", "Rosario"], ["Mañana"], 0.65),
    "Tecnología": (25, ["Analista de sistemas", "Desarrollador/a", "Soporte IT"],
                   ["CABA"], ["Mañana"], 0.55),
    "RRHH": (15, ["Generalista de RRHH", "Analista de RRHH"],
             ["CABA"], ["Mañana"], 0.60),
}

LIDERES = {
    "Depósito": {"CABA": ["M. Ferreyra", "R. Gómez"], "Rosario": ["L. Paz"]},
    "Distribución": {"CABA": ["J. Quiroga"], "Rosario": ["S. Medina"], "Córdoba": ["A. Ríos"]},
    "Atención al Cliente": {"CABA": ["C. Benítez"], "Córdoba": ["V. Luna"]},
    "Administración": {"CABA": ["E. Sosa"]},
    "Comercial": {"CABA": ["D. Castro"], "Córdoba": ["D. Castro"], "Rosario": ["D. Castro"]},
    "Tecnología": {"CABA": ["N. Ortiz"]},
    "RRHH": {"CABA": ["P. Molina"]},
}
LIDER_CRITICO = "R. Gómez"


def fecha_al_azar(desde, hasta):
    return desde + timedelta(days=rng.randrange((hasta - desde).days + 1))


empleados = []
legajo = 1000
for area, (n, puestos, sedes, turnos, _) in AREAS.items():
    for i in range(n):
        legajo += rng.randint(1, 3)
        sede = rng.choice(sedes)
        turno = rng.choice(turnos)
        # Los primeros legajos de cada área son los líderes / supervisores
        puesto = puestos[0] if i < max(1, n // 15) else rng.choice(puestos[1:])
        ingreso = fecha_al_azar(date(2010, 1, 1), date(2023, 12, 31))
        if area in ("Depósito", "Distribución") and rng.random() < 0.30:
            ingreso = fecha_al_azar(date(2023, 1, 1), date(2023, 12, 31))
        genero = rng.choices(["Femenino", "Masculino", "No binario"],
                             weights=[30, 68, 2] if area in ("Depósito", "Distribución") else [58, 40, 2])[0]
        empleados.append({
            "Legajo": legajo,
            "Area": area,
            "Puesto": puesto,
            "Sede": sede,
            "Turno": turno,
            "Lider": rng.choice(LIDERES[area][sede]),
            "Genero": genero,
            "Edad": rng.randint(20, 62),
            "Fecha_Ingreso": ingreso,
            "Modalidad": "Híbrida" if area in ("Administración", "Comercial", "Tecnología", "RRHH")
                         and rng.random() < 0.7 else "Presencial",
        })

# ---------------------------------------------------------------- ausencias

MOTIVOS = {
    # motivo: (peso, rango de días hábiles, prob. certificado)
    "Enfermedad": (46, (1, 6), 0.85),
    "Trámite personal": (14, (1, 1), 0.35),
    "Cuidado de familiar": (11, (1, 3), 0.55),
    "Sin aviso": (9, (1, 2), 0.00),
    "Accidente laboral": (4, (3, 25), 1.00),
    "Licencia por estudio": (7, (1, 2), 0.90),
    "Enfermedad prolongada": (3, (15, 45), 1.00),
    "Otro": (6, (1, 2), 0.30),
}


def propension(e):
    p = AREAS[e["Area"]][4]
    if e["Turno"] == "Noche":
        p *= 1.45
    if e["Lider"] == LIDER_CRITICO:
        p *= 1.9
    if (INICIO - e["Fecha_Ingreso"]).days < 365:
        p *= 1.3
    if e["Edad"] > 50:
        p *= 1.1
    return p


ausencias = []
dias_habiles = [INICIO + timedelta(days=i) for i in range((FIN - INICIO).days + 1)]
dias_habiles = [d for d in dias_habiles if es_habil(d)]

for e in empleados:
    p = propension(e)
    for d in dias_habiles:
        prob = 0.0105 * p
        if d.month in (6, 7, 8):          # invierno
            prob *= 1.45
        if d.weekday() == 0:              # lunes
            prob *= 1.55
        elif d.weekday() == 4:            # viernes
            prob *= 1.25
        if d.year == 2025:
            if e["Sede"] == "Rosario":    # nueva operación sin líder estable
                prob *= 1.5
            if e["Area"] == "Atención al Cliente":  # mejora tras cambio de turnos
                prob *= 0.7
        if rng.random() >= prob:
            continue

        motivo = rng.choices(list(MOTIVOS), weights=[v[0] for v in MOTIVOS.values()])[0]
        if motivo == "Accidente laboral" and e["Area"] not in ("Depósito", "Distribución") and rng.random() < 0.85:
            motivo = "Enfermedad"
        if motivo == "Licencia por estudio" and e["Edad"] > 40 and rng.random() < 0.7:
            motivo = "Trámite personal"
        if motivo == "Enfermedad" and e["Lider"] == LIDER_CRITICO and rng.random() < 0.25:
            motivo = "Sin aviso"
        lo, hi = MOTIVOS[motivo][1]
        n = rng.randint(lo, hi)
        if motivo == "Enfermedad" and rng.random() < 0.55:
            n = rng.randint(1, 2)
        ausencias.append({
            "Legajo": e["Legajo"],
            "Fecha_Inicio": d,
            "Fecha_Fin": sumar_habiles(d, n),
            "Dias_Habiles": n,
            "Motivo": motivo,
            "Certificado": "Sí" if rng.random() < MOTIVOS[motivo][2] else "No",
        })

# Sin solapamientos: si una ausencia empieza antes de que termine la anterior, se descarta
ausencias.sort(key=lambda a: (a["Legajo"], a["Fecha_Inicio"]))
limpias, ultimo_fin = [], {}
for a in ausencias:
    if a["Legajo"] in ultimo_fin and a["Fecha_Inicio"] <= ultimo_fin[a["Legajo"]]:
        continue
    limpias.append(a)
    ultimo_fin[a["Legajo"]] = a["Fecha_Fin"]

df_emp = pd.DataFrame(empleados)
df_aus = pd.DataFrame(limpias).sort_values(["Fecha_Inicio", "Legajo"]).reset_index(drop=True)
df_aus.insert(0, "ID_Ausencia", [f"A{n:05d}" for n in range(1, len(df_aus) + 1)])

# ---------------------------------------------------------------- respuestas esperadas
# Se calculan sobre la base limpia, con la misma lógica que las medidas DAX:
#   Tasa = Días perdidos / (Dotación × días hábiles del año), por año de Fecha_Inicio.

HAB = {y: sum(1 for d in dias_habiles if d.year == y) for y in (2024, 2025)}
m = df_aus.merge(df_emp, on="Legajo")
m["Anio"] = m["Fecha_Inicio"].map(lambda d: d.year)


def tasa(anio, filtro=None):
    emp = df_emp if filtro is None else df_emp[filtro(df_emp)]
    aus = m[(m["Anio"] == anio) & m["Legajo"].isin(emp["Legajo"])]
    return aus["Dias_Habiles"].sum() / (len(emp) * HAB[anio]) * 100


def ranking(col, anio, valores=None):
    valores = valores or sorted(df_emp[col].unique())
    return {v: round(tasa(anio, lambda e, v=v: e[col] == v), 2) for v in valores}


t24, t25 = tasa(2024), tasa(2025)
dep_caba = lambda l: (lambda e: (e["Area"] == "Depósito") & (e["Sede"] == "CABA") & (e["Lider"] == l))
cortas = m[(m["Anio"] == 2025) & (m["Dias_Habiles"] <= 2)]
dias_sem = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
m25 = m[m["Anio"] == 2025]
motivo_casos = m25.groupby("Motivo").size().sort_values(ascending=False)
motivo_dur = m25.groupby("Motivo")["Dias_Habiles"].mean().sort_values(ascending=False)

respuestas = {
    "dias_habiles": HAB,
    "dias_perdidos_total": int(m["Dias_Habiles"].sum()),
    "dotacion": len(df_emp),
    "tasa_2024": round(t24, 2),
    "tasa_2025": round(t25, 2),
    "incremento_pct": round((t25 / t24 - 1) * 100, 1),
    "sede_2025": ranking("Sede", 2025),
    "area_2025": ranking("Area", 2025, list(AREAS)),
    "atencion_2024": round(tasa(2024, lambda e: e["Area"] == "Atención al Cliente"), 2),
    "atencion_2025": round(tasa(2025, lambda e: e["Area"] == "Atención al Cliente"), 2),
    "turno_2025": ranking("Turno", 2025),
    "deposito_caba_lider_2025": {l: round(tasa(2025, dep_caba(l)), 2) for l in ("M. Ferreyra", "R. Gómez")},
    "cortas_por_dia_2025": {dias_sem[k]: int(v) for k, v in
                            cortas["Fecha_Inicio"].map(lambda d: d.weekday()).value_counts().sort_index().items()},
    "motivo_mas_casos_2025": motivo_casos.index[0],
    "motivo_mayor_duracion_2025": motivo_dur.index[0],
    "duracion_media_top_2025": round(motivo_dur.iloc[0], 1),
}

# ---------------------------------------------------------------- base lista (recorrido exprés)
# Misma base, sin errores, con fechas reales y la columna Año para no necesitar Calendario.

emp_lista = df_emp.copy()
aus_lista = df_aus.copy()
aus_lista["Año"] = aus_lista["Fecha_Inicio"].map(lambda d: d.year)

# ---------------------------------------------------------------- errores a propósito

# 2) Duplicados con el mismo ID: ausencias largas que se actualizaron y el reporte volvió a traer
largas = df_aus[df_aus["Dias_Habiles"] >= 10]
dups = largas.sample(min(45, len(largas)), random_state=SEED)
df_aus = pd.concat([df_aus, dups]).sort_values(["Fecha_Inicio", "Legajo"], kind="stable").reset_index(drop=True)

# 3) Enfermedad escrita de tres formas más
idx = df_aus[df_aus["Motivo"] == "Enfermedad"].sample(36, random_state=SEED + 1).index
for k, i in enumerate(idx):
    df_aus.at[i, "Motivo"] = ["enfermedad", "ENFERMEDAD", "Enfermdad"][k % 3]

# 4) Fechas invertidas, solo en ausencias que empiezan y terminan el mismo mes
mismo_mes = df_aus[(df_aus["Dias_Habiles"] > 1)
                   & (df_aus["Fecha_Inicio"].map(lambda d: (d.year, d.month))
                      == df_aus["Fecha_Fin"].map(lambda d: (d.year, d.month)))
                   & ~df_aus["ID_Ausencia"].isin(dups["ID_Ausencia"])]
for i in mismo_mes.sample(12, random_state=SEED + 2).index:
    df_aus.at[i, "Fecha_Inicio"], df_aus.at[i, "Fecha_Fin"] = df_aus.at[i, "Fecha_Fin"], df_aus.at[i, "Fecha_Inicio"]

respuestas["control"] = {
    "filas_ausencias": len(df_aus),
    "duplicados": int(df_aus.duplicated("ID_Ausencia").sum()),
    "motivos_mal_escritos": 36,
    "fechas_invertidas": 12,
}

# 1) Fechas como número de serie de Excel
for df in (df_emp, df_aus):
    for col in df.columns:
        if col.startswith("Fecha"):
            df[col] = df[col].map(serial)

# ---------------------------------------------------------------- guardar

SALIDA.mkdir(parents=True, exist_ok=True)
for viejo in ("empleados.csv", "ausencias.csv"):
    (SALIDA / viejo).unlink(missing_ok=True)

def guardar(nombre, emp, aus):
    with pd.ExcelWriter(SALIDA / f"{nombre}.xlsx", engine="openpyxl",
                        date_format="DD/MM/YYYY", datetime_format="DD/MM/YYYY") as xl:
        emp.to_excel(xl, sheet_name="Empleados", index=False)
        aus.to_excel(xl, sheet_name="Ausencias", index=False)
        for hoja in xl.sheets.values():
            for col in hoja.columns:
                hoja.column_dimensions[col[0].column_letter].width = 18
    with zipfile.ZipFile(SALIDA / f"{nombre}_csv.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for archivo, df in (("empleados.csv", emp), ("ausencias.csv", aus)):
            buf = io.StringIO()
            df.to_csv(buf, index=False, date_format="%Y-%m-%d")
            z.writestr(archivo, "\ufeff" + buf.getvalue())


def muestra(df):
    df = df.head(4).copy()
    for col in df.columns:
        if col.startswith("Fecha"):
            df[col] = df[col].map(lambda v: v.strftime("%d/%m/%Y") if hasattr(v, "strftime") else v)
    return {"columnas": list(df.columns), "filas": df.astype(str).values.tolist()}


guardar("base_ausentismo", df_emp, df_aus)   # recorrido completo: con errores
guardar("base_lista", emp_lista, aus_lista)  # recorrido exprés: limpia

(SALIDA / "respuestas.json").unlink(missing_ok=True)
preview = {
    "empleados": muestra(df_emp), "ausencias": muestra(df_aus),
    "empleados_lista": muestra(emp_lista), "ausencias_lista": muestra(aus_lista),
}
(SALIDA / "ejercicio.js").write_text(
    "// Generado por scripts/generar_base.py. No editar a mano.\n"
    "window.EJERCICIO = " + json.dumps({"respuestas": respuestas, "preview": preview}, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8")

print(f"Empleados: {len(df_emp)}  ·  Ausencias: {len(df_aus)}  ->  {SALIDA}")
print(json.dumps(respuestas, ensure_ascii=False, indent=2))
