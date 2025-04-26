import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { SettingsAdminComponent } from './settingsadmin.component';
import { SettingsAdminRoutes } from './settingsadmin.routing';
import { QuillModule } from 'ngx-quill'
import { ColorSketchModule } from 'ngx-color/sketch';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SettingsAdminRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        ColorSketchModule,
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
    ],
    declarations: [SettingsAdminComponent],
})

export class SettingsAdminModule {}
