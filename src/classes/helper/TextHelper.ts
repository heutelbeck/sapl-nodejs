import { isArrayBufferView } from "util/types";

/**
 * TextHelper class to help with text manipulation and chunk decoding
 */
export class TextHelper {
  public static decodeData(data: any) {
    if (data! instanceof ArrayBuffer || !isArrayBufferView(data)) {
      return data;
    }
    const decodedData = new TextDecoder().decode(data);
    try {
      let parsedData = JSON.parse(decodedData);
      return parsedData;
    } catch (error) {
      return "";
    }
  }
}
