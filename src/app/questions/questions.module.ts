import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { QuestionsAddDialog, QuestionsComponent } from './questions.component';
import { QuestionsRoutes } from './questions.routing';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ QuestionsDeleteDialog, QuestionsDialog, QuestionsRenderComponent} from './questionsbutton-render.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(QuestionsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        Ng2SmartTableModule
    ],
    declarations: [
        QuestionsComponent,
        QuestionsRenderComponent,
        QuestionsDialog,
        QuestionsAddDialog,
        QuestionsDeleteDialog
    ]
})

export class QuestionsModule {}
