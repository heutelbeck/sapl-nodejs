import { Predicate } from "../Predicate";

/**
 * Utility class equivalent in TypeScript to the Java class of the same name.
 */
export class FunctionUtil {
  /**
   * Creates a function doing nothing.
   * @returns A function doing nothing.
   */
  public static sink(): (t) => void {
    return (t) => t;
  }

  /**
   * Creates a function for long values doing nothing.
   * @returns A function doing nothing for long values.
   */
  public static longSink(): (t: number) => void {
    return (t) => t;
  }

  /**
   * Creates a predicate which always returns true.
   * @returns A predicate that always returns true.
   */
  public static all() {
    return new Predicate<object>(() => true);
  }

  /**
   * Creates a Runnable doing nothing.
   * @returns A Runnable doing nothing.
   */
  public static noop(): () => void {
    return () => {};
  }
}
