import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StarredComponent } from './starred.component';

const routes: Routes = [{ path: '', component: StarredComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StarredRoutingModule {}
