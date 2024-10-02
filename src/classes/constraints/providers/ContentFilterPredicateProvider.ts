import { ContentFilter } from "./ContentFilter";
import { ConstraintResponsibility } from "./ConstraintResponsibility";
import { FilterPredicateConstraintHandlerProvider } from "../../../interfaces/constraints/FilterPredicateConstraintHandlerProvider";

/**
 * This class is responsible for providing the content filter predicate handler.
 * @implements FilterPredicateConstraintHandlerProvider
 */
export class ContentFilterPredicateProvider
  implements FilterPredicateConstraintHandlerProvider
{
  private static readonly CONSTRAINT_TYPE: string =
    "jsonContentFilterPredicate"; // propbably not needed

  private readonly objectMapper: any;

  getHandler(constraint: object) {
    return ContentFilter.predicateFromConditions(constraint, this.objectMapper);
  }
  isResponsible(constraint: object): boolean {
    return ConstraintResponsibility.isResponsible(
      constraint,
      ContentFilterPredicateProvider.CONSTRAINT_TYPE
    );
  }
}
