type ErrorOptions = { cause?: unknown };

export class DomainError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string, options?: ErrorOptions) {
    super(`${entity}が見つかりません: ${id}`, options);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

export class AlreadyExistsError extends DomainError {
  constructor(entity: string, identifier: string, options?: ErrorOptions) {
    super(`${entity}は既に存在します: ${identifier}`, options);
    this.name = 'AlreadyExistsError';
  }
}
