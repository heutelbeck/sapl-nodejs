import { TextHelper } from "../../helper/TextHelper";
import { Predicate } from "../../Predicate";
import { AccessConstraintViolationException } from "./AccessConstraintViolationException";

export class ContentFilter {
  private static readonly NOT_A_VALID_PREDICATE_CONDITION =
    "Not a valid predicate condition: ";
  private static readonly DISCLOSE_LEFT = "discloseLeft";
  private static readonly DISCLOSE_RIGHT = "discloseRight";
  private static readonly REPLACEMENT = "replacement";
  private static readonly REPLACE = "replace";
  private static readonly LENGTH = "length";
  private static readonly BLACKEN = "blacken";
  private static readonly DELETE = "delete";
  private static readonly PATH = "path";
  private static readonly ACTIONS = "actions";
  private static readonly CONDITIONS = "conditions";
  private static readonly VALUE = "value";
  private static readonly EQUALS = "==";
  private static readonly NEQ = "!=";
  private static readonly GEQ = ">=";
  private static readonly LEQ = "<=";
  private static readonly GT = ">";
  private static readonly LT = "<";
  private static readonly REGEX = "=~";
  private static readonly TYPE = "type";
  private static readonly BLACK_SQUARE = "█";
  private static readonly UNDEFINED_KEY_S = "An action does not declare '%s'.";
  private static readonly VALUE_NOT_INTEGER_S =
    "An action's '%s' is not an integer.";
  private static readonly VALUE_NOT_TEXTUAL_S =
    "An action's '%s' is not textual.";
  private static readonly PATH_NOT_TEXTUAL =
    "The constraint indicates a text node to be blackened. However, the node identified by the path is not a text note.";
  private static readonly NO_REPLACEMENT_SPECIFIED =
    "The constraint indicates a text node to be replaced. However, the action does not specify a 'replacement'.";
  private static readonly REPLACEMENT_NOT_TEXTUAL =
    "'replacement' of 'blacken' action is not textual.";
  private static readonly LENGTH_NOT_NUMBER =
    "'length' of 'blacken' action is not numeric.";
  private static readonly UNKNOWN_ACTION_S = "Unknown action type: '%s'.";
  private static readonly ACTION_NOT_AN_OBJECT =
    "An action in 'actions' is not an object.";
  private static readonly ACTIONS_NOT_AN_ARRAY = "'actions' is not an array.";
  private static readonly BLACKEN_LENGTH_INVALID_VALUE = -1;

  public static predicateFromConditions(
    constraint: object,
    objectMapper: any
  ): any {
    let predicate = new Predicate<object>((anything) => true);

    if (this.noConditionsPresent(constraint)) return predicate;

    let conditions = constraint[ContentFilter.CONDITIONS];
    if (conditions !== undefined && Array.isArray(conditions)) {
      conditions.forEach((condition) => {
        let newPredicate = this.conditionToPredicate(condition);
        let oldPredicate = predicate;
        predicate = new Predicate<object>(
          (content) => oldPredicate.test(content) && newPredicate.test(content)
        );
      });
      return predicate;
    }

    return this.mapPathNotFoundToAccessDeniedException(predicate);
  }

  private static mapPathNotFoundToAccessDeniedException(
    predicate: Predicate<object>
  ) {
    return (x) => {
      try {
        return predicate;
      } catch (error) {
        throw new AccessConstraintViolationException(
          "Error evaluating a constraint predicate. The path defined in the constraint is not present in the data." +
            JSON.stringify(error)
        );
      }
    };
  }

  private static noConditionsPresent(constraint: any) {
    const condition = constraint[ContentFilter.CONDITIONS];
    return condition === undefined || condition === null;
  }

  private static conditionToPredicate(condition: object): Predicate<object> {
    if (!condition[ContentFilter.PATH])
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );
    if (!condition[ContentFilter.TYPE])
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );
    if (!condition[ContentFilter.VALUE])
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    let path = condition[ContentFilter.PATH];
    let type = condition[ContentFilter.TYPE];

    if (type === ContentFilter.EQUALS)
      return this.equalsCondition(condition, path);

    if (type === ContentFilter.NEQ)
      return this.notEqualsCondition(condition, path);

    if (type === ContentFilter.GEQ) return this.geqCondition(condition, path);

    if (type === ContentFilter.LEQ) return this.leqCondition(condition, path);

    if (type === ContentFilter.GT) return this.gtCondition(condition, path);

    if (type === ContentFilter.LT) return this.ltCondition(condition, path);

    if (type === ContentFilter.REGEX)
      return this.regexCondition(condition, path);

    throw new AccessConstraintViolationException(
      ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
    );
  }

  private static equalsCondition(
    condition: object,
    path: any
  ): Predicate<object> {
    let value = condition[ContentFilter.VALUE];
    if (typeof value === "number")
      return this.numberEqCondition(condition, path);

    if (typeof value !== "string")
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "string") return false;
      return value === node;
    });
  }
  private static notEqualsCondition(
    condition: object,
    path: any
  ): Predicate<object> {
    let value = condition[ContentFilter.VALUE];
    if (typeof value === "number")
      return this.numberNeqCondition(condition, path);

    if (typeof value !== "string")
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "string") return false;
      return value !== node;
    });
  }

  private static numberEqCondition(
    condition: object,
    path: any
  ): Predicate<object> {
    let value = <number>condition[ContentFilter.VALUE];
    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "number") return false;
      return value == node;
    });
  }

  private static numberNeqCondition(
    condition: object,
    path: any
  ): Predicate<object> {
    let value = <number>condition[ContentFilter.VALUE];
    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "number") return false;
      return value !== node;
    });
  }

  private static geqCondition(condition: object, path: any): Predicate<object> {
    if (typeof condition[ContentFilter.VALUE] !== "number")
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    let value = <Number>condition[ContentFilter.VALUE];

    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "number") return false;
      return <Number>node >= value;
    });
  }

  private static leqCondition(condition: object, path: any): Predicate<object> {
    if (typeof condition[ContentFilter.VALUE] !== "number")
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    let value = <Number>condition[ContentFilter.VALUE];

    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "number") return false;
      return <Number>node <= value;
    });
  }

  private static ltCondition(condition: object, path: any): Predicate<object> {
    if (typeof condition[ContentFilter.VALUE] !== "number")
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    let value = <Number>condition[ContentFilter.VALUE];

    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "number") return false;
      return <Number>node < value;
    });
  }

  private static gtCondition(condition: object, path: any): Predicate<object> {
    if (typeof condition[ContentFilter.VALUE] !== "number")
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    let value = <Number>condition[ContentFilter.VALUE];

    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "number") return false;
      return <Number>node > value;
    });
  }

  private static regexCondition(
    condition: object,
    path: any
  ): Predicate<object> {
    if (typeof condition[ContentFilter.VALUE] !== "string")
      throw new AccessConstraintViolationException(
        ContentFilter.NOT_A_VALID_PREDICATE_CONDITION + condition
      );

    const regexPattern = new RegExp(condition[ContentFilter.VALUE]);

    return new Predicate<object>((original) => {
      path = ContentFilter.findKeyPath(original, path);
      let node = ContentFilter.getValueByPath(original, path);
      if (typeof node !== "string") return false;
      return regexPattern.test(<string>(<unknown>node));
    });
  }

  public static getHandler(constraint: any, objectMapper: any) {
    let predicate = this.predicateFromConditions(constraint, objectMapper);
    let transformation = this.getTransformationHandler(
      constraint,
      objectMapper
    );

    return (payload) => {
      if (!payload) {
        return payload;
      } else if (Array.isArray(payload)) {
        return payload.map((element) =>
          this.mapElement(element, transformation, predicate)
        );
      }

      return this.mapElement(payload, transformation, predicate);
    };
  }
  public static getTransformationHandler(constraint: any, objectMapper: any) {
    return (original) => {
      if (original instanceof Error) return original;

      let actions = constraint[ContentFilter.ACTIONS];

      if (typeof original === "string") original = JSON.parse(original);

      let modified = original;

      if (modified instanceof Buffer) {
        modified = TextHelper.decodeData(modified);
      }

      if (actions === undefined || actions === null) return original;

      if (!Array.isArray(actions))
        throw new AccessConstraintViolationException(
          ContentFilter.ACTIONS_NOT_AN_ARRAY
        );

      actions.forEach((action) => {
        this.applyAction(modified, action);
      });

      return modified;
    };
  }

  static applyAction(jsonContext: any, action: any) {
    if (typeof action !== "object")
      throw new AccessConstraintViolationException(
        ContentFilter.ACTION_NOT_AN_OBJECT
      );

    let path = this.getTextualValueOfActionKey(action, ContentFilter.PATH);
    let actionType = this.getTextualValueOfActionKey(
      action,
      ContentFilter.TYPE
    ).toLowerCase();
    let paths = ContentFilter.findKeyPaths(jsonContext, path);

    if (ContentFilter.getValueFromPaths(jsonContext, paths) === undefined)
      throw new AccessConstraintViolationException(
        "Constraint enforcement failed. Error evaluating a constraint predicate. The path defined in the constraint is not present in the data."
      );
    if (ContentFilter.DELETE === actionType) {
      ContentFilter.changeValueByPaths(jsonContext, paths, null);
      return;
    }

    if (ContentFilter.BLACKEN === actionType) {
      ContentFilter.blacken(jsonContext, paths, action);
      return;
    }

    if (ContentFilter.REPLACE === actionType) {
      ContentFilter.replace(jsonContext, paths, action);
      return;
    }

    throw new AccessConstraintViolationException(
      ContentFilter.UNKNOWN_ACTION_S + actionType
    );
  }

  static findKeyPath(
    obj: any,
    key: string,
    path: string = ""
  ): string | undefined {
    if (typeof obj === "string") {
      //needed because of the recursive call of the method
      try {
        obj = JSON.parse(obj);
      } catch (error) {}
    }
    if (obj === null || typeof obj !== "object") return undefined;

    if (obj.hasOwnProperty(key)) {
      return `${path}${key}`;
    }

    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        const result = ContentFilter.findKeyPath(obj[k], key, `${path}${k}.`);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }

  static findKeyPaths(obj: any, key: string, path: string[] = []): string[][] {
    let paths: string[][] = [];

    if (typeof obj === "string") {
      // Needed because some strings are not valid JSON due to the recursive call of findKeyPaths
      try {
        obj = JSON.parse(obj);
      } catch (error) {
        return paths;
      }
    }

    if (obj === null || typeof obj !== "object") return paths;

    if (obj.hasOwnProperty(key)) {
      paths.push([...path, key]);
    }

    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        const result = ContentFilter.findKeyPaths(obj[k], key, [...path, k]);
        paths = paths.concat(result);
      }
    }

    return paths;
  }

  static getValueFromPaths(jsonContext: any, paths: string[][]): any[] {
    if (typeof jsonContext === "string") {
      jsonContext = JSON.parse(jsonContext);
    }

    return paths.map((path) => {
      return path.reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) {
          return acc[key];
        }
        return undefined;
      }, jsonContext);
    });
  }

  static changeValueByPaths(
    jsonContext: any,
    paths: string[][],
    newValue: any
  ): void {
    if (typeof jsonContext === "string") {
      jsonContext = JSON.parse(jsonContext);
    }

    paths.forEach((path) => {
      let obj = jsonContext;
      for (let i = 0; i < path.length - 1; i++) {
        if (obj && typeof obj === "object" && path[i] in obj) {
          obj = obj[path[i]];
        } else {
          return; // Path is invalid
        }
      }
      if (obj && typeof obj === "object" && path[path.length - 1] in obj) {
        obj[path[path.length - 1]] = newValue;
      }
    });
  }

  static getValueByPath(jsonContext: any, path: string): any {
    if (typeof jsonContext === "string") jsonContext = JSON.parse(jsonContext);
    return path?.split(".").reduce((acc, key) => acc && acc[key], jsonContext);
  }

  static changeValueByPath(
    jsonContext: any,
    path: string,
    newValue: any
  ): boolean {
    const keys = path.split(".");
    const lastKey = keys.pop(); // the last key is the one to be changed
    if (!lastKey) return false;

    // get the object that contains the last key
    const lastObj = keys.reduce((acc, key) => acc && acc[key], jsonContext);

    if (lastObj && lastKey in lastObj) {
      lastObj[lastKey] = newValue;
      return true;
    } else {
      return false;
    }
  }

  private static replace(jsonContext: any, paths: string[][], action: any) {
    ContentFilter.changeValueByPaths(
      jsonContext,
      paths,
      action[ContentFilter.REPLACEMENT]
    );
  }
  private static blacken(jsonContext: any, paths: string[][], action: any) {
    // jsonContext[path] = this.blackenNode(jsonContext[path], action);
    // ContentFilter.changeValueByPath(
    //   jsonContext,
    //   path,
    //   this.blackenNode(ContentFilter.getValueByPath(jsonContext, path), action)
    // );
    paths.forEach((path) => {
      ContentFilter.changeValueByPath(
        jsonContext,
        path.join("."),
        this.blackenNode(
          ContentFilter.getValueByPath(jsonContext, path.join(".")),
          action
        )
      );
    });
  }

  private static blackenNode(jsonContext: any, action: any): any {
    let originalString = "";
    if (typeof jsonContext === "string") {
      originalString = jsonContext;
    } else if (typeof jsonContext === "object") {
      originalString = JSON.stringify(jsonContext);
    } else {
      throw new AccessConstraintViolationException(
        ContentFilter.PATH_NOT_TEXTUAL
      );
    }

    let replacementString = this.determineReplacementString(action);
    let discloseRight = this.getIntegerValueOfActionKeyOrDefaultToZero(
      action,
      ContentFilter.DISCLOSE_RIGHT
    );
    let discloseLeft = this.getIntegerValueOfActionKeyOrDefaultToZero(
      action,
      ContentFilter.DISCLOSE_LEFT
    );
    let blackenLength = this.determineBlackenLength(action);

    return this.blackenUtil(
      originalString,
      replacementString,
      discloseRight,
      discloseLeft,
      blackenLength
    );
  }
  private static blackenUtil(
    originalString: string,
    replacement: string,
    discloseRight: number,
    discloseLeft: number,
    blackenLength: number
  ) {
    if (discloseLeft + discloseRight >= originalString.length)
      return originalString;

    let result: string[] = [];

    if (discloseLeft > 0) {
      result.push(originalString.substring(0, discloseLeft));
    }
    let replacedChars = originalString.length - discloseLeft - discloseRight;
    let blackenFinalLength =
      blackenLength == ContentFilter.BLACKEN_LENGTH_INVALID_VALUE
        ? replacedChars
        : blackenLength;
    result.push(replacement.repeat(blackenFinalLength));
    if (discloseRight > 0) {
      result.push(originalString.substring(discloseLeft + replacedChars));
    }
    return result.join("");
  }

  private static determineBlackenLength(action: any): number {
    let replacementNode = action[ContentFilter.LENGTH];

    if (replacementNode === undefined)
      return ContentFilter.BLACKEN_LENGTH_INVALID_VALUE;

    if (typeof replacementNode === "number" && replacementNode >= 0)
      return replacementNode;

    throw new AccessConstraintViolationException(
      ContentFilter.LENGTH_NOT_NUMBER
    );
  }

  private static getIntegerValueOfActionKeyOrDefaultToZero(
    action: any,
    key: string
  ): number {
    if (action[key] === undefined) return 0;

    let value = action[key];

    if (isNaN(value) || !isFinite(value)) {
      throw new AccessConstraintViolationException(
        ContentFilter.VALUE_NOT_INTEGER_S + key
      );
    }
    return parseInt(value);
  }

  private static determineReplacementString(action: any): string {
    let replacementNode = action[ContentFilter.REPLACEMENT];

    if (replacementNode === undefined) return ContentFilter.BLACK_SQUARE;

    if (typeof replacementNode === "string") return replacementNode.toString();

    throw new AccessConstraintViolationException(
      ContentFilter.REPLACEMENT_NOT_TEXTUAL
    );
  }

  private static getTextualValueOfActionKey(action: any, PATH: string): string {
    let value = action[PATH];
    if (typeof value !== "string")
      throw new AccessConstraintViolationException(
        ContentFilter.VALUE_NOT_TEXTUAL_S
      );
    value = value.replace("$.", "");
    return value;
  }

  private static mapElement(
    payload: any,
    transformation: (payload) => void,
    predicate: any
  ) {
    if (predicate.test(payload)) return transformation(payload);
    return payload;
  }
}
