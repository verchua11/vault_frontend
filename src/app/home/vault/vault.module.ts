import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VaultRoutingModule } from './vault-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { VaultComponent } from './vault.component';

@NgModule({
  declarations: [VaultComponent],
  imports: [CommonModule, VaultRoutingModule, SharedModule],
})
export class VaultModule {}
