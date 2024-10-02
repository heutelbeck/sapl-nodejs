/**
 * Exception thrown when access to a resource is denied.
 * @extends Error
 */
export class AccessDeniedException extends Error {
  constructor(message?: string) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AccessDeniedException.prototype);
  }
}
