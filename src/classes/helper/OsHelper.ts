import * as os from "os";

/**
 * Helper class for OS related operations.
 */
export class OsHelper {
  /**
   * Gets the username of the current OS user.
   * @returns Username of the current OS user
   */
  public static getOsUsername() {
    let userInfo = os.userInfo();

    return userInfo.username;
  }
}
