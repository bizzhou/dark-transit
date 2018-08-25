import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchComponent } from './search/search.component';

const router: Routes = [
    // { path: '', component: HomeComponent},
    { path: '', component: SearchComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(router)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}