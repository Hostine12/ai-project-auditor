export interface FileInfo {
  path: string;
  content: string;
  extension: string;
}

export interface ScanError {
  file: string;
  error: string;
}