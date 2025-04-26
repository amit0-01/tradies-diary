import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../app.module';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { TradesComponent } from './trades.component';
import { ChangeTimeDialog, TradesCreateComponent, CostcentresAddDialog } from './tradescreate/tradescreate.component';
import { ChangeTimeDialogEdit, TradesEditComponent, CostcentresAddDialogEdit } from './tradesedit/tradesedit.component';
import { TradesRoutes } from './trades.routing';
//  import { Ng2SmartTableModule } from 'ng2-smart-table';
import{ TradesDeleteDialog, TradesRenderComponent} from './tradesbutton-render.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(TradesRoutes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        // Ng2SmartTableModule,
        NgxCsvParserModule,
        NgxMaterialTimepickerModule,
        TimepickerModule.forRoot(),
    ],
    declarations: [
        TradesComponent,
        TradesRenderComponent,
        // TradesDialog,
        TradesDeleteDialog,
        CostcentresAddDialog,
        CostcentresAddDialogEdit,
        TradesCreateComponent,
        TradesEditComponent,
        ChangeTimeDialog,
        ChangeTimeDialogEdit
    ]
})

export class TradesModule {}
