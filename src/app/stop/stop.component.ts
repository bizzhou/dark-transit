import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Details } from '../stopdetail.model';

@Component({
  selector: 'app-stop',
  templateUrl: './stop.component.html',
  styleUrls: ['./stop.component.css']
})
export class StopComponent implements OnInit {
  stopId: string;
  stopName: string;
  stopDetails = new Map<string, Details[]>();

  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient) {
  }

  getKeys(map) {
    return Array.from(map.keys());
  }

  timeDifference(start: Date, end: Date) {
    let time = (start.getTime() - end.getTime()) / 60000;
    return Math.round(time);
  }

  notifyMe(key: string) {
    let minutes = prompt('How advanced do you want to be notified?');

    if (minutes !== null) {
      console.log(parseInt(minutes));
      if (isNaN(parseInt(minutes))) {
        alert('please enter an numeric value');
      } else {
        this.http.get(`http://localhost:3000/get_notify/${this.stopId}/${key}/${minutes}`).toPromise()
          .then(res => {
            alert('Done, please wait for the notification');
          }).catch(err => {
            console.log(err);
            alert('No bus find in given time');
          });;
      }
    }

  }

  ngOnInit() {
    this.stopId = this.activatedRoute.snapshot.paramMap.get('stopId');

    this.http.get(`http://localhost:3000/get_stop_monitoring/${this.stopId}`).toPromise()
      .then(res => {
        let MonitoredStops = res[0]['MonitoredStopVisit'];

        this.stopName = MonitoredStops[0]['MonitoredVehicleJourney']['MonitoredCall']['StopPointName'];

        MonitoredStops.forEach(element => {

          let detail = new Details();
          detail.publishName = element['MonitoredVehicleJourney']['PublishedLineName'];
          detail.destinationName = element['MonitoredVehicleJourney']['DestinationName'];
          let difference = this.timeDifference(new Date(element['MonitoredVehicleJourney']['MonitoredCall']['ExpectedArrivalTime']), new Date());
          // check if the time is unknown or x minutes;
          detail.timeDiff = isNaN(difference) ? 'Unknown time' : difference.toLocaleString() + ' minutes';
          detail.distance = element['MonitoredVehicleJourney']['MonitoredCall']['Extensions']['Distances']['PresentableDistance'];

          if (this.stopDetails.has(detail.publishName)) {
            this.stopDetails.get(detail.publishName).push(detail);
          } else {
            this.stopDetails.set(detail.publishName, []);
            this.stopDetails.get(detail.publishName).push(detail);
          }
        });

        console.log('stop detail ', this.stopDetails);

      })
      .catch(err => {
        console.log(err);
        alert('failed to fetch stop information');
      })
  }


  addToFavorite(): void {
    console.log('adding to favorite');
    if (localStorage.getItem('favorites') === null) {
      let favStops = {};
      favStops[this.stopId] = this.stopName;
      console.log(favStops);
      console.log(JSON.stringify(favStops.toString()));

      localStorage.setItem('favorites', JSON.stringify(favStops));
    } else {
      let data = JSON.parse(localStorage.getItem('favorites'));
      if (data[this.stopId] !== undefined) {
        console.log('here');
        delete data[this.stopId];
      } else {
        data[this.stopId] = this.stopName;
      }

      localStorage.setItem('favorites', JSON.stringify(data));
    }
  }

  checkFavorite(): boolean {
    if (localStorage.getItem('favorites') !== null) {
      let data = JSON.parse(localStorage.getItem('favorites'));
      return data[this.stopId] === undefined;
    } else {
      return true;
    }
  }

}
