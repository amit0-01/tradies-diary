import { Component, Input, OnInit, Inject } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatasourceService} from '../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import {ActivatedRoute, Params, Router} from '@angular/router';

declare const $: any;

@Component({
  template: `
    <a [routerLink]="[]" (click)="updateWorkerLog()"><i class="material-icons">edit</i></a>
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
})
export class WorkerLogsRenderComponent implements ViewCell, OnInit {

  public renderValue;

  @Input() value: string | number;
  @Input() rowData: any;

  public userDetails;
  public prevdata;

  constructor(
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private router: Router,
    ) {  }

  ngOnInit() {
    this.renderValue = this.value;
    console.log(this.renderValue);

    this.prevdata = this.renderValue;

    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

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
    updateWorkerLog(){
      console.log(this.renderValue);
      let project_id = this.renderValue.projectId;


      let selectedDate = this.renderValue.selectedDate.toDate();
        let selecteddd = String(selectedDate.getDate()).padStart(2, '0');
        let selectedmm = String(selectedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let selectedyyyy = selectedDate.getFullYear();
        let sel_date = selectedyyyy+"-"+selectedmm+"-"+selecteddd;

        this.router.navigateByUrl('/dashboard-worker?project_id='+project_id+'&sel_date='+sel_date).then(() => {
          window.location.reload();
        });

    }

    // openDialog(): void {
    //     console.log(this.renderValue);
    //     const dialogRef = this.dialog.open(WorkerLogsDialog, {
    //         width: '400px',
    //         data: this.renderValue
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
          
    //       if(result == 'success'){   
    //           // setTimeout(function(){
    //           //   window.location.reload();
    //           // }, 1000);  
    //       }
    //     });
    // }

    
    openDeleteDialog(): void {

      const dialogRef = this.dialog.open(WorkerLogsDeleteDialog, {
          width: '400px',
          data: this.renderValue
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
          
            if(result){ 

              console.log(result);
              this.spinnerService.show();   
                  console.log(result);
                  this.data_api.deleteFBTimesheet(result).then(() => {
                    this.spinnerService.hide();  
                    // this.addLog();
                    $.notify({
                      icon: 'notifications',
                      message: 'Entry Deleted'
                    }, {
                        type: 'success',
                        timer: 1000,
                        placement: {
                            from: 'top',
                            align: 'center'
                        },
                        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                          '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
                          '<i class="material-icons" data-notify="icon">notifications</i> ' +
                          '<span data-notify="title">{1}</span> ' +
                          '<span data-notify="message">{2}</span>' +
                          '<div class="progress" data-notify="progressbar">' +
                            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                          '</div>' +
                          '<a href="{3}" target="{4}" data-notify="url"></a>' +
                        '</div>'
                    });
                    window.location.reload();
                  });
    
            }
         
        });
    }

    // addLog(){
    //     this.spinnerService.show();
    //     let today = new Date();
    //     let passData = {
    //         todaysDate: today,
    //         log: 'Deleted Visitor - Global List',
    //         method: 'delete',
    //         subject: 'tool',
    //         subjectID: this.renderValue.toolID,
    //         prevdata: this.prevdata,
    //         data: '',
    //         url: window.location.href,
    //         userID: this.userDetails.user_id,
    //         userName: this.userDetails.name
    //     }
    //     this.data_api.addFBActivityLog(passData).then(() => {
    //       this.spinnerService.hide();
    //     });
    // }


}


@Component({
  selector: 'workerlogs-deletedialog',
  templateUrl: 'workerlogs-deletedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})

export class WorkerLogsDeleteDialog implements OnInit {

  // deleteForm: FormGroup;
  deleteConfirm;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<WorkerLogsDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmDelete(): void {

    if(this.deleteConfirm == 'DELETE'){
      this.dialogRef.close(this.data.id);
    }else{
      this.dialogRef.close();
      $.notify({
        icon: 'notifications',
        message: 'Confirmation Failed'
      }, {
          type: 'danger',
          timer: 1000,
          placement: {
              from: 'top',
              align: 'center'
          },
          template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
            '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
            '<i class="material-icons" data-notify="icon">notifications</i> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
              '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '</div>'
      });
    }
    
  }

  ngOnInit() {
    console.log(this.data);
    // this.deleteForm = this.formBuilder.group({
    //     logID: ['', Validators.required],
    // });
    
    // this.deleteForm.patchValue({
    //   logID: this.data.toolID,
    // });

  }

}