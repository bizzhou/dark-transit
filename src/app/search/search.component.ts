import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bus } from '../bus.model';
import { Stop } from '../stops.model';
import { Activity } from '../activity.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  busInfo = new Bus();
  fromStops: Stop[];
  backStops: Stop[];
  busDictionary = {};
  expandFrom: boolean;
  expandBack: boolean;
  searchFlag: boolean;
  busId: string;
  busFullId: string;

  constructor(private http: HttpClient) {
  }

  refresh() {
    this.busDictionary = {};
    this.getStopInfo();
  }

  getDetails(index): void {
    // check if the click has happened, expand if has.
    if (index == 0) {
      this.expandFrom = this.expandFrom ? false : true;
    } else {
      this.expandBack = this.expandBack ? false : true;
    }
  }

  getStopInfo(): void {
    this.http.get(`http://localhost:3000/get_stops/${this.busFullId}`).toPromise()
      .then(res => {
        // get birectional stops
        this.fromStops = res[0]['stops'] as Stop[];
        this.backStops = res[1]['stops'] as Stop[];
        this.getBusActivity();
      })
      .catch(err => {
        alert('error featch stops information')
      });
  }

  getRoute(): Promise<Object> {
    return this.http.get(`http://localhost:3000/get_route/${this.busId}`).toPromise();
  }

  getBusActivity():void {
    this.http.get(`http://localhost:3000/get_vehicle_info/${this.busFullId}`).toPromise()
      .then(res => {

        // get stop name, stop information, directions
        for (let element of res['VehicleActivity']) {

          let activity = new Activity();
          activity.curStop = element['MonitoredVehicleJourney']['MonitoredCall']['StopPointName'];
          activity.directionName = element['MonitoredVehicleJourney']['DestinationName'];
          activity.directionRef = element['MonitoredVehicleJourney']['DirectionRef'];
          activity.stopDesc = element['MonitoredVehicleJourney']['MonitoredCall']['Extensions']['Distances']['PresentableDistance'];
          activity.stopPointName = element['MonitoredVehicleJourney']['MonitoredCall']['StopPointName'];
          activity.stopPointRef = element['MonitoredVehicleJourney']['MonitoredCall']['StopPointRef'];
          this.busDictionary[activity.stopPointRef] = activity;
        }
      })
      .catch(err => {
        console.log(err);
        alert('error fetching activity');
      });

  }

  ngOnInit() {
    this.busId = 'Q17';
  }

  async searchRoute() {
    let result = await this.getRoute().then(res => {
      const data = res['searchResults']['matches'][0];
      this.busInfo.directions = data['directions'];
      this.busInfo.longName = data['longName'];
      this.busInfo.shortName = data['shortName'];
      this.busInfo.id = data['id'];

      console.log(this.busInfo)
    }).catch(err => {
      alert('error fetching route');;
    });

    this.busFullId = this.busInfo.id;
    console.log(this.busFullId);

    this.getStopInfo();
    this.getBusActivity();
    this.searchFlag = true;
  }

}
