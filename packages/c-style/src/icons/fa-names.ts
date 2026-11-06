import type { FunctionalComponent } from "vue";
import {
  ArrowDown,
  ArrowUp,
  Asterisk,
  Calendar,
  ClipboardList,
  Clock,
  Columns3,
  Download,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  Funnel,
  House,
  Info,
  Lock,
  LockOpen,
  Moon,
  Palette,
  Pencil,
  Save,
  Search,
  Settings,
  Trash2,
  Undo2,
} from "@lucide/vue";
import { csIcon } from "./cs-icon";

/**
 * FontAwesome names that Coalesce passes as icon strings (`"fa fa-save"`),
 * keyed without the `fa-` prefix. Re-grep `coalesce-vue-vuetify3/dist` for
 * `fa-` on every Coalesce upgrade; names missing here render as FontAwesome.
 */
const coalesce = {
  asterisk: Asterisk,
  "calendar-alt": Calendar,
  // c-table's sort indicators; Canon sorts with arrows.
  "caret-down": ArrowDown,
  "caret-up": ArrowUp,
  clock: Clock,
  columns: Columns3,
  download: Download,
  edit: Pencil,
  "ellipsis-h": Ellipsis,
  "external-link-alt": ExternalLink,
  eye: Eye,
  "eye-slash": EyeOff,
  filter: Funnel,
  "info-circle": Info,
  lock: Lock,
  save: Save,
  search: Search,
  "trash-alt": Trash2,
  undo: Undo2,
};

/** Names the Coalesce project template uses in its shell and admin index. */
const coalesceTemplate = {
  "clipboard-list": ClipboardList,
  cogs: Settings,
  home: House,
  "lock-open": LockOpen,
  moon: Moon,
  palette: Palette,
};

export const faIcons: ReadonlyMap<string, FunctionalComponent> = new Map(
  Object.entries({ ...coalesce, ...coalesceTemplate }).map(([name, icon]) => [
    name,
    csIcon(icon),
  ]),
);
