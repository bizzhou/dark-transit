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
  stopDetails = new Map<string, Details[]>();

  constructor(private activatedRoute: ActivatedRoute, private http: HttpClient) {
  }

  getKeys(map) {
    return Array.from(map.keys());
  }

  timeDifference(start: Date, end: Date) {
    let time =  (start.getTime() - end.getTime()) / 60000;
    return Math.round(time);
  }

  ngOnInit() {
    this.stopId = this.activatedRoute.snapshot.paramMap.get('stopId');
    this.http.get(`http://localhost:3000/get_stop_monitoring/${this.stopId}`).toPromise()
      .then(res => {
        let MonitoredStops = res[0]['MonitoredStopVisit'];

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

        console.log(this.stopDetails);

      })
      .catch(err => {
        console.log(err);
        alert('failed to fetch stop information');
      })
  }

}
