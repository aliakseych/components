// Type-only stand-in for "next", so page files can keep their metadata exports.
export interface Metadata {
  title?: string | { default: string; template?: string };
  description?: string;
  [key: string]: unknown;
}

export interface Viewport {
  [key: string]: unknown;
}
