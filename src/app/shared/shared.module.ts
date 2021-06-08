import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { JcvaInputComponent } from './components/jcva-input/jcva-input.component';

@NgModule({
  declarations: [JcvaInputComponent],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  exports: [ReactiveFormsModule, FormsModule, JcvaInputComponent],
})
export class SharedModule {}
