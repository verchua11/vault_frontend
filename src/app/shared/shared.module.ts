import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JcvaInputComponent } from './components/jcva-input/jcva-input.component';

import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@NgModule({
  declarations: [JcvaInputComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [
    ReactiveFormsModule,
    FormsModule,
    JcvaInputComponent,
    NzDropDownModule,
    NzIconModule,
    NzCardModule,
    NzMenuModule,
  ],
})
export class SharedModule {}
