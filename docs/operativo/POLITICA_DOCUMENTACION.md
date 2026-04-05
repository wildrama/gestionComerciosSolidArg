# Politica de documentacion y limpieza

## Objetivo
Reducir ruido en la raiz del proyecto sin perder historial de trabajo.

## Estructura definida
- docs/operativo/
  - Documentacion viva y util para operar, mantener y desplegar.
- docs/archivo/
  - Notas historicas, auditorias, cierres por fase y resumenes temporales.

## Regla de uso
- Si un documento describe estado temporal, auditoria puntual o cierre de una tarea ya finalizada, va a docs/archivo/.
- Si un documento explica como operar el sistema hoy, va a docs/operativo/.

## Regla para PRD
Opciones segun preferencia del equipo:
- Opcion A (recomendada): mantener docs/archivo/ en rama de desarrollo y excluirla del paquete de despliegue.
- Opcion B: eliminar docs/archivo/ antes de release final si se quiere un artefacto minimalista.

## Resultado de esta limpieza
- Se movieron 70 archivos de notas/reportes desde la raiz a docs/archivo/.
- Se conservaron en raiz solo archivos operativos de codigo/config y README principal.
