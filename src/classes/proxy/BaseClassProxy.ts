/**
 * Proxy-Class to store an instance of a class which will be initialized later.
 */
export class BaseClassProxy {
  static classReference: any;

  /**
   * Create a proxy for the given instance.
   * @param instance The instance to create the proxy for.
   * @returns The proxy of the instance.
   */
  public static createProxy<T extends object>(instance: T): T {
    return new Proxy<T>(instance, {
      get: function (target, property, receiver) {
        if (BaseClassProxy.classReference === undefined) {
          return undefined;
        }
        const value = BaseClassProxy.classReference[property as keyof T];
        // Überprüfen, ob es sich um eine Funktion handelt
        if (typeof value === "function") {
          return value.bind(BaseClassProxy.classReference);
        }
        return value;
      },
      set: function (target, prop, value) {
        if (BaseClassProxy.classReference) {
          (BaseClassProxy.classReference as T)[prop] = value;
          return true;
        } else {
          throw new Error("Egal is not initialized yet.");
        }
      },
    });
  }

  /**
   * Set the class reference.
   * @param classReference The class reference to set.
   */
  static setClassReference(classReference: any) {
    BaseClassProxy.classReference = classReference;
  }
}
