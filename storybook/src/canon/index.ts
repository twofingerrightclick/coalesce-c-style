import type { CanonReference, CanonReferenceResolver } from "./types";
import { textEntryReferences } from "./text-buttons";
import { buttonsSurfacesReferences } from "./buttons-surfaces";
import { coalesceReferences } from "./coalesce-inputs";
import { dataListReferences } from "./data-lists";
import { navigationReferences } from "./navigation";
import { mediaLayoutReferences } from "./media-layout";
import { overlaysPickersReferences } from "./overlays-pickers";
import { adminFeedbackReferences } from "./admin-feedback";

const resolvers: CanonReferenceResolver[] = [textEntryReferences, buttonsSurfacesReferences, coalesceReferences, dataListReferences, navigationReferences, mediaLayoutReferences, overlaysPickersReferences, adminFeedbackReferences];
export function canonReferenceFor(title: string, storyName: string): CanonReference | undefined {
  for (const resolve of resolvers) {
    const reference = resolve(title, storyName);
    if (reference) return reference;
  }
  return undefined;
}
