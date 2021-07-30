import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VaultService {
  constructor(private http: HttpClient) {}

  getFiles() {
    return this.http.get(`${environment.awsURL}/listobjects`);
  }

  getDeletedFiles() {
    return this.http.get(`${environment.awsURL}/deleted`);
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

  uploadFile(files: Array<any>, path: string) {
    const formData = new FormData();
    formData.append('path', path);

    files.forEach((file) => {
      formData.append('file[]', file);
    });

    return this.http.post(`${environment.awsURL}/upload`, formData);
  }
  
  //fetch the user's recently viewed folder
  getUserViewed() {
    return this.http.get(`${environment.awsURL}/viewed`);
  }

  //update the user's recently viewed folder
  updateUserViewed(directory: any) {
    const formData = new FormData();
    formData.append('key', directory);
    return this.http.post(`${environment.awsURL}/viewed`, formData);
  }

  getUserStarred() {
    return this.http.get(`${environment.awsURL}/starred`);
  }

  uploadFolder(folderName: string, path: string) {
    const formData = new FormData();
    formData.append('path', path);
    formData.append('folder_name', folderName);
    return this.http.post(`${environment.awsURL}/createfolder`, formData);
  }

  download(url: string): Observable<Blob> {
    return this.http.get(url, {
      responseType: 'blob',
    });
  }

  deleteFile(parent: string, name: string) {
    console.log(parent);
    const formData = new FormData();
    formData.append('parent', parent);
    formData.append('object', name);
    return this.http.post(`${environment.awsURL}/trashed`, formData);
  }

  unDeleteFile(parent: string, name: string) {
    const formData = new FormData();
    formData.append('parent', parent);
    formData.append('object', name);
    return this.http.post(`${environment.awsURL}/untrashed`, formData);
  }

  viewDeletedFile() {
    return this.http.get(`${environment.awsURL}/trashed`);
  }

  deleteForever(key: any) {
    const formData = new FormData();
    formData.append('key', key);
    return this.http.post(`${environment.awsURL}/deleteforever`, formData);
  }

  toggleStarStatus(parent: string, name: string, action: string) {
    const formData = new FormData();
    formData.append('parent', parent);
    formData.append('object', name);
    formData.append('action', action);
    return this.http.post(`${environment.awsURL}/starred`, formData);
  }
}