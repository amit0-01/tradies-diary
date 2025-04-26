import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ProjectCounterDialog, SettingsVariationsComponent } from './settingsvariations.component';
import { SettingsVariationsRoutes } from './settingsvariations.routing';
import { QuillModule } from 'ngx-quill'
import { TagInputModule } from 'ngx-chips';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SettingsVariationsRoutes),
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
    ],
    declarations: [SettingsVariationsComponent, ProjectCounterDialog],
})

export class SettingsVariationsModule {}
