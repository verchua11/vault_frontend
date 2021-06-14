import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VaultService {
  constructor(private http: HttpClient) {}

  // getFolders(ids: Array<string>) {
  //   const formData = new FormData();
  //   ids.forEach((id) => {
  //     formData.append('id[]', id);
  //   });

  //   return this.http.post(`${environment.awsURL}/getproject`, formData);
  // }

  getFiles() {
    return this.http.get(`${environment.awsURL}/listobjects`);
  }

  getStorageUsed() {
    return this.http.get(`${environment.awsURL}/storagesize`);
  }

  downloadFile(path: string, file_name: string) {
    const formData = new FormData();
    formData.append('path', path);
    formData.append('filename', file_name);

    return this.http.post(`${environment.awsURL}/download`, formData);
  }

  uploadFile(file: File, path: string) {
    const formData = new FormData();
    formData.append('path', path);
    formData.append('file[]', file);
    return this.http.post(`${environment.awsURL}/upload`, formData);
  }

  uploadFolder(folderName: string, path: string) {
    const formData = new FormData();
    formData.append('path', path);
    formData.append('folder_name', folderName);
    return this.http.post(`${environment.awsURL}/createfolder`, formData);
  }
}
