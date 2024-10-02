export interface Subject {
  name: string;
  roles: any[];
}
export interface AuthorizationManager {
  /**
   * Get the path auf the AuthorizationManagerService
   *
   * @returns The path of the AuthorizationManagerService
   */
  getPath(): string;

  /**
   * Set the path of the AuthorizationManagerService
   *
   * @param path Path of the AuthorizationManagerService
   */
  setPath(path: string);

  /**
   * Set the subject name. The subject name is the name of the
   * subject that wants to execute the access and is used to
   * build the subject for the AuthorizationSubscription
   *
   * @param subjectName Subject name
   */
  setSubjectName(subjectName: string);

  /**
   * Get the subject name
   *
   * @returns The subject name
   */
  getSubjectName(): string;

  /**
   * Build the subject for the AuthorizationSubscription.
   * The subject is build with the subjectName and the roles.
   * The roles are retrieved from the AuthorizationManagerService
   * and delivered as an array of strings.
   *
   * @returns The subject for the AuthorizationSubscription
   */
  buildSubjectForAuhorizationSubscription();
}
