import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JcvaInputComponent } from './components/jcva-input/jcva-input.component';

import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMessageModule } from 'ng-zorro-antd/message';

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
    NzAlertModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzToolTipModule,
    NzModalModule,
    NzRadioModule,
    NzInputModule,
    NzUploadModule,
    NzSpinModule,
    NzEmptyModule,
    NzMessageModule,
  ],
})
export class SharedModule {}
