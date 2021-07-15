import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'my-vault',
        pathMatch: 'full',
      },
      {
        path: 'my-vault',
        loadChildren: () =>
          import('./vault/vault.module').then((m) => m.VaultModule),
      },
      {
        path: 'recent',
        loadChildren: () =>
          import('./recent/recent.module').then((m) => m.RecentModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
