# Capacitacion Operativa eNrTa / DeliveryCore

Guia rapida para entrenar a un equipo no tecnico en 45-60 minutos.

## 1) Objetivo de la capacitacion

Al terminar, el equipo debe poder:
- Cargar pedidos.
- Optimizar ruta.
- Monitorear conductores en tiempo real.
- Enviar sugerencias por conductor.
- Ejecutar pruebas en Sandbox.

## 2) Agenda sugerida (60 min)

1. 10 min: Vision general de la plataforma.
2. 15 min: Operacion diaria (pestanas Operacion y Rutas).
3. 10 min: Controlador (seguimiento por conductor + sugerencias).
4. 15 min: Sandbox (pruebas y escenarios).
5. 10 min: Datos (usuarios, conductores, BD, respaldo).

## 3) Flujo operativo recomendado (para el dia a dia)

1. Cargar/validar pedidos en `Datos`.
2. Revisar conductores activos y turnos en `Datos > Gestion de equipo`.
3. Optimizar ruta en `Rutas`.
4. Monitorear avance en `Operacion`.
5. Enviar ajustes en `Controlador`.
6. Guardar snapshot offline cuando la ruta quede validada.

## 4) Ejercicio practico de capacitacion

1. Ir a `Sandbox`.
2. Cargar un escenario de prueba (formato simple o JSON).
3. Ajustar trafico/clima/velocidad.
4. Ejecutar prueba.
5. Ir a `Controlador` y enviar una sugerencia individual.
6. Volver a `Operacion` y validar impacto en ETA y velocidad.

## 5) Roles y responsabilidades

- Operador de despacho:
  Carga pedidos, optimiza y monitorea ETA.
- Controlador principal:
  Supervisa conductores y envia sugerencias.
- Supervisor:
  Revisa eficiencia global y decide cambios de estrategia.

## 6) Checklist antes de salir a produccion

- Variables de entorno configuradas.
- API key de Google validada (si aplica).
- Optimizador Python activo (opcional, recomendado).
- Backup de BD exportado.
- Prueba sandbox ejecutada y aprobada.

## 7) FAQ corto para usuarios

- No veo cambios en interfaz:
  Recarga fuerte (`Cmd/Ctrl + Shift + R`).
- El mapa no carga Google:
  Revisa `GOOGLE_MAPS_JS_API_KEY`.
- No hay ruta:
  Verifica pedidos pendientes y orden de codigos.
- Quiero usar sin internet:
  Guarda snapshot y usa `Cargar ultima ruta guardada`.
