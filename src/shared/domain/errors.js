class DomainError extends Error {
  constructor(code, message, httpStatus = 400, details) {
    super(message); this.name = this.constructor.name;
    this.code = code; this.httpStatus = httpStatus;
    if (details) this.details = details;
  }
}
class ValidationError extends DomainError { constructor(m, d) { super('VALIDATION_ERROR', m, 422, d); } }
class NotFoundError extends DomainError { constructor(r = 'Recurso') { super('NOT_FOUND', `${r} não encontrado`, 404); } }
class ConflictError extends DomainError { constructor(m) { super('CONFLICT', m, 409); } }
class UnauthorizedError extends DomainError { constructor(m = 'Não autenticado') { super('UNAUTHORIZED', m, 401); } }
class ForbiddenError extends DomainError { constructor(m = 'Acesso negado') { super('FORBIDDEN', m, 403); } }
module.exports = { DomainError, ValidationError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError };