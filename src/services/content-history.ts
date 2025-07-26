// This service is no longer needed as we are using local storage.
// The file is kept to avoid breaking imports, but it does nothing.

export interface HistoryItem {
  id: string;
  content: string;
  date: string;
}
