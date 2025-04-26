import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRfiRoutingModule } from './settings-rfi-routing.module';
import { RfiSettingComponent } from './rfi-setting/rfi-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
import { QuillModule } from 'ngx-quill';
import { MaterialModule } from '../app.module';


@NgModule({
  declarations: [
    RfiSettingComponent
  ],
  imports: [
    CommonModule,
    SettingsRfiRoutingModule,
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
export class SettingsRfiModule { }
