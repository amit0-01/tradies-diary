import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { StagesAddDialog, CostcentresAddDialog, CategoriesAddDialog, SuppliersAddDialog, ProductsAddDialog, ProductsComponent } from './products.component';
import { ProductsRoutes } from './products.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ StagesAddDialogEdit, CostcentresAddDialogEdit, CategoriesAddDialogEdit, SuppliersAddDialogEdit, ProductsDeleteDialog, ProductsDialog, ProductsRenderComponent} from './productsbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ProductsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule,
        NgxMatSelectSearchModule,
    ],
    declarations: [
        ProductsComponent,
        ProductsRenderComponent,
        ProductsDialog,
        ProductsAddDialog,
        ProductsDeleteDialog,
        SuppliersAddDialog,
        CategoriesAddDialog,
        CostcentresAddDialog,
        StagesAddDialog,
        StagesAddDialogEdit,
        CostcentresAddDialogEdit,
        CategoriesAddDialogEdit,
        SuppliersAddDialogEdit
    ]
})

export class ProductsModule {}
