import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsselectionsRoutingModule } from './settingsselections-routing.module';
import { SelectionSettingComponent } from './selection-setting/selection-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { QuillModule } from 'ngx-quill';
import { MaterialModule } from '../app.module';


@NgModule({
  declarations: [
    SelectionSettingComponent
  ],
  imports: [
    CommonModule,
    SettingsselectionsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TagInputModule,
    QuillModule.forRoot({
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }], 
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['clean'],  
                ]
            }
        })
  ]
})
export class SettingsselectionsModule { }
