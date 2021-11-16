import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) { }
  uploadFile(formData) {
    return this.http.post('https://example.com/upload.php', formData);
  }
}
