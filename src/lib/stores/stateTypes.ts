export type Bookmark = {
  id: string;
  title: string;
  description?: string;
  url: string;
  categoryId: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  children: Category[];
};

export type ViewId = "bookmarks" | "settings" | "about";

export type SettingsPageId =
  | "categories"
  | "home"
  | "themes"
  | "data"
  | "reset"
  | null;

export type State = {
  bookmarks: Bookmark[];
  categories: Category[];
  currentCategoryId: string | null;
  currentView: ViewId;
  currentSettingsPage: SettingsPageId;
  landingCategoryId: string | null;
};

export type ExportBundle = {
  bookmarks: Bookmark[];
  categories: Category[];
};

export type PersistenceError = {
  code: string;
  message: string;
};
