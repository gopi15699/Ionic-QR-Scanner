import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  data: any;
  constructor(private barcodeScanner: BarcodeScanner,) {}
  scan() {
    this.data = null;
    this.barcodeScanner.scan().then(barcodeData => {
    console.log('Barcode data', barcodeData);
    alert(barcodeData.text);
    alert("barcodedata = "+barcodeData.text);
    alert(barcodeData.format);
    alert(barcodeData.cancelled);
    this.data = barcodeData;
    alert(this.data);

    }).catch(err => {
    console.log('Error', err);
    alert(err)
    });
    }
}
