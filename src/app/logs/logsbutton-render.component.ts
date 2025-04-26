import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatasourceService} from '../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import { Observable, Observer } from "rxjs";
import { DiffContent, DiffResults } from 'ngx-text-diff/lib/ngx-text-diff.model';

@Component({
    template: `
      <span (click)= "openDialog()" class = "btn-span" mat-button>See Details</span>
    `
  })

  export class LogsRenderComponent implements ViewCell, OnInit {

    public renderValue;

    @Input() value: string | number;
    @Input() rowData: any;

    constructor(
        public dialog: MatDialog,
        private data_api: DatasourceService,
        private spinnerService: NgxSpinnerService,
        ) {  }
    
    ngOnInit() {
    this.renderValue = this.value;
        console.log(this.renderValue);
    }

    openDialog(): void {

        if(this.renderValue.subject == 'visitor' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '400px',
                data: { data:this.renderValue, caption:'Visitor Name' }
            });
        }else if(this.renderValue.subject == 'visitor' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Visitor Name' }
            });
        }else if(this.renderValue.subject == 'visitor' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Visitor Name' }
            });
        }else if(this.renderValue.subject == 'supplier' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '600px',
                data: { data:this.renderValue, caption:'Supplier Name' }
            });
          }else if(this.renderValue.subject == 'supplier' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Supplier Name' }
            });
        }else if(this.renderValue.subject == 'supplier' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Supplier Name' }
            });
        }else if(this.renderValue.subject == 'product-category' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '600px',
                data: { data:this.renderValue, caption:'Product Category' }
            });
        }else if(this.renderValue.subject == 'product-category' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Product Category' }
            });  
        }else if(this.renderValue.subject == 'product-category' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Product Category' }
            }); 
        }else if(this.renderValue.subject == 'stage' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '600px',
                data: { data:this.renderValue, caption:'Stage Name' }
            });
        }else if(this.renderValue.subject == 'stage' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Stage Name' }
            });
        }else if(this.renderValue.subject == 'stage' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Stage Name' }
            });
        }else if(this.renderValue.subject == 'costcentre' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '600px',
                data: { data:this.renderValue, caption:'CostCentre' }
            });
        }else if(this.renderValue.subject == 'costcentre' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'CostCentre' }
            });
        }else if(this.renderValue.subject == 'costcentre' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'CostCentre' }
            });
        }else if(this.renderValue.subject == 'tool' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '600px',
                data: { data:this.renderValue, caption:'Tool Name' }
            });
        }else if(this.renderValue.subject == 'tool' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '600px',
                data: { data:this.renderValue, caption:'Tool Name' }
            });
        }else if(this.renderValue.subject == 'tool' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '600px',
                data: { data:this.renderValue, caption:'Tool Name' }
            });
        }else if(this.renderValue.subject == 'reason' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '400px',
                data: { data:this.renderValue, caption:'Reason' }
            });
        }else if(this.renderValue.subject == 'reason' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Reason' }
            });
        }else if(this.renderValue.subject == 'reason' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Reason' }
            });
        }else if(this.renderValue.subject == 'question' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '400px',
                data: { data:this.renderValue, caption:'Question' }
            });
        }else if(this.renderValue.subject == 'question' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialog, {
                width: '800px',
                data: { data:this.renderValue, caption:'Question' }
            });
        }else if(this.renderValue.subject == 'daily-work' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogDailyWork, {
                width: '600px',
                data: this.renderValue
            });
          }else if(this.renderValue.subject == 'daily-work' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialogDailyWork, {
                width: '800px',
                data: this.renderValue
            });  
        }else if(this.renderValue.subject == 'trade' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogTrade, {
                width: '600px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'trade' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialogTrade, {
                width: '800px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'trade' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialogTrade, {
                width: '800px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'employee' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogEmployees, {
                width: '600px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'employee' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialogEmployees, {
                width: '800px',
                data: this.renderValue
            });
          }else if(this.renderValue.subject == 'product' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogProduct, {
                width: '600px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'product' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialogProduct, {
                width: '800px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'product' && this.renderValue.method == 'delete'){
            const dialogRef = this.dialog.open(LogsDialogProduct, {
                width: '800px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'user' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogUser, {
                width: '600px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'user' && this.renderValue.method == 'update'){
          const dialogRef = this.dialog.open(LogsDialogUser, {
              width: '600px',
              data: this.renderValue
          });
        }else if(this.renderValue.subject == 'project' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogProject, {
                width: '600px',
                data: this.renderValue
            });
          }else if(this.renderValue.subject == 'project' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialogProject, {
                width: '800px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'daily-report' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogDailyReport, {
                width: '600px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'daily-report' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialogDailyReport, {
                width: '800px',
                data: this.renderValue
            });
        // }else if(this.renderValue.subject == 'daily-report' && this.renderValue.method == 'create' && this.renderValue.logs == 'Uploaded Images for Daily Report'){
        //     const dialogRef = this.dialog.open(LogsDialogDailyReportImage, {
        //         width: '600px',
        //         data: this.renderValue
        //     });
        // }else if(this.renderValue.subject == 'daily-report' && this.renderValue.method == 'update' && this.renderValue.logs == 'Updated Images for Daily Report'){
        //     const dialogRef = this.dialog.open(LogsDialogDailyReportImage, {
        //         width: '800px',
        //         data: this.renderValue
        //     });
        // }else if(this.renderValue.logs == 'Created New Daily Report (autosaved)' || this.renderValue.logs == 'Updated a Daily Report (autosaved)'){
        //     const dialogRef = this.dialog.open(LogsDialogDailyReport, {
        //         width: '600px',
        //         data: this.renderValue
        //     });
        }else if(this.renderValue.subject == 'weekly-report' && this.renderValue.method == 'create'){
            const dialogRef = this.dialog.open(LogsDialogWeeklyReport, {
                width: '600px',
                data: this.renderValue
            });
        }else if(this.renderValue.subject == 'weekly-report' && this.renderValue.method == 'update'){
            const dialogRef = this.dialog.open(LogsDialogWeeklyReport, {
                width: '800px',
                data: this.renderValue
            });
        }




        // dialogRef.afterClosed().subscribe(result => {
          
        //   if(result == 'success'){   
        //       setTimeout(function(){
        //         window.location.reload();
        //       }, 1000);  
        //   }
        // });
    }


}

@Component({
    selector: 'logs-dialog',
    templateUrl: 'logsdialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class LogsDialog implements OnInit {
  
    public logData;
    public prevData;

    public left;
    public right;
    public logCaption;
    editForm: FormGroup;

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<LogsDialog>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

    ngOnInit() {
        this.getAdminSettings();
        console.log(this.data);
        this.logData = this.data.data.data;
        this.logCaption = this.data.caption;
        this.prevData =  this.data.data.prevdata;
        
        if(this.prevData){
            
          if(this.data.data.subject == 'reason'){
            this.left = this.logCaption+` : `+this.prevData.reason;
          }else if(this.data.data.subject == 'question'){
            this.left = this.logCaption+` : `+this.prevData.question; 
          }else if(this.data.data.subject == 'visitor'){
            this.left = this.logCaption+` : `+this.prevData.visitorName; 
          }else if(this.data.data.subject == 'supplier'){
            this.left = this.logCaption+` : `+this.prevData.supplierName; 
          }else if(this.data.data.subject == 'product-category'){
            this.left = this.logCaption+` : `+this.prevData.prodCategoryName; 
          }else if(this.data.data.subject == 'stage'){
            this.left = this.logCaption+` : `+this.prevData.stageName; 
          }else if(this.data.data.subject == 'costcentre'){
            this.left = this.logCaption+` : `+this.prevData.costcentreName; 
          }else if(this.data.data.subject == 'tool'){
            this.left = this.logCaption+` : `+this.prevData.toolName; 
          }else{
            this.left = this.logCaption+` : `+this.prevData.name;
          }
            
        }
        if(this.logData){
          if(this.data.data.subject == 'reason'){
            this.right = this.logCaption+` : `+this.logData.reason;
          }else if(this.data.data.subject == 'question'){
            this.right = this.logCaption+` : `+this.logData.question; 
          }else if(this.data.data.subject == 'visitor'){
            this.right = this.logCaption+` : `+this.logData.visitorName; 
          }else if(this.data.data.subject == 'supplier'){
            this.right = this.logCaption+` : `+this.logData.supplierName; 
          }else if(this.data.data.subject == 'product-category'){
            this.right = this.logCaption+` : `+this.logData.prodCategoryName; 
          }else if(this.data.data.subject == 'stage'){
            this.right = this.logCaption+` : `+this.logData.stageName; 
          }else if(this.data.data.subject == 'costcentre'){
            this.right = this.logCaption+` : `+this.logData.costcentreName; 
          }else if(this.data.data.subject == 'tool'){
            this.right = this.logCaption+` : `+this.logData.toolName; 
          }else{
            this.right = this.logCaption+` : `+this.logData.name;
          }          
        }
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'logs-dialog-dailywork',
    templateUrl: 'logsdialog-dailywork.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class LogsDialogDailyWork implements OnInit {
  
    public logData;
    public prevData;

    public left;
    public right;

    imageForm: FormGroup;
    imageUpload: FormArray;
    selectedOptions=[];
    selectedOption;
    public imageURLRaw = [];
    public imageURL = [];
    public imageSize = [];
    public totalImageSize = 0;

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<LogsDialogDailyWork>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

    ngOnInit() {
        this.getAdminSettings();
        console.log(this.data);
        this.logData =  this.data.data;
        console.log(this.logData.accomplishments);
        this.prevData =  this.data.prevdata;
        
        if(this.prevData){
            this.left = `Date : `+this.prevData.selectedDate;
            this.left += `\nProject Name : `+this.prevData.projectName;
            this.left += `\nStart : `+this.prevData.start;
            this.left += `\nBreak : `+this.prevData.break;
            this.left += `\nFinish : `+this.prevData.finish;
            this.left += `\nAccomplishments : `+this.prevData.accomplishments;
            this.left += `\nImages : `+this.prevData.imageUpload;

        }
        if(this.logData){
            this.right = `Date : `+this.logData.selectedDate;
            this.right += `\nProject Name : `+this.logData.projectName;
            this.right += `\nStart : `+this.logData.start;
            this.right += `\nBreak : `+this.logData.break;
            this.right += `\nFinish : `+this.logData.finish;
            this.right += `\nAccomplishments : `+this.logData.accomplishments;
            this.right += `\nImages : `+this.logData.imageUpload;
        }

    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
    public formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
  
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
        const i = Math.floor(Math.log(bytes) / Math.log(k));
  
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    

}


@Component({
    selector: 'logs-dialog-trade',
    templateUrl: 'logsdialog-trade.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class LogsDialogTrade implements OnInit {
  
    public logData;
    public prevData;

    public left;
    public right;

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<LogsDialogTrade>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

    ngOnInit() {
        console.log(this.data);
        this.logData =  this.data.data;
        this.prevData =  this.data.prevdata;
        
        if(this.prevData){
            this.left = `Company Name: `+this.prevData.tradeCompanyName;
            this.left += `\nTrade : `+this.prevData.trade;
            this.left += `\nName : `+this.prevData.tradeName;
            this.left += `\nEmail : `+this.prevData.tradeEmail;
            this.left += `\nPhone : `+this.prevData.tradePhone;
            this.left += `\nDefault CostCode : `+this.prevData.tradedefaultCostcode;

            this.prevData.staffFormArray.forEach(item =>{ 
              this.left += `\n   `+item.staffName+` - `+item.start+` - `+item.break+` - `+item.finish;
            })

        }
        if(this.logData){
            this.right = `Company Name: `+this.logData.tradeCompanyName;
            this.right += `\nTrade : `+this.logData.trade;
            this.right += `\nName : `+this.logData.tradeName;
            this.right += `\nEmail : `+this.logData.tradeEmail;
            this.right += `\nPhone : `+this.logData.tradePhone;
            this.right += `\nDefault CostCode : `+this.logData.tradedefaultCostcode;

            this.logData.staffFormArray.forEach(item =>{ 
              this.right += `\n   `+item.staffName+` - `+item.start+` - `+item.break+` - `+item.finish;
            })
            
        }

    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    onNoClick(): void {
      this.dialogRef.close();
    }

    onCompareResults(diffResults: DiffResults) {
      console.log('diffResults', diffResults);
    }
}

@Component({
    selector: 'logs-dialog-employees',
    templateUrl: 'logsdialog-employees.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class LogsDialogEmployees implements OnInit {
  
    public logData;
    public prevData;

    public left;
    public right;

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<LogsDialogEmployees>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

    ngOnInit() {
        this.getAdminSettings();
        console.log(this.data);
        this.logData =  this.data.data;
        this.prevData =  this.data.prevdata;

        if(this.prevData){
            this.left = `Employee Number : `+this.prevData.employeeNo;
            this.left += `\nName : `+this.prevData.name;
            this.left += `\nEmail : `+this.prevData.email;
            this.left += `\nPhone : `+this.prevData.phone;
            this.left += `\nStart : `+this.prevData.start;
            this.left += `\nBreak : `+this.prevData.break;
            this.left += `\nFinish : `+this.prevData.finish;
            this.left += `\nDefault Costcode : `+this.prevData.defaultCostcode;
            this.left += `\nPaid Rate : `+this.prevData.paidRate;
        }
        if(this.logData){
            this.right = `Employee Number : `+this.logData.employeeNo;
            this.right += `\nName : `+this.logData.name;
            this.right += `\nEmail : `+this.logData.email;
            this.right += `\nPhone : `+this.logData.phone;
            this.right += `\nStart : `+this.logData.start;
            this.right += `\nBreak : `+this.logData.break;
            this.right += `\nFinish : `+this.logData.finish;
            this.right += `\nDefault Costcode : `+this.logData.defaultCostcode;
            this.right += `\nPaid Rate : `+this.logData.paidRate;
        }
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }
    
    onNoClick(): void {
        this.dialogRef.close();
      }
    onCompareResults(diffResults: DiffResults) {
      console.log('diffResults', diffResults);
    }

}


@Component({
  selector: 'logs-dialog-product',
  templateUrl: 'logsdialog-product.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class LogsDialogProduct implements OnInit {

  public logData;
  public prevData;

  public left;
  public right;

  adminData;

  colorBtnDefault;

  constructor(
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LogsDialogProduct>,
    @Inject(MAT_DIALOG_DATA) public data
    ) {}

  ngOnInit() {
      this.getAdminSettings();
      console.log(this.data);
      this.logData =  this.data.data;
      this.prevData =  this.data.prevdata;

      if(this.prevData){
          this.left = `Product Name : `+this.prevData.productName;
          this.left += `\nUnit : `+this.prevData.productUnit;
          this.left += `\nCost : `+this.prevData.productCost;
          this.left += `\nSize Type : `+this.prevData.productSizeType;
          this.left += `\nBrand : `+this.prevData.productBrand;
          this.left += `\nSKU : `+this.prevData.productSku;
          this.left += `\nSupplier : `+this.prevData.productSupplier;
          this.left += `\nCategory : `+this.prevData.productCategory;
          this.left += `\nCost Centre : `+this.prevData.productCostcentre;
          this.left += `\nStage : `+this.prevData.productStage;
      }
      if(this.logData){
          this.right = `Product Name : `+this.logData.productName;
          this.right += `\nUnit : `+this.logData.productUnit;
          this.right += `\nCost : `+this.logData.productCost;
          this.right += `\nSize Type : `+this.logData.productSizeType;
          this.right += `\nBrand : `+this.logData.productBrand;
          this.right += `\nSKU : `+this.logData.productSku;
          this.right += `\nSupplier : `+this.logData.productSupplier;
          this.right += `\nCategory : `+this.logData.productCategory;
          this.right += `\nCost Centre : `+this.logData.productCostcentre;
          this.right += `\nStage : `+this.logData.productStage;
      }
  }

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
      }); 
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  onNoClick(): void {
      this.dialogRef.close();
  }
  onCompareResults(diffResults: DiffResults) {
    console.log('diffResults', diffResults);
  }

}


@Component({
    selector: 'logs-dialog-user',
    templateUrl: 'logsdialog-user.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class LogsDialogUser implements OnInit {
    
    public logData;
    public prevData;

    public left;
    public right;

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<LogsDialogUser>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

    ngOnInit() {
        console.log(this.data);
        this.logData =  this.data.data;
        this.prevData =  this.data.prevdata;

      if(this.prevData){
          this.left = `First Name : `+this.prevData.firstName;
          this.left += `\nLast Name : `+this.prevData.lastName;
          this.left += `\nEmail : `+this.prevData.email;
          this.left += `\nRole : `+this.prevData.role;
          this.left += `\nEmployee No. : `+this.prevData.staffNo;
      }
      if(this.logData){
        this.right = `First Name : `+this.logData.firstName;
        this.right += `\nLast Name : `+this.logData.lastName;
        this.right += `\nEmail : `+this.logData.email;
        this.right += `\nRole : `+this.logData.role;
        this.right += `\nEmployee No. : `+this.logData.staffNo;
      }

    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onCompareResults(diffResults: DiffResults) {
      console.log('diffResults', diffResults);
    }


}

@Component({
    selector: 'logs-dialog-project',
    templateUrl: 'logsdialog-project.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class LogsDialogProject implements OnInit {
  
    public logData;
    public prevData;

    public left;
    public right;

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<LogsDialogProject>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

    ngOnInit() {
        this.getAdminSettings();
        console.log(this.data);
        this.logData =  this.data.data;
        this.prevData =  this.data.prevdata;

        if(this.prevData){
            this.left = `First Name : `+this.prevData.projectName;
            this.left += `\nClient Name: `+this.prevData.clientName;
            this.left += `\nJob Number : `+this.prevData.jobNumber;
            this.left += `\nProject Address : `+this.prevData.projectAddress;
            this.left += `\nCountry Code  : `+this.prevData.countryCode;
            this.left += `\nZip Code : `+this.prevData.zipcode;
            this.left += `\nProject Status : `+this.prevData.projectStatus;
            this.left += `\nProject Owner : `+this.prevData.projectOwner;
            this.left += `\nProject Worker : `+this.prevData.projectWorker;
            this.left += `\nPDF Background : `+this.prevData.bgName;
            this.left += `\nSite Supervisor : `+this.prevData.siteSupervisor;
            this.left += `\nAimed Completion Date : `+this.prevData.aimedComDate;
            this.left += `\nLost Total Days : `+this.prevData.lostTotalDays;
            this.left += `\nLost Total Hours : `+this.prevData.lostTotalHours;
            this.left += `\nClient Email : `+this.prevData.clientEmail;
            this.left += `\nClient Email (CC): `+this.prevData.clientEmailCC;
            this.left += `\nClient Email (BCC) : `+this.prevData.clientEmailBCC;
            this.left += `\nDirect Folder Email : `+this.prevData.directFolderEmail;
        }
        if(this.logData){
          this.right = `First Name : `+this.logData.projectName;
          this.right += `\nClient Name: `+this.logData.clientName;
          this.right += `\nJob Number : `+this.logData.jobNumber;
          this.right += `\nProject Address : `+this.logData.projectAddress;
          this.right += `\nCountry Code  : `+this.logData.countryCode;
          this.right += `\nZip Code : `+this.logData.zipcode;
          this.right += `\nProject Status : `+this.logData.projectStatus;
          this.right += `\nProject Owner : `+this.logData.projectOwner;
          this.right += `\nProject Worker : `+this.logData.projectWorker;
          this.right += `\nPDF Background : `+this.logData.bgName;
          this.right += `\nSite Supervisor : `+this.logData.siteSupervisor;
          this.right += `\nAimed Completion Date : `+this.logData.aimedComDate;
          this.right += `\nLost Total Days : `+this.logData.lostTotalDays;
          this.right += `\nLost Total Hours : `+this.logData.lostTotalHours;
          this.right += `\nClient Email : `+this.logData.clientEmail;
          this.right += `\nClient Email (CC): `+this.logData.clientEmailCC;
          this.right += `\nClient Email (BCC) : `+this.logData.clientEmailBCC;
          this.right += `\nDirect Folder Email : `+this.logData.directFolderEmail;
        }
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    onNoClick(): void {
        this.dialogRef.close();
      }
      onCompareResults(diffResults: DiffResults) {
        console.log('diffResults', diffResults);
      }     

}

@Component({
    selector: 'logs-dialog-dailyreport',
    templateUrl: 'logsdialog-dailyreport.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class LogsDialogDailyReport implements OnInit {
  
    public logData;
    public prevData;

    public left;
    public right;

    adminData;

    colorBtnDefault;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<LogsDialogDailyReport>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

    ngOnInit() {

        this.getAdminSettings();
        console.log(this.data);
        this.logData =  this.data.data;
        this.prevData =  this.data.prevdata;

        if(this.prevData){
          this.left = `Date: `+ this.prevData.todaysDate;
          this.left += `\nProject ID: `+this.prevData.projectId;
          this.left += `\nSite Supervisor: `+this.prevData.siteSupervisor;
          this.left += `\nWeather Residual: `+this.prevData.weatherResidual;
          this.left += `\nWeather Perfect: `+this.prevData.weatherPerfect;
          this.left += `\nMax Temperature: `+this.prevData.weatherMaxTemp;
          this.left += `\nMinimum Temperature: `+this.prevData.weatherMinTemp;
          this.left += `\nWeather Morning: `+this.prevData.weatherMorning;
          this.left += `\nWeather Midday: `+this.prevData.weatherMidDay;
          this.left += `\nWeather Afternoon: `+this.prevData.weatherAfternoon;
          this.left += `\nWeather Evening: `+this.prevData.weatherEvening;
          this.left += `\nWeather On Off: `+this.prevData.weatherOnOff;
          this.left += `\nWeather All Day: `+this.prevData.weatherAllDay;
          this.left += `\nWeather Rest of Day: `+this.prevData.weatherRestOfDay;
          this.left += `\nWeather Others (Morning): `+this.prevData.weatherOthersMorning;
          this.left += `\nWeather Others (Midday): `+this.prevData.weatherOthersMidDay;
          this.left += `\nWeather Others (Afternoon): `+this.prevData.weatherOthersAfternoon;
          this.left += `\nWeather Others (Evening): `+this.prevData.weatherOthersEvening;
          this.left += `\nWeather Others (On Off): `+this.prevData.weatherOthersOnOff;
          this.left += `\nWeather Others (All Day): `+this.prevData.weatherOthersAllDay;
          this.left += `\nWeather Others (Rest of Day): `+this.prevData.weatherOthersRestOfDay;
          this.left += `\nToolbox Talk: `+this.prevData.toolboxTalk;
          this.left += `\nToolbox Form Completed: `+this.prevData.toolboxForm;
          this.left += `\nToolbox Action Required: `+this.prevData.toolboxRequired;
          this.left += `\nToolbox Notes: `+this.prevData.toolboxInput;
          this.left += `\nSafety Talk : `+this.prevData.safetyWalk;
          this.left += `\nSafety Form Completed: `+this.prevData.safetyForm;
          this.left += `\nSafety Action Required: `+this.prevData.safetyRequired;
          this.left += `\nSafety Notes: `+this.prevData.safetyInput;
          this.left += `\nAccident Report: `+this.prevData.accidentReport;
          this.left += `\nAccident Form Completed: `+this.prevData.accidentForm;
          this.left += `\nAccident Action Required: `+this.prevData.accidentRequired;
          this.left += `\nAccident Notes: `+this.prevData.accidentInput;
          this.left += `\nPPE: `+this.prevData.ppeReport;
          this.left += `\nPPE Form Completed: `+this.prevData.ppeForm;
          this.left += `\nPPE Action Required: `+this.prevData.ppeRequired;
          this.left += `\nPPE Notes: `+this.prevData.ppeInput;
          this.left += `\nInstructions Received: `+this.prevData.instructionsReceived;
          this.left += `\nDelays: `+this.prevData.delays;
          this.left += `\nTools Used: `+this.prevData.toolsUsed;
          this.left += `\nDamage Report: `+this.prevData.damageReport;
          this.left += `\nSummary: `+this.prevData.summary;
          this.left += `\nMaterials Requested: `+this.prevData.materialsRequested;
          this.left += `\nOffHire Plant: `+this.prevData.offHirePlant;
          this.left += `\nVariations: `+this.prevData.variations;
          this.left += `\nDeliveries: `+this.prevData.deliveries;
          this.left += `\nTrades to Contact : `+this.prevData.tradesContact;
          this.left += `\nTrades to Schedule: `+this.prevData.tradesSched;
          this.left += `\nImages: `+this.prevData.imageUpload;
          this.left += `\n\nTrade On Site: `

            if(this.prevData.tradeFormArray){
                  this.prevData.tradeFormArray.forEach(item =>{ 
                      this.left += `\nTrade ID: `+item.tradesOnSite;
                      if(item.tradeStaffFormArray){
                          item.tradeStaffFormArray.forEach(item2 =>{
                            this.left += `\n   Staff ID: `+item2.staffName;
                              if(item2.taskTradeFormArray){
                                  item2.taskTradeFormArray.forEach(item3 =>{ 
                                          this.left += `\n      Start: `+item3.start;
                                          this.left += `\n      Break: `+item3.break;
                                          this.left += `\n      Finish: `+item3.finish;
                                          this.left += `\n      Hours: `+item3.hours;
                                  })
                              }
                          })
                      }
                  })
            }

          this.left += `\n\nStaff On Site: `

            if(this.prevData.staffFormArray){
                this.prevData.staffFormArray.forEach(item =>{
                      this.left += `\n   Staff ID: `+item.staffOnSite;
                      if(item.taskStaffFormArray){
                          item.taskStaffFormArray.forEach(item2 =>{ 
                                  this.left += `\n      Start: `+item2.start;
                                  this.left += `\n      Break: `+item2.break;
                                  this.left += `\n      Finish: `+item2.finish;
                                  this.left += `\n      Hours: `+item2.hours;
                          })
                      }
                })
            }

          this.left += `\n\nVisitor On Site: `

            if(this.prevData.visitorFormArray){
                this.prevData.visitorFormArray.forEach(item =>{
                      this.left += `\n   Visitor ID: `+item.visitorsOnSite;
                      this.left += `\n   Reason ID: `+item.reasonsOnSite;
                      this.left += `\n   Duration: `+item.duration;
                })
            }

          this.left += `\n\nMaterials/Plants: `

            if(this.prevData.productFormArray){
                this.prevData.productFormArray.forEach(item =>{
                      this.left += `\n   Product ID: `+item.productName;
                      this.left += `\n   Size Type: `+item.sizeType;
                      this.left += `\n   Quantity: `+item.quantity;
                      this.left += `\n   Length: `+item.length;
                      this.left += `\n   Width: `+item.width;
                      this.left += `\n   Height: `+item.height;
                      this.left += `\n   Hours: `+item.hours;
                      this.left += `\n   Weight: `+item.weight;
                      this.left += `\n   Cost: `+item.cost;
                })
            }

        }
        if(this.logData){
          this.right = `Date: `+ this.logData.todaysDate;
          this.right += `\nProject ID: `+this.logData.projectId;
          this.right += `\nSite Supervisor: `+this.logData.siteSupervisor;
          this.right += `\nWeather Residual: `+this.logData.weatherResidual;
          this.right += `\nWeather Perfect: `+this.logData.weatherPerfect;
          this.right += `\nMax Temperature: `+this.logData.weatherMaxTemp;
          this.right += `\nMinimum Temperature: `+this.logData.weatherMinTemp;
          this.right += `\nWeather Morning: `+this.logData.weatherMorning;
          this.right += `\nWeather Midday: `+this.logData.weatherMidDay;
          this.right += `\nWeather Afternoon: `+this.logData.weatherAfternoon;
          this.right += `\nWeather Evening: `+this.logData.weatherEvening;
          this.right += `\nWeather On Off: `+this.logData.weatherOnOff;
          this.right += `\nWeather All Day: `+this.logData.weatherAllDay;
          this.right += `\nWeather Rest of Day: `+this.logData.weatherRestOfDay;
          this.right += `\nWeather Others (Morning): `+this.logData.weatherOthersMorning;
          this.right += `\nWeather Others (Midday): `+this.logData.weatherOthersMidDay;
          this.right += `\nWeather Others (Afternoon): `+this.logData.weatherOthersAfternoon;
          this.right += `\nWeather Others (Evening): `+this.logData.weatherOthersEvening;
          this.right += `\nWeather Others (On Off): `+this.logData.weatherOthersOnOff;
          this.right += `\nWeather Others (All Day): `+this.logData.weatherOthersAllDay;
          this.right += `\nWeather Others (Rest of Day): `+this.logData.weatherOthersRestOfDay;
          this.right += `\nToolbox Talk: `+this.logData.toolboxTalk;
          this.right += `\nToolbox Form Completed: `+this.logData.toolboxForm;
          this.right += `\nToolbox Action Required: `+this.logData.toolboxRequired;
          this.right += `\nToolbox Notes: `+this.logData.toolboxInput;
          this.right += `\nSafety Talk : `+this.logData.safetyWalk;
          this.right += `\nSafety Form Completed: `+this.logData.safetyForm;
          this.right += `\nSafety Action Required: `+this.logData.safetyRequired;
          this.right += `\nSafety Notes: `+this.logData.safetyInput;
          this.right += `\nAccident Report: `+this.logData.accidentReport;
          this.right += `\nAccident Form Completed: `+this.logData.accidentForm;
          this.right += `\nAccident Action Required: `+this.logData.accidentRequired;
          this.right += `\nAccident Notes: `+this.logData.accidentInput;
          this.right += `\nPPE: `+this.logData.ppeReport;
          this.right += `\nPPE Form Completed: `+this.logData.ppeForm;
          this.right += `\nPPE Action Required: `+this.logData.ppeRequired;
          this.right += `\nPPE Notes: `+this.logData.ppeInput;
          this.right += `\nInstructions Received: `+this.logData.instructionsReceived;
          this.right += `\nDelays: `+this.logData.delays;
          this.right += `\nTools Used: `+this.logData.toolsUsed;
          this.right += `\nDamage Report: `+this.logData.damageReport;
          this.right += `\nSummary: `+this.logData.summary;
          this.right += `\nMaterials Requested: `+this.logData.materialsRequested;
          this.right += `\nOffHire Plant: `+this.logData.offHirePlant;
          this.right += `\nVariations: `+this.logData.variations;
          this.right += `\nDeliveries: `+this.logData.deliveries;
          this.right += `\nTrades to Contact : `+this.logData.tradesContact;
          this.right += `\nTrades to Schedule: `+this.logData.tradesSched;
          this.right += `\nImages: `+this.logData.imageUpload;
          this.right += `\n\nTrade On Site: `

            if(this.logData.tradeFormArray){
                  this.logData.tradeFormArray.forEach(item =>{ 
                      this.right += `\n   Trade ID: `+item.tradesOnSite;
                      if(item.tradeStaffFormArray){
                          item.tradeStaffFormArray.forEach(item2 =>{
                            this.right += `\n      Staff ID: `+item2.staffName;
                              if(item2.taskTradeFormArray){
                                  item2.taskTradeFormArray.forEach(item3 =>{ 
                                          this.right += `\n         Start: `+item3.start;
                                          this.right += `\n         Break: `+item3.break;
                                          this.right += `\n         Finish: `+item3.finish;
                                          this.right += `\n         Hours: `+item3.hours;
                                  })
                              }
                          })
                      }
                  })
            }

          this.right += `\n\nStaff On Site: `

            if(this.logData.staffFormArray){
                this.logData.staffFormArray.forEach(item =>{
                      this.right += `\n   Staff ID: `+item.staffOnSite;
                      if(item.taskStaffFormArray){
                          item.taskStaffFormArray.forEach(item2 =>{ 
                                  this.right += `\n      Start: `+item2.start;
                                  this.right += `\n      Break: `+item2.break;
                                  this.right += `\n      Finish: `+item2.finish;
                                  this.right += `\n      Hours: `+item2.hours;
                          })
                      }
                })
            }

          this.right += `\n\nVisitor On Site: `

            if(this.logData.visitorFormArray){
                this.logData.visitorFormArray.forEach(item =>{
                      this.right += `\n   Visitor ID: `+item.visitorsOnSite;
                      this.right += `\n   Reason ID: `+item.reasonsOnSite;
                      this.right += `\n   Duration: `+item.duration;
                })
            }

          this.right += `\n\nMaterials/Plants: `

            if(this.logData.productFormArray){
                this.logData.productFormArray.forEach(item =>{
                      this.right += `\n   Product ID: `+item.productName;
                      this.right += `\n   Size Type: `+item.sizeType;
                      this.right += `\n   Quantity: `+item.quantity;
                      this.right += `\n   Length: `+item.length;
                      this.right += `\n   Width: `+item.width;
                      this.right += `\n   Height: `+item.height;
                      this.right += `\n   Hours: `+item.hours;
                      this.right += `\n   Weight: `+item.weight;
                      this.right += `\n   Cost: `+item.cost;
                })
            }

        }
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }

    formatDate(myDate){
      if(myDate){
        return myDate.toDate().toDateString();
      }else{
        return;
      }
    }
    onCompareResults(diffResults: DiffResults) {
      console.log('diffResults', diffResults);
    }  

    onNoClick(): void {
        this.dialogRef.close();
      }
      public formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
  
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
        const i = Math.floor(Math.log(bytes) / Math.log(k));
  
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

}

@Component({
  selector: 'logs-dialog-dailyreportimage',
  templateUrl: 'logsdialog-dailyreportimage.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class LogsDialogDailyReportImage implements OnInit {

  public logData;
  public prevData;

  public left;
  public right;

  adminData;

  colorBtnDefault;

  constructor(
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LogsDialogDailyReportImage>,
    @Inject(MAT_DIALOG_DATA) public data
    ) {}

  ngOnInit() {
      this.getAdminSettings();
      console.log(this.data);
      this.logData =  JSON.parse(this.data.data);
      this.prevData =  JSON.parse(this.data.prevdata);
  }

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
      }); 
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  onNoClick(): void {
      this.dialogRef.close();
  }
  public formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}


@Component({
  selector: 'logs-dialog-weeklyreport',
  templateUrl: 'logsdialog-weeklyreport.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class LogsDialogWeeklyReport implements OnInit {

  public logData;
  public prevData;

  public left;
  public right;

  adminData;

  colorBtnDefault;

  constructor(
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<LogsDialogWeeklyReport>,
    @Inject(MAT_DIALOG_DATA) public data
    ) {}

  ngOnInit() {
    
      this.getAdminSettings();
      console.log(this.data);
      this.logData =  this.data.data;
      this.prevData =  this.data.prevdata;

      
      if(this.prevData){
        this.left = `Friday Date : `+this.prevData.fridayDate;
        this.left += `\nProject ID: `+this.prevData.projectName;
        this.left += `\nSite Supervisor: `+this.prevData.siteSupervisor;

        this.left += `\nWeather AllWeek: `+this.prevData.weatherAllWeek;
        this.left += `\nWeather Saturday: `+this.prevData.weatherSaturday;
        this.left += `\nWeather Sunday: `+this.prevData.weatherSunday;
        this.left += `\nWeather Monday: `+this.prevData.weatherMonday;
        this.left += `\nWeather Tuesday: `+this.prevData.weatherTuesday;
        this.left += `\nWeather Wednesday: `+this.prevData.weatherWednesday;
        this.left += `\nWeather Thursday: `+this.prevData.weatherThursday;
        this.left += `\nWeather Friday: `+this.prevData.weatherFriday;
        this.left += `\nWeather AllWeek Others: `+this.prevData.weatherOthersAllWeek;
        this.left += `\nWeather Saturday Others: `+this.prevData.weatherOthersSaturday;
        this.left += `\nWeather Sunday Others: `+this.prevData.weatherOthersSunday;
        this.left += `\nWeather Monday Others: `+this.prevData.weatherOthersMonday;
        this.left += `\nWeather Tuesday Others: `+this.prevData.weatherOthersTuesday;
        this.left += `\nWeather Wednesday Others: `+this.prevData.weatherOthersWednesday;
        this.left += `\nWeather Thursday Others: `+this.prevData.weatherOthersThursday;
        this.left += `\nWeather Friday Others: `+this.prevData.weatherOthersFriday;

        this.left += `\nAimed Completion Date: `+this.prevData.aimedComDate;
        this.left += `\nLostWeekDays: `+this.prevData.lostWeekDays;
        this.left += `\nTotal Lost this Week (days): `+this.prevData.lostTotalDays;
        this.left += `\nTotal Lost this Week (hours): `+this.prevData.lostWeekHours;
        this.left += `\nTotal Lost Project (hours): `+this.prevData.lostTotalHours;
        this.left += `\nDCB Accomplishments This Week: `+this.prevData.dcbAccThisWeek;
        this.left += `\nDCB Accomplishments Next Week: `+this.prevData.dcbAccNextWeek;
        this.left += `\nSub Contractors Accomplishments This Week: `+this.prevData.subAccThisWeek;
        this.left += `\nSub Contractors Accomplishments Next Week: `+this.prevData.subAccNextWeek;
        this.left += `\nConsultants on Site This Week: `+this.prevData.conSiteThisWeek;
        this.left += `\nConsultants Needed This Week: `+this.prevData.conSiteNeedWeek;
        this.left += `\nRequested Changes to the Project?: `+this.prevData.requestedChanges;
        this.left += `\nClarification from Architect/Engineer: `+this.prevData.clarificationArchEng;
        this.left += `\nInformation Needed to Keep Things Moving: `+this.prevData.informationNeeded;
        this.left += `\nUpcoming Meetings: `+this.prevData.upcomingMeetings;
        this.left += `\nImages: `+this.prevData.imageUpload;

        this.left += `\n\nAdditional Questions: `

          if(this.prevData.customQuestion){
              this.prevData.customQuestion.forEach(item =>{
                    this.left += `\n   Question: `+item.custQuestion;
                    this.left += `\n   Answer: `+item.custAnswer;
              })
          }

    }
    if(this.logData){
      this.right = `Friday Date : `+this.logData.fridayDate;
      this.right += `\nProject ID: `+this.logData.projectName;
      this.right += `\nSite Supervisor: `+this.logData.siteSupervisor;

      this.right += `\nWeather AllWeek: `+this.logData.weatherAllWeek;
      this.right += `\nWeather Saturday: `+this.logData.weatherSaturday;
      this.right += `\nWeather Sunday: `+this.logData.weatherSunday;
      this.right += `\nWeather Monday: `+this.logData.weatherMonday;
      this.right += `\nWeather Tuesday: `+this.logData.weatherTuesday;
      this.right += `\nWeather Wednesday: `+this.logData.weatherWednesday;
      this.right += `\nWeather Thursday: `+this.logData.weatherThursday;
      this.right += `\nWeather Friday: `+this.logData.weatherFriday;
      this.right += `\nWeather AllWeek Others: `+this.logData.weatherOthersAllWeek;
      this.right += `\nWeather Saturday Others: `+this.logData.weatherOthersSaturday;
      this.right += `\nWeather Sunday Others: `+this.logData.weatherOthersSunday;
      this.right += `\nWeather Monday Others: `+this.logData.weatherOthersMonday;
      this.right += `\nWeather Tuesday Others: `+this.logData.weatherOthersTuesday;
      this.right += `\nWeather Wednesday Others: `+this.logData.weatherOthersWednesday;
      this.right += `\nWeather Thursday Others: `+this.logData.weatherOthersThursday;
      this.right += `\nWeather Friday Others: `+this.logData.weatherOthersFriday;

      this.right += `\nAimed Completion Date: `+this.logData.aimedComDate;
      this.right += `\nLostWeekDays: `+this.logData.lostWeekDays;
      this.right += `\nTotal Lost this Week (days): `+this.logData.lostTotalDays;
      this.right += `\nTotal Lost this Week (hours): `+this.logData.lostWeekHours;
      this.right += `\nTotal Lost Project (hours): `+this.logData.lostTotalHours;
      this.right += `\nDCB Accomplishments This Week: `+this.logData.dcbAccThisWeek;
      this.right += `\nDCB Accomplishments Next Week: `+this.logData.dcbAccNextWeek;
      this.right += `\nSub Contractors Accomplishments This Week: `+this.logData.subAccThisWeek;
      this.right += `\nSub Contractors Accomplishments Next Week: `+this.logData.subAccNextWeek;
      this.right += `\nConsultants on Site This Week: `+this.logData.conSiteThisWeek;
      this.right += `\nConsultants Needed This Week: `+this.logData.conSiteNeedWeek;
      this.right += `\nRequested Changes to the Project?: `+this.logData.requestedChanges;
      this.right += `\nClarification from Architect/Engineer: `+this.logData.clarificationArchEng;
      this.right += `\nInformation Needed to Keep Things Moving: `+this.logData.informationNeeded;
      this.right += `\nUpcoming Meetings: `+this.logData.upcomingMeetings;
      this.right += `\nImages: `+this.logData.imageUpload;

      this.right += `\n\nAdditional Questions: `

      if(this.logData.customQuestion){
          this.logData.customQuestion.forEach(item =>{
                this.right += `\n   Question: `+item.custQuestion;
                this.right += `\n   Answer: `+item.custAnswer;
          })
      }
    }

  }

  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
      }); 
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

  onCompareResults(diffResults: DiffResults) {
    console.log('diffResults', diffResults);
  } 
  onNoClick(): void {
      this.dialogRef.close();
    }
    public formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

}

