import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bus } from './bus.model';
import { Stop } from './stops.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  busInfo = new Bus();
  fromStops : Stop[];
  backStops : Stop[];
  expandFrom: boolean;
  expandBack: boolean;

  constructor(private http: HttpClient) {
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

  ngOnInit() {
    this.http.get('http://localhost:3000/get_route/Q31').toPromise()
      .then(res => {
        const data = res['searchResults']['matches'][0];
        this.busInfo.directions = data['directions'] ;
        this.busInfo.longName = data['longName'] ;
        this.busInfo.shortName = data['shortName'] ;
        this.busInfo.id = data['id'] ;

        console.log(this.busInfo);
      });



    this.http.get('http://localhost:3000/get_stops/Q31').toPromise()
      .then(res => {
          this.fromStops = res[0] as Stop[];
          this.backStops = res[1] as Stop[];
      })
      .catch(err => {

      });

      this.http.get('http://localhost:3000/get_vehicle_info/Q31').toPromise()
      .then(res => {
        
      })
      .catch(err => {

      });

  }


}
