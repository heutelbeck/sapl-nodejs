export interface WrapperObservable {
  wrapperObservableConfig: {
    readDataAllowed?: boolean;
    handleAccessDenied?: boolean;
    killIfDenied?: boolean;
  };
}
