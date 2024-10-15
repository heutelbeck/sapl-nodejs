import { Transform } from "stream";
import { TextHelper } from "./TextHelper";
import { AccessDeniedException } from "../constraints/providers/AccessDeniedException";
import { ReactiveConstraintHandlerBundle } from "../constraints/ReactiveConstraintHandlerBundle";

/**
 * WrapperStreamHelper class which extends/overrides the Transform stream
 * to handle the data and control the access to the data
 * based on the decision of the PDP.
 */
export class WrapperStreamHelper extends Transform {
  private readonly killIfDenied: boolean;
  private readonly bHandleAccessDenied: boolean;
  private readDataAllowed: boolean;
  private bundle: ReactiveConstraintHandlerBundle<any>;

  /**
   * Constructor of the WrapperStreamHelper class.
   * @param options Options for the WrapperStreamHelper
   */
  constructor(options) {
    super(options);
    this.readDataAllowed = options.readDataAllowed;
    this.killIfDenied = options.killIfDenied;
    this.bHandleAccessDenied = options.handleAccessDenied;
  }

  /**
   * @override the _transform method of the Transform stream.
   * Transforms the chunk of data.
   * @param streamData Chunk of data
   * @param encoding Encoding of the chunk
   * @param callback Callback function
   */
  _transform(streamData, encoding, callback) {
    if (this.readDataAllowed === true) {
      let data = TextHelper.decodeData(streamData);
      this.bundle.handleAllOnNextConstraints(data);
      callback(null, JSON.stringify(data));
    } else if (this.killIfDenied === true) {
      this.bundle.handleAllOnErrorConstraints(
        new AccessDeniedException("Access Denied. Action not permitted.")
      );
      callback(
        new AccessDeniedException("Access Denied. Action not permitted."),
        null
      );
    } else {
      if (this.getHandleAccessDenied()) {
        this.handleAccessDenied();
      }
      callback(); // Empty buffer
    }
  }

  /**
   * Returns the wrapper stream.
   * @returns WrapperStreamHelper
   */
  getWrapperStream() {
    return this;
  }

  /**
   * Sets the readDataAllowed property.
   * @param readDataAllowed ReadDataAllowed
   * @returns WrapperStreamHelper
   */
  setReadDataAllowed(readDataAllowed: boolean) {
    this.readDataAllowed = readDataAllowed;
    return this;
  }

  handleAccessDenied() {
    if (this.bundle) {
      this.bundle.handleAllOnErrorConstraints(
        new AccessDeniedException("Access Denied. Action not permitted.")
      );
    }
  }

  /**
   * Returns the bHandleAccessDenied property.
   * @returns bHandleAccessDenied
   */
  getHandleAccessDenied() {
    return this.bHandleAccessDenied;
  }

  setBundle(bundle: ReactiveConstraintHandlerBundle<any>) {
    this.bundle = bundle;
  }
}
