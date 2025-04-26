import { Component,Output, Input, EventEmitter, OnInit, Inject } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatasourceService} from '../../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";


@Component({
  template: `
    <span *ngIf="imageUpload.length > 0"  class="btn-span"
            (click)="openDialog()">
            View Images
    </span>  
  `
})
export class DailyProjectWorkerImageRenderComponent implements ViewCell, OnInit {

  public renderValue;

 @Input() value: string | number;
 @Input() rowData: any;
 @Output() onEnlarge: EventEmitter<any> = new EventEmitter();

  public imageUpload = [];

  imgSrc:string;
  imgStampString:string;
  @Input() test;

 constructor(
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    ) {  }

    //onEnlarge = new EventEmitter();

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
        const dialogRef = this.dialog.open(DailyProjectViewWorkerImageDialog, {
            width: '100%',
            data: this.imageUpload
        });

        const sub = dialogRef.componentInstance.onEnlarge.subscribe((data2) => {
          console.log(data2);

          let data3 = {
              image: data2.image,
              timestamp: data2.timestamp,
          }

          this.onEnlarge.emit(data3);

          // const imgElem = event.target
          //var target = event.target || event.srcElement || event.currentTarget;
          // var srcAttr = target.attributes.src;


          // do something 
        });

        dialogRef.afterClosed().subscribe(result => {
            
            console.log(result);

        });
    }


}

@Component({
    selector: 'dailyproject-view-worker-image-dialog',
    templateUrl: 'dailyproject-view-worker-image-dialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class DailyProjectViewWorkerImageDialog implements OnInit {
  
    public imageUploads= [];

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<DailyProjectViewWorkerImageDialog>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}

      @Output() onEnlarge = new EventEmitter<any>(true);

    onNoClick(): void {
      this.dialogRef.close();
    }
    ngOnInit() {
        console.log(this.data);
        this.imageUploads = this.data
    }

    enlargeImage(image,timestamp){
      console.log(image);
      console.log(timestamp);
      let data2= {
          image: image,
          timestamp: timestamp,
      }
      // const imgElem = event.target
      //var target = event.target || event.srcElement || event.currentTarget;
      // var srcAttr = target.attributes.src;
      this.onEnlarge.emit(data2);
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