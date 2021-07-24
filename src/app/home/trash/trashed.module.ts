import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrashedRoutingModule } from './trashed-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { TrashedComponent } from './trashed.component';

@NgModule({
  declarations: [TrashedComponent],
  imports: [CommonModule, TrashedRoutingModule, SharedModule],
})
export class TrashedModule {}
