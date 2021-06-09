import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VaultService {
  constructor(private http: HttpClient) {}

  getFolders(ids: Array<string>, project_name: string) {
    const formData = new FormData();
    formData.append('id', ids[ids.length - 1]);
    formData.append('project_name', project_name);
    // ids.forEach((id) => {
    //   formData.append('id[]', id);
    // });

    return this.http.post(`${environment.awsURL}/getproject`, formData);
  }
}
