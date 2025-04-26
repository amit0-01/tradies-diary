import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import {TradeCategoriesAddDialog,TradeCategoriesComponent } from './tradecategories.component';
import {TradeCategoriesRoutes } from './tradecategories.routing';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import{TradeCategoriesDeleteDialog,TradeCategoriesDialog,TradeCategoriesRenderComponent} from './tradecategoriesbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(TradeCategoriesRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        TradeCategoriesComponent,
        TradeCategoriesRenderComponent,
        TradeCategoriesDialog,
        TradeCategoriesAddDialog,
        TradeCategoriesDeleteDialog
    ]
})

export class TradeCategoriesModule {}
