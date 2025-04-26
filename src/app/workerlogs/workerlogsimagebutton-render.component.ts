import { Component,Output, Input, EventEmitter, OnInit, Inject } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatasourceService} from '../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
// import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";


@Component({
  template: `
    <button style="min-width:100px!important; padding: 5px 10px !Important;" *ngIf="imageUpload" mat-button class="btn dcb-btn"
            (click)="openDialog()">
            View Images
    </button>  
  `
})
export class WorkerLogsImageRenderComponent implements ViewCell, OnInit {

  public renderValue;

 @Input() value: string | number;
 @Input() rowData: any;
 @Output() save: EventEmitter<any> = new EventEmitter();

  public imageUpload = [];

 constructor(
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    ) {  }

  ngOnInit() {
    this.renderValue = this.value;
    console.log(this.renderValue);
    this.imageUpload = this.renderValue.imageUpload;
  }

  showSwal() {
        // swal({
        //     title: 'Input something',
        //     html: '<div class="form-group">' +
        //         '<input id="input-field" type="text" class="form-control" /><input matInput formControlName="lastName" type="text">' +
        //         '</div>',
        //     showCancelButton: true,
        //     confirmButtonClass: 'btn btn-success',
        //     cancelButtonClass: 'btn btn-danger',
        //     buttonsStyling: false
        // }).then(function(result) {
        //     swal({
        //         type: 'success',
        //         html: 'You entered: <strong>' +
        //             $('#input-field').val() +
        //             '</strong>',
        //         confirmButtonClass: 'btn btn-success',
        //         buttonsStyling: false

        //     })
        // }).catch(swal.noop)
    }

    openDialog(): void {
        console.log(this.renderValue);
        console.log(this.imageUpload);
        const dialogRef = this.dialog.open(WorkerLogsImageDialog, {
            width: '100%',
            data: this.imageUpload
        });

        dialogRef.afterClosed().subscribe(result => {
            
            console.log(result);
            
            this.save.emit(result);

        });
    }


}

@Component({
    selector: 'workerlogs-image-dialog',
    templateUrl: 'workerlogs-image-dialog.html',
    // providers: [
    //   {provide: DateAdapter, useClass: AppDateAdapter},
    //   {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    // ]
  })
export class WorkerLogsImageDialog implements OnInit {
  
    public imageUploads= [];


    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<WorkerLogsImageDialog>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
    ngOnInit() {
        console.log(this.data);
        this.imageUploads = this.data
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