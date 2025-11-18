/**
 * Custom error classes for better error handling
 */

export class MSGraphError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'MSGraphError';
    Object.setPrototypeOf(this, MSGraphError.prototype);
  }
}

export class AuthenticationError extends MSGraphError {
  constructor(message: string, code?: string) {
    super(message, code, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class PermissionError extends MSGraphError {
  constructor(message: string, requiredPermissions: string[] = []) {
    super(
      `${message}\nRequired permissions: ${requiredPermissions.join(', ')}`,
      'PERMISSION_DENIED',
      403
    );
    this.name = 'PermissionError';
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

export class ValidationError extends MSGraphError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class ConfigurationError extends MSGraphError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class ResourceNotFoundError extends MSGraphError {
  constructor(resource: string, identifier: string) {
    super(
      `${resource} not found: ${identifier}`,
      'RESOURCE_NOT_FOUND',
      404
    );
    this.name = 'ResourceNotFoundError';
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
  }
}
