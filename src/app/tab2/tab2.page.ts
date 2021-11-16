import { Component } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { MapVO } from '../Modal/mapVO';
declare var google: any;
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  map: any;
  lat;
  long;
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  infoWindows: any = [];
  mapvo:MapVO
  markers = new Array();
  constructor(private geolocation: Geolocation) {
    this.mapvo = new MapVO();
  }
  ionViewDidEnter() {
    this.showMap();
  }
  showMap() {
    const location = new google.maps.LatLng(13.0386776, 80.2460444);
    const options = {
      center: location,
      zoom: 15,
      disableDefaultUI: true
    }
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);
    this.addMarkersToMap(this.markers);
  }

  addMarkersToMap(markers) {
    for (let marker of markers) {
      let position = new google.maps.LatLng(marker.latitude, marker.longitude);
      let mapMarker = new google.maps.Marker({
        position: position,
        // title: marker.title,
        latitude: marker.latitude,
        longitude: marker.longitude
      });

      mapMarker.setMap(this.map);
      this.addInfoWindowToMarker(mapMarker);
    }
  }

  addInfoWindowToMarker(marker) {
    let infoWindowContent = '<div id="content">' +
                              '<p>Latitude: ' + marker.latitude + '</p>' +
                              '<p>Longitude: ' + marker.longitude + '</p>' +
                              '<ion-button id="navigate">Navigate</ion-button>'
                            '</div>';

    let infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    marker.addListener('click', () => {
      this.closeAllInfoWindows();
      infoWindow.open(this.map, marker);
      google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        document.getElementById('navigate').addEventListener('click', () => {
          console.log('navigate button clicked!');
          // code to navigate using google maps app
          window.open('https://www.google.com/maps/dir/?api=1&destination=' + marker.latitude + ',' + marker.longitude);
        });
      });
    });

    this.infoWindows.push(infoWindow);
  }

  closeAllInfoWindows() {
    for(let window of this.infoWindows) {
      window.close();
    }
  }

  mapme(){
    this.geolocation.getCurrentPosition({
      timeout:10000,
      enableHighAccuracy:true
    }).then((resp) => {
     this.mapvo.latitude = resp.coords.latitude;
     this.mapvo.longitude = resp.coords.longitude;
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  gomap(){
    if(this.mapvo.latitude!=null && this.mapvo.longitude!= undefined){
    this.markers.push(this.mapvo);
    console.log("markers",this.markers);
    this.addMarkersToMap(this.markers);
    }
  }
}
