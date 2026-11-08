/** A view of an original example in the checked-in Canon reference. */
export interface CanonReference {
  /** Filename in canon/reference, without .html. Omit only for no equivalent. */
  page?: string;
  /** Section id. Without one, show the page's first example section. */
  section?: string;
  match?: "direct" | "pattern" | "none";
  note?: string;
  /** Example-only layout adjustments; never restyle Canon components. */
  css?: string;
  /** Other original components shown by a grouped story. */
  additional?: CanonReference[];
}
export type CanonReferenceResolver = (title: string, storyName: string) => CanonReference | undefined;
