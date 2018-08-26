import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchComponent } from './search/search.component';
import { StopComponent } from './stop/stop.component';

const router: Routes = [
    // { path: '', component: HomeComponent},
    { path: '', component: SearchComponent },
    { path: 'stop/:stopId', component: StopComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(router)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}