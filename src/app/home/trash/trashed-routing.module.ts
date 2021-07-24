import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrashedComponent } from './trashed.component';

const routes: Routes = [{ path: '', component: TrashedComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrashedRoutingModule {}
