import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';

import { ToolsAddDialog, ToolsComponent } from './tools.component';
import { ToolsRoutes } from './tools.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ ToolsDeleteDialog, ToolsDialog, ToolsRenderComponent} from './toolsbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(ToolsRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule
    ],
    declarations: [
        ToolsComponent,
        ToolsRenderComponent,
        ToolsDialog,
        ToolsAddDialog,
        ToolsDeleteDialog
    ]
})

export class ToolsModule {}
