"""Genera la base ficticia de ausentismo del Ejercicio Final de Power People.

Uso:  python3 scripts/generar_base.py   (desde ejercicio-ausentismo/)

Salida en site/datos/:
  - empleados.csv      dimensión de colaboradores (1 fila por legajo)
  - ausencias.csv      hechos de ausencias (1 fila por ausencia)
  - base_ausentismo.xlsx  las dos tablas en un mismo libro

La semilla es fija: correrlo de nuevo devuelve exactamente la misma base.
Los patrones que se esconden en los datos están documentados en GUIA-DOCENTE.md.
"""

import random
from datetime import date, timedelta
from pathlib import Path

import pandas as pd

SEED = 2026
INICIO = date(2025, 1, 1)
FIN = date(2026, 6, 30)
SALIDA = Path(__file__).resolve().parent.parent / "site" / "datos"

rng = random.Random(SEED)

# Feriados nacionales (Argentina) usados para marcar "puentes"
FERIADOS = {
    date(2025, 1, 1), date(2025, 3, 3), date(2025, 3, 4), date(2025, 3, 24), date(2025, 4, 2),
    date(2025, 4, 18), date(2025, 5, 1), date(2025, 5, 2), date(2025, 6, 16), date(2025, 6, 20),
    date(2025, 7, 9), date(2025, 8, 15), date(2025, 10, 10), date(2025, 11, 21), date(2025, 12, 8),
    date(2025, 12, 25), date(2026, 1, 1), date(2026, 2, 16), date(2026, 2, 17), date(2026, 3, 23),
    date(2026, 3, 24), date(2026, 4, 2), date(2026, 4, 3), date(2026, 5, 1), date(2026, 5, 25),
    date(2026, 6, 15), date(2026, 6, 20),
}


def es_habil(d):
    return d.weekday() < 5 and d not in FERIADOS


def sumar_habiles(d, n):
    """Devuelve la fecha del n-ésimo día hábil contando d como el primero."""
    contados = 0
    while True:
        if es_habil(d):
            contados += 1
            if contados == n:
                return d
        d += timedelta(days=1)


def es_puente(d):
    """Día hábil pegado a un feriado o a un fin de semana largo."""
    return (d - timedelta(days=1)) in FERIADOS or (d + timedelta(days=1)) in FERIADOS


# ---------------------------------------------------------------- empleados

AREAS = {
    # área: (dotación, puestos, sedes posibles, turnos posibles, propensión base)
    "Depósito":        (150, ["Operario/a de depósito", "Autoelevadorista", "Supervisor/a de depósito"],
                        ["CABA", "Rosario"], ["Mañana", "Tarde", "Noche"], 1.35),
    "Distribución":    (85,  ["Chofer", "Ayudante de reparto", "Coordinador/a de rutas"],
                        ["CABA", "Rosario", "Córdoba"], ["Mañana", "Tarde"], 1.15),
    "Atención al Cliente": (60, ["Representante de atención", "Líder de equipo"],
                        ["CABA", "Córdoba"], ["Mañana", "Tarde"], 1.05),
    "Administración":  (40,  ["Analista administrativo/a", "Asistente administrativo/a"],
                        ["CABA"], ["Mañana"], 0.70),
    "Comercial":       (35,  ["Ejecutivo/a comercial", "Key account"],
                        ["CABA", "Córdoba", "Rosario"], ["Mañana"], 0.65),
    "Tecnología":      (25,  ["Desarrollador/a", "Analista de sistemas", "Soporte IT"],
                        ["CABA"], ["Mañana"], 0.55),
    "RRHH":            (15,  ["Analista de RRHH", "Generalista de RRHH"],
                        ["CABA"], ["Mañana"], 0.60),
}

NOMBRES_LIDER = {
    "Depósito": {"CABA": ["M. Ferreyra", "R. Gómez"], "Rosario": ["L. Paz"]},
    "Distribución": {"CABA": ["J. Quiroga"], "Rosario": ["S. Medina"], "Córdoba": ["A. Ríos"]},
    "Atención al Cliente": {"CABA": ["C. Benítez"], "Córdoba": ["V. Luna"]},
    "Administración": {"CABA": ["E. Sosa"]},
    "Comercial": {"CABA": ["D. Castro"], "Córdoba": ["D. Castro"], "Rosario": ["D. Castro"]},
    "Tecnología": {"CABA": ["N. Ortiz"]},
    "RRHH": {"CABA": ["P. Molina"]},
}
LIDER_CRITICO = "R. Gómez"  # equipo con ausentismo muy por encima del resto


def fecha_al_azar(desde, hasta):
    return desde + timedelta(days=rng.randrange((hasta - desde).days + 1))


empleados = []
legajo = 1000
for area, (n, puestos, sedes, turnos, _) in AREAS.items():
    for i in range(n):
        legajo += rng.randint(1, 3)
        sede = rng.choice(sedes)
        turno = rng.choice(turnos)
        # Los primeros legajos de cada área son los supervisores / líderes de equipo
        puesto = puestos[-1] if i < max(1, n // 15) and len(puestos) > 1 else rng.choice(puestos[:-1] or puestos)
        ingreso = fecha_al_azar(date(2012, 1, 1), date(2026, 3, 31))
        # Un cuarto de la dotación ingresó recientemente (rotación alta en operaciones)
        if area in ("Depósito", "Distribución") and rng.random() < 0.30:
            ingreso = fecha_al_azar(date(2024, 6, 1), date(2026, 3, 31))
        egreso = None
        if rng.random() < 0.13:
            egreso = fecha_al_azar(max(ingreso + timedelta(days=60), INICIO), FIN)
            if egreso > FIN:
                egreso = None
        edad = rng.randint(20, 62)
        genero = rng.choices(["Femenino", "Masculino", "No binario"],
                             weights=[30, 68, 2] if area in ("Depósito", "Distribución") else [58, 40, 2])[0]
        lideres = NOMBRES_LIDER[area][sede]
        lider = rng.choice(lideres)
        empleados.append({
            "Legajo": legajo,
            "Area": area,
            "Puesto": puesto,
            "Sede": sede,
            "Turno": turno,
            "Lider": lider,
            "Genero": genero,
            "Edad": edad,
            "Fecha_Ingreso": ingreso,
            "Fecha_Egreso": egreso,
            "Modalidad": "Híbrida" if area in ("Administración", "Comercial", "Tecnología", "RRHH") and rng.random() < 0.7 else "Presencial",
        })

df_emp = pd.DataFrame(empleados)

# ---------------------------------------------------------------- ausencias

MOTIVOS = {
    # motivo: (peso, rango de días hábiles, prob. certificado)
    "Enfermedad":            (46, (1, 6), 0.85),
    "Trámite personal":      (14, (1, 1), 0.35),
    "Cuidado de familiar":   (11, (1, 3), 0.55),
    "Sin aviso":             (9,  (1, 2), 0.00),
    "Accidente laboral":     (4,  (3, 25), 1.00),
    "Licencia por estudio":  (7,  (1, 2), 0.90),
    "Enfermedad prolongada": (3,  (15, 45), 1.00),
    "Otro":                  (6,  (1, 2), 0.30),
}


def propension(e):
    p = AREAS[e["Area"]][4]
    if e["Turno"] == "Noche":
        p *= 1.45
    if e["Lider"] == LIDER_CRITICO:
        p *= 1.9
    antig = (date(2026, 1, 1) - e["Fecha_Ingreso"]).days / 365
    if antig < 1:
        p *= 1.35
    if e["Edad"] > 50:
        p *= 1.1
    return p


ausencias = []
dias_periodo = [INICIO + timedelta(days=i) for i in range((FIN - INICIO).days + 1)]
dias_habiles = [d for d in dias_periodo if es_habil(d)]

for e in empleados:
    activo_desde = max(e["Fecha_Ingreso"], INICIO)
    activo_hasta = min(e["Fecha_Egreso"] or FIN, FIN)
    if activo_desde > activo_hasta:
        continue
    p = propension(e)
    for d in dias_habiles:
        if d < activo_desde or d > activo_hasta:
            continue
        prob = 0.0105 * p
        # Invierno: más enfermedad
        if d.month in (6, 7, 8):
            prob *= 1.45
        # Lunes y viernes: más ausencias cortas
        if d.weekday() in (0, 4):
            prob *= 1.35
        if es_puente(d):
            prob *= 1.6
        # 2026 viene peor que 2025 en Rosario (nueva operación sin líder estable)
        if d.year == 2026 and e["Sede"] == "Rosario":
            prob *= 1.4
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
        fin = sumar_habiles(d, n)
        cert = "Sí" if rng.random() < MOTIVOS[motivo][2] else "No"
        ausencias.append({
            "Legajo": e["Legajo"],
            "Fecha_Inicio": d,
            "Fecha_Fin": fin,
            "Dias_Habiles": n,
            "Motivo": motivo,
            "Certificado": cert,
        })

# Quitar solapamientos: si una ausencia empieza antes de que termine la anterior, se descarta
ausencias.sort(key=lambda a: (a["Legajo"], a["Fecha_Inicio"]))
limpias, ultimo_fin = [], {}
for a in ausencias:
    if a["Legajo"] in ultimo_fin and a["Fecha_Inicio"] <= ultimo_fin[a["Legajo"]]:
        continue
    limpias.append(a)
    ultimo_fin[a["Legajo"]] = a["Fecha_Fin"]

df_aus = pd.DataFrame(limpias).sort_values(["Fecha_Inicio", "Legajo"]).reset_index(drop=True)

# ---------------------------------------------------------------- errores a propósito
# Una base real nunca viene limpia. Estos problemas son parte del ejercicio.

# 1) Motivos escritos de distintas formas
idx = df_aus[df_aus["Motivo"] == "Enfermedad"].sample(28, random_state=SEED).index
variantes = ["enfermedad", "ENFERMEDAD", "Enfermedad ", "Enfermdad"]
for k, i in enumerate(idx):
    df_aus.at[i, "Motivo"] = variantes[k % len(variantes)]

# 2) Certificado vacío
for i in df_aus.sample(22, random_state=SEED + 1).index:
    df_aus.at[i, "Certificado"] = None

# 3) Fecha de fin anterior a la de inicio (cargadas al revés)
for i in df_aus[df_aus["Dias_Habiles"] > 1].sample(5, random_state=SEED + 2).index:
    df_aus.at[i, "Fecha_Inicio"], df_aus.at[i, "Fecha_Fin"] = df_aus.at[i, "Fecha_Fin"], df_aus.at[i, "Fecha_Inicio"]

# 4) Legajos que no existen en la tabla de empleados
for k, i in enumerate(df_aus.sample(6, random_state=SEED + 3).index):
    df_aus.at[i, "Legajo"] = 99001 + k

# 5) Filas duplicadas
dups = df_aus.sample(9, random_state=SEED + 4)
df_aus = pd.concat([df_aus, dups]).sort_values(["Fecha_Inicio", "Legajo"]).reset_index(drop=True)

df_aus.insert(0, "ID_Ausencia", [f"A{n:05d}" for n in range(1, len(df_aus) + 1)])

# 6) Edad con valores imposibles
for i, v in zip(df_emp.sample(3, random_state=SEED + 5).index, [0, 117, 8]):
    df_emp.at[i, "Edad"] = v

# ---------------------------------------------------------------- guardar

SALIDA.mkdir(parents=True, exist_ok=True)
for df in (df_emp, df_aus):
    for col in df.columns:
        if col.startswith("Fecha"):
            df[col] = pd.to_datetime(df[col])

df_emp.to_csv(SALIDA / "empleados.csv", index=False, date_format="%Y-%m-%d", encoding="utf-8-sig")
df_aus.to_csv(SALIDA / "ausencias.csv", index=False, date_format="%Y-%m-%d", encoding="utf-8-sig")

with pd.ExcelWriter(SALIDA / "base_ausentismo.xlsx", engine="openpyxl", date_format="DD/MM/YYYY",
                    datetime_format="DD/MM/YYYY") as xl:
    df_emp.to_excel(xl, sheet_name="Empleados", index=False)
    df_aus.to_excel(xl, sheet_name="Ausencias", index=False)
    for hoja in xl.sheets.values():
        for col in hoja.columns:
            hoja.column_dimensions[col[0].column_letter].width = 18

print(f"Empleados: {len(df_emp)}  ·  Ausencias: {len(df_aus)}  ->  {SALIDA}")
