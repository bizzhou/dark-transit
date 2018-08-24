import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bus } from './bus.model';
import { Stop } from './stops.model';
import { Activity } from './activity.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  busInfo = new Bus();
  fromStops : Stop[];
  backStops : Stop[];
  busDictionary = {};
  expandFrom: boolean;
  expandBack: boolean;

  constructor(private http: HttpClient) {
  }


  refresh() {
    this.getStopInfo();
  }

  getDetails(index) {
    console.log(index);
    if (index == 0) {
      
      this.expandFrom = this.expandFrom ? false : true;
      console.log(this.fromStops);
    } else {
      this.expandBack = this.expandBack ? false : true;
      console.log(this.backStops);
    }
  }

  checkStopInfo(stop: Stop) {
    console.log(stop);
    return false;
  }

  getStopInfo() {
    this.http.get('http://localhost:3000/get_stops/Q31').toPromise()
      .then(res => {
          this.fromStops = res[0]['stops'] as Stop[];
          this.backStops = res[1]['stops'] as Stop[];
          this.getBusActivity();
      })
      .catch(err => {
        alert('error featch stops information')
    });
  }

  getRoute() {
    this.http.get('http://localhost:3000/get_route/Q31').toPromise()
      .then(res => {
        const data = res['searchResults']['matches'][0];
        this.busInfo.directions = data['directions'] ;
        this.busInfo.longName = data['longName'] ;
        this.busInfo.shortName = data['shortName'] ;
        this.busInfo.id = data['id'] ;

        console.log(this.busInfo);
      }).catch(err => {
        alert('error fetching route');
    })
  }

  buildDescription(arr: Stop[]) {
    arr.forEach(stop => {
      if (this.busDictionary[stop.id] !== undefined) {
        stop.stopDescription = stop.name + '  ---' + this.busDictionary[stop.id]['stopDesc'];
      } else {
        stop.stopDescription = stop.name;
      }
    });
  } 


  getBusActivity() {
    this.http.get('http://localhost:3000/get_vehicle_info/Q31').toPromise()
      .then(res => {

        // this.busActivities = [];

        // get stop name, stop information, directions
        for (let element of res['VehicleActivity']) {
          
          let activity = new Activity();
          activity.curStop = element['MonitoredVehicleJourney']['MonitoredCall']['StopPointName'];
          activity.directionName = element['MonitoredVehicleJourney']['DestinationName'];
          activity.directionRef = element['MonitoredVehicleJourney']['DirectionRef'];
          activity.stopDesc = element['MonitoredVehicleJourney']['MonitoredCall']['Extensions']['Distances']['PresentableDistance'];
          activity.stopPointName = element['MonitoredVehicleJourney']['MonitoredCall']['StopPointName'];
          activity.stopPointRef = element['MonitoredVehicleJourney']['MonitoredCall']['StopPointRef'];
          // this.busActivities.push(activity);
          this.busDictionary[activity.stopPointRef] = activity;
        }

        this.buildDescription(this.fromStops);
        this.buildDescription(this.backStops);

      })
      .catch(err => {
        console.log(err);
        alert('error fetching activity');
      });

  }

  ngOnInit() {
    
      this.getRoute();
      this.getStopInfo();


      
  }


  writeDesc(): any {
    


  }

  


  


}
