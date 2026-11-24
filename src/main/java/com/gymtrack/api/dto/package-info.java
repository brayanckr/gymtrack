/**
 * <b>Objetos de transferencia (DTO)</b>: la forma de los mensajes JSON de la API.
 *
 * <p>La clase de dominio y su representación JSON no son lo mismo (pregunta del material): los
 * <i>Request</i> traen validaciones de formato ({@code @NotBlank}, {@code @Min}...) y los
 * <i>Response</i> exponen solo lo que el cliente necesita (por ejemplo el progreso calculado, que no
 * se guarda). Son {@code record}s inmutables agrupados por recurso.
 *
 * <p>Dependencia permitida: {@code model} (los Response se construyen desde una entidad).
 */
package com.gymtrack.api.dto;
