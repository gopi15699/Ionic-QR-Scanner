import { Component } from '@angular/core';
import { SafeResourceUrl,DomSanitizer } from '@angular/platform-browser';
import{Camera, Plugins, CameraResultType, CameraSource} from "@capacitor/core";
import {  CameraOptions} from '@ionic-native/camera/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { UploadService } from '../services/uploadservice';
import { FormBuilder, FormGroup } from '@angular/forms';
// const { Camera } = Plugins;
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  isok:boolean = false;
  myimg
  lat;
  long;
  photo:SafeResourceUrl
  form: FormGroup;
  private file: File;
  filename: any;
  filetype: any;
  attachFile: any;
  // options: CameraOptions = {
  //   quality: 100,
  //   destinationType: this.camera.DestinationType.FILE_URI,
  //   encodingType: this.camera.EncodingType.JPEG,
  //   mediaType: this.camera.MediaType.PICTURE
  // };
  constructor(private sanitizer: DomSanitizer, private geolocation: Geolocation,
    private uploadService: UploadService,private fb: FormBuilder ) {
      this.attachForm();
    }



    attachForm() {
      this.form = this.fb.group({

          attachment: null
      });
  }


  async takepic(){
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing:false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });
    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
    console.log("this.photo",this.photo)
    alert(this.photo);
    alert(image);
    alert(image.dataUrl);
    alert(image.base64String);
    alert(image.format)
    alert(image.path);
    alert(image.exif);
    alert(image.webPath);


  }
  async takepic1() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Base64
    });
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = image.webPath;
    // Can be set to the src of an image now
    // imageElement.src = imageUrl;
    alert(image.dataUrl);
    alert(image.base64String);
    alert(image.format)
    alert(image.path);
    alert(image.exif);
    alert(image.webPath);
  }

  readFile(file: any) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });
      const formData = new FormData();
      formData.append('name', 'Hello');
      formData.append('file', imgBlob, file.name);
      alert(imgBlob);
      alert(file.name);
      alert(file.type);
      alert([reader.result]);
      alert((reader.result as string).split(',')[1]);
      alert(formData);
      this.uploadService.uploadFile(formData).subscribe(dataRes => {
        console.log(dataRes);
        alert(dataRes);
      });
    };

  }


  onFileChange(fileChangeEvent) {
    this.file = fileChangeEvent.target.files[0];
    const reader = new FileReader();
    alert(this.file.name)
    alert(this.file.type)

    reader.readAsDataURL(this.file);


    reader.onload = () => { // note using fat arrow function here if we intend to point at current Class context.
      console.log('this.form', this.form)
        this.form.get('attachment').setValue({

           filename: this.file.name,
          filetype: this.file.type,
        attachFile: (reader.result as string).split(',')[1]
      })
      // this.yourImageDataURL = dataReader.result;
       this.filename = this.file.name,
       this.filetype = this.file.type,
       this.attachFile =  (reader.result as string).split(',')[1]
    };

    reader.onerror = (error) => {

      //handle errors
      console.log('error', error);
      alert(error);

    };
  }

  //  previewFile(event) {
  //   const preview = document.querySelector('img');
  //   const file = event.target.files[0];
  //   const reader = new FileReader();

  //   reader.addEventListener("load", function () {
  //     // convert image file to base64 string
  //     // preview.src = reader.result;
  //     console.log('this.form', this.form);
  //     this.form.get('attachment').setValue({

  //       filename: file.name,
  //       filetype: file.type,
  //       attachFile: (reader.result as string).split(',')[1]
  //   })
  //   }, false);

  //   if (file) {
  //     reader.readAsDataURL(file);
  //   }
  // }
  loadImageFromDevice1(event) {

    const file = event.target.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => { // note using fat arrow function here if we intend to point at current Class context.
      console.log('this.form', this.form)
      this.form.get('attachment').setValue({

          filename: file.name,
          filetype: file.type,
          attachFile: (reader.result as string).split(',')[1]
      })
      // this.yourImageDataURL = dataReader.result;

    };

    reader.onerror = (error) => {

      //handle errors
      console.log('error', error);
      alert(error);

    };
  };

  attach() {
    // alert(this.form.value)

    alert(this.filename );
    alert(this.attachFile);
    const formModel = this.form.value;
    alert(formModel.attachment.filename);
    alert(formModel.attachment.attachFile);
  }
  // takePicture() {
  //   this.camera.getPicture(this.options).then((imageData) => {
  //     this.file.resolveLocalFilesystemUrl(imageData).then((entry: FileEntry) => {
  //       entry.file(file => {
  //         alert(file);
  //         console.log(file);
  //         this.readFile(file);
  //       });
  //     });
  //   }, (err) => {
  //     // Handle error
  //   });
  // }


  mapme(){
    this.geolocation.getCurrentPosition({
      timeout:10000,
      enableHighAccuracy:true
    }).then((resp) => {
     this.lat = resp.coords.latitude;
     this.long = resp.coords.longitude;
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }
}
