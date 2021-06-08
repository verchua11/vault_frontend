import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VaultComponent } from './vault.component';

const routes: Routes = [
  {
    path: '',
    component: VaultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VaultRoutingModule {}
