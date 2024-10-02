import { SaplVersion } from "../../SaplVersion";

/**
 * Exception thrown when an access constraint is violated.
 * @extends Error
 */
export class AccessConstraintViolationException extends Error {
  static readonly serialVersionUID: number = SaplVersion.VERSION_UID;

  constructor(message?: string) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AccessConstraintViolationException.prototype);
  }
}
