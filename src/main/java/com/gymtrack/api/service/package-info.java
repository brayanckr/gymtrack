/**
 * <b>Capa de negocio (Service).</b>
 *
 * <p>Responsabilidad: coordinar los casos de uso y aplicar las reglas de negocio (RN-xx de
 * {@code docs/02-reglas-de-negocio.md}). Cada regla violada se expresa con una excepción del paquete
 * {@code exception}, que el manejador global traduce a 400, 403, 404 o 409.
 *
 * <p>Los servicios colaboran entre sí siguiendo la <i>vista funcional</i>: por ejemplo
 * {@code ObjetivoService} usa {@code UsuarioService} para validar al miembro y
 * {@code EjercicioService} para validar el ejercicio, en lugar de leer sus repositorios.
 *
 * <p>Dependencias permitidas: {@code repository}, {@code model}, {@code dto} y {@code exception}.
 */
package com.gymtrack.api.service;
