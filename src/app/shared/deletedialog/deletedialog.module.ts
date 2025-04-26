import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeletedialogComponent } from './deletedialog.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/app.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    DeletedialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  exports: [DeletedialogComponent]
  
})
export class DeletedialogModule { }
