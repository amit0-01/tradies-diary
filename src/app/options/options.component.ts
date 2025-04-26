import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Inject} from '@angular/core';
import { DatasourceService} from '../services/datasource.service';
import { LocalDataSource } from 'ng2-smart-table';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import * as ExcelJS from "exceljs/dist/exceljs.min.js"
import * as fs from 'file-saver'
// import {LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import swal from 'sweetalert2';
import { RoleChecker } from '../services/role-checker.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

declare const $: any;


@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class OptionsComponent implements OnInit {

    settingsForm: FormGroup;
    settingsData;

    constructor(
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        private rolechecker: RoleChecker,
        public datepipe: DatePipe,
        ) { }

    public ngOnInit() {
        this.settingsForm = this.formBuilder.group({
          globalListEmployee: [''],
        }, {
        });

        this.getDiaryOptions();
    }

    public getDiaryOptions(){
        // this.spinnerService.show();

        this.data_api.getDiaryOptions().subscribe((data) => {
    
            if(data){

              this.settingsData = data;
              this.settingsData = this.settingsData.reduce((acc,cur)=>Object.assign(acc,{[cur.option_name]:cur.option_value}),{});
  
              console.log(this.settingsData);

              this.settingsForm.patchValue({
                globalListEmployee: this.settingsData.global_list_employee,
              });
              

            }
            
        });
  }

}