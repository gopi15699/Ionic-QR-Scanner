import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { BookingDetailsVO } from 'src/app/Modal/BookingVO/BookingDetailsVO';
import { FileattachmentVO } from 'src/app/Modal/FileattachmentVO';
import { MasterVO } from 'src/app/Modal/MasterVO';
import { BookingRequestVO } from 'src/app/Modal/Request/RequestVO';
import { BookingRequestService } from 'src/app/services/BookingRequestService';
import { BookingService } from 'src/app/services/Bookingservice/BookingServive';
import { LoginHelper } from 'src/app/services/Login Credential/LoginHelper';
import { MasterHelper } from 'src/app/services/Master/MasterHelper';
import { SafeResourceUrl,DomSanitizer } from '@angular/platform-browser';
import{Plugins, CameraResultType, CameraSource} from "@capacitor/core";
import { Camera, CameraOptions, PictureSourceType} from '@ionic-native/camera/ngx';
import {File, IWriteOptions, FileEntry} from '@ionic-native/file/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { FilePath } from '@ionic-native/file-path/ngx';
 import { finalize } from 'rxjs/operators';


const STORAGE_KEY = 'my_images';
@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.page.html',
  styleUrls: ['./attachment.page.scss'],
})
export class AttachmentPage implements OnInit {
  fileattachmentVO: FileattachmentVO;
  form: FormGroup;
  attachmenttyelist: any;
  requestdetailVo: BookingRequestVO;
  requestdetailVocopy: any;
  photo:SafeResourceUrl;
  fileattachmentVOs: FileattachmentVO[] = new Array();
  images = [];
  data: any;
  options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  };
  constructor(private fb: FormBuilder,private logindata: LoginHelper, private bookingService: BookingService,
    private master: MasterVO, private masterhelper: MasterHelper,private router: Router,
     public modalController: ModalController, private bookingrequestservice : BookingRequestService,
     private sanitizer: DomSanitizer, private file: File,private camera: Camera,private http: HttpClient, private webview: WebView,
    private actionSheetController: ActionSheetController, private toastController: ToastController,
     private storage: Storage, private plt: Platform, private loadingController: LoadingController,
     private ref: ChangeDetectorRef, private filePath: FilePath ) {
    this.fileattachmentVO = new FileattachmentVO();
    this.requestdetailVo = new BookingRequestVO();
    // this.attachment = new TenantcodeVO()
    this.attachmenttyelist = this.master.ATTACHEMENT_TYPE;
    this.requestdetailVocopy =  this.bookingrequestservice.requestdetailsvo;
    if(this.requestdetailVocopy !== (null && undefined)){
      this.requestdetailVo = this.requestdetailVocopy;
    }
    this.attachForm();
  }

  async ngOnInit() {
    await this.storage.create();
    this.plt.ready().then(() => {
      this.loadStoredImages();
    });
  }

  attachForm() {
    this.form = this.fb.group({

        attachment: null
    });
}

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

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.dataDirectory + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
        message: text,
        position: 'bottom',
        duration: 3000
    });
    toast.present();
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
        header: "Select Image source",
        buttons: [{
                text: 'Load from Library',
                handler: () => {
                    this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                }
            },
            {
                text: 'Use Camera',
                handler: () => {
                    this.takePicture(this.camera.PictureSourceType.CAMERA);
                }
            },
            {
                text: 'Cancel',
                role: 'cancel'
            }
        ]
    });
    await actionSheet.present();
}

takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
        quality: 100,
        sourceType: sourceType,
        saveToPhotoAlbum: false,
        correctOrientation: true
    };

    this.camera.getPicture(options).then(imagePath => {
        if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
            this.filePath.resolveNativePath(imagePath)
                .then(filePath => {
                    let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                    let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                    this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
                });
        } else {
            var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
            var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        }
    });

}
createFileName() {
  var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
  return newFileName;
}

copyFileToLocalDir(namePath, currentName, newFileName) {
  this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
  }, error => {
      this.presentToast('Error while storing file.');
  });
}

updateStoredImages(name) {
  this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
          let newImages = [name];
          this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
          arr.push(name);
          this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
          name: name,
          path: resPath,
          filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle
  });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
        let arr = JSON.parse(images);
        let filtered = arr.filter(name => name != imgEntry.name);
        this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

        var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

        this.file.removeFile(correctPath, imgEntry.name).then(res => {
            this.presentToast('File removed.');
        });
    });
}

startUpload(imgEntry) {

  alert(imgEntry.filePath);
  this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
      .then(entry => {
          ( < FileEntry > entry).file(file => this.readFile(file))
      })
      .catch(err => {
          this.presentToast('Error while reading file.');
          alert(err);
      });
}

readFile(file: any) {
  alert(file.name)
  alert(file.type)
  const reader = new FileReader();
  // reader.readAsDataURL(file);
    reader.onload = () => {
        const formData = new FormData();
        const imgBlob = new Blob([reader.result], {
            type: file.type
        });
        formData.append('file', imgBlob, file.name);
        // alert(formData);
        this.uploadImageData(formData);
     this.data = formData.getAll("file");
   //  reader.onload = () => {
  //    console.log('this.form', this.form)
  //    this.form.get('attachment').setValue({

  //        filename: file.name,
  //        filetype: file.type,
  //        attachFile: (reader.result as string).split(',')[1]
  //    })
  //   // this.yourImageDataURL = dataReader.result;


   };
   reader.readAsArrayBuffer(file);
   alert(this.data);
   alert(reader.result)
  // alert( this.form.value.attachFile);
  alert((reader.result as string).split(',')[1]);
}

async uploadImageData(formData: FormData) {
  const loading = await this.loadingController.create({
      message: 'Uploading image...',
  });
  await loading.present();

  this.http.post('http://164.52.205.129:8080/esqc/rs/createFileattachment', formData)
      .pipe(
          finalize(() => {
              loading.dismiss();
          })
      )
      .subscribe(res => {
          if (res['success']) {
              this.presentToast('File upload complete.')
          } else {
              this.presentToast('File upload failed.')
          }
      });
}



onClose(){
  this.modalController.dismiss();
}



attach() {
  const formModel = this.form.value;
   this.fileattachmentVO.filename = formModel.attachment.filename;
   this.fileattachmentVO.filetype = formModel.attachment.filetype;
   this.fileattachmentVO.attachFile = formModel.attachment.attachFile;
   this.fileattachmentVO.tenantid = this.logindata.home.tenantid;
   this.fileattachmentVO.officeId = this.logindata.home.officeId;
   this.fileattachmentVO.attachementtype=this.fileattachmentVO.attachementtype
//        fileattachmentVO.isSave=true;
  // if (this.emailbookingvo && this.emailbookingvo.id) {
    this.fileattachmentVO.productid = this.requestdetailVo.id;
     //  }
     this.fileattachmentVO.bookingtype = "FB";
     this.fileattachmentVO.producttype="BK_REQ";
   if (this.fileattachmentVO.attachFile != undefined && this.fileattachmentVO.attachementtype) {
       if(this.fileattachmentVO.productid){
           this.bookingService.createFileattachment(this.fileattachmentVO).subscribe((res: FileattachmentVO) => {
                       res;
                       console.log(res);
                       this.fileattachmentVO = res;
                       this.modalController.dismiss(this.fileattachmentVO);
        })
       }else{
       alert("Once Booking Request Saved Then Create Attachment. ")
       }


   } else {
       alert("Attachment Type is Required")
   }
}
}
