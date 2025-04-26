import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { CategoriesAddDialog, CategoriesComponent } from './categories.component';
import { CategoriesRoutes } from './categories.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ CategoriesDeleteDialog, CategoriesDialog, CategoriesRenderComponent} from './categoriesbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(CategoriesRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        CategoriesComponent,
        CategoriesRenderComponent,
        CategoriesDialog,
        CategoriesAddDialog,
        CategoriesDeleteDialog
    ]
})

export class CategoriesModule {}
