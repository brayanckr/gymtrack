package com.gymtrack.api.exception;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.gymtrack.api.dto.ErrorResponse;
import com.gymtrack.api.dto.ErrorResponse.CampoError;

/**
 * Traduce cada excepción a una respuesta HTTP con el cuerpo uniforme {@link ErrorResponse}.
 *
 * <p>Gracias a esta clase los controladores y servicios solo lanzan excepciones de negocio y nunca
 * construyen respuestas de error. El contrato de códigos está en {@code docs/05-contrato-api.md}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> noEncontrado(RecursoNoEncontradoException ex) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage(), List.of());
    }

    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<ErrorResponse> conflicto(ConflictoException ex) {
        return responder(HttpStatus.CONFLICT, ex.getMessage(), List.of());
    }

    @ExceptionHandler(OperacionNoPermitidaException.class)
    public ResponseEntity<ErrorResponse> noPermitida(OperacionNoPermitidaException ex) {
        return responder(HttpStatus.FORBIDDEN, ex.getMessage(), List.of());
    }

    @ExceptionHandler(ReglaDeNegocioException.class)
    public ResponseEntity<ErrorResponse> reglaDeNegocio(ReglaDeNegocioException ex) {
        return responder(HttpStatus.BAD_REQUEST, ex.getMessage(), List.of());
    }

    /** Fallo de Bean Validation en un {@code @Valid}: 400 con la lista de campos inválidos. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validacion(MethodArgumentNotValidException ex) {
        List<CampoError> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> new CampoError(f.getField(), f.getDefaultMessage()))
                .toList();
        return responder(HttpStatus.BAD_REQUEST, "Datos inválidos", errores);
    }

    /** JSON mal formado o con un valor que no corresponde a un enum/fecha (ej. {@code "tipo": "XYZ"}). */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> cuerpoIlegible(HttpMessageNotReadableException ex) {
        return responder(HttpStatus.BAD_REQUEST,
                "El cuerpo de la petición no es un JSON válido o contiene valores no reconocidos", List.of());
    }

    /** Parámetro de ruta o de consulta con un valor inválido (ej. {@code ?grupoMuscular=XYZ}). */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> parametroInvalido(MethodArgumentTypeMismatchException ex) {
        return responder(HttpStatus.BAD_REQUEST, "Valor inválido para el parámetro '" + ex.getName() + "'", List.of());
    }

    /** Red de seguridad si dos peticiones simultáneas violan un índice único antes de que el servicio lo detecte. */
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ErrorResponse> clavesDuplicadas(DuplicateKeyException ex) {
        return responder(HttpStatus.CONFLICT, "Ya existe un registro con esos datos", List.of());
    }

    /**
     * Cualquier otra excepción. Las que Spring ya asocia a un estado (405, 404 de ruta, 415...) conservan ese
     * estado; el resto es un 500 <b>sin detalles internos</b> para el cliente (el detalle va al log).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> inesperado(Exception ex) {
        if (ex instanceof org.springframework.web.ErrorResponse springError) {
            HttpStatus estado = HttpStatus.valueOf(springError.getStatusCode().value());
            return responder(estado, estado.getReasonPhrase(), List.of());
        }
        log.error("Error inesperado", ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", List.of());
    }

    private static ResponseEntity<ErrorResponse> responder(HttpStatus estado, String mensaje, List<CampoError> errores) {
        ErrorResponse cuerpo = new ErrorResponse(LocalDateTime.now(), estado.value(), estado.getReasonPhrase(),
                mensaje, errores);
        return ResponseEntity.status(estado).body(cuerpo);
    }
}
