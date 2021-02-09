export interface ImageData {
  id: string;
  folderName: string;
  uploadDate: string;
}

export interface ImageDataResponse {
  images: ImageData[];
  token: string;
}

export interface FolderDataResponse {
  folders: string[];
  token: string;
}
