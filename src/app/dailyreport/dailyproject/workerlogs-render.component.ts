import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DatasourceService} from '../../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { ConfirmedValidator  } from '../../services/confirm-password.validator';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import * as moment from 'moment';

declare const $: any;

@Component({
  template: `
    <a style="cursor:pointer" (click)="openDialog()"><i class="material-icons">edit</i></a>
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
  // <a [routerLink]="" (click)="openDeleteDialog()"><i class="material-icons">archive</i></a>
})
export class WorkerLogsRenderComponent implements ViewCell, OnInit {

  public renderValue;

 @Input() value: string | number;
 @Input() rowData: any;

  animal: string;
  name: string;

  constructor(
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    ) {  }

  ngOnInit() {
    this.renderValue = this.value;
    console.log(this.renderValue);
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
        const dialogRef = this.dialog.open(WorkersLogDialog, {
            width: '400px',
            data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
          
          if(result == 'success'){   
              setTimeout(function(){
                window.location.reload();
              }, 1000);  
          }
        });
    }

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

                    setTimeout(function(){
                      window.location.reload();
                    }, 1000);  
                    
                  });
    
            }

        });
    }
    

}

@Component({
    selector: 'workerlogs-dialog',
    templateUrl: 'workerlogs-dialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class WorkersLogDialog implements OnInit {
  
    public agentData;
    editForm: FormGroup;

    breaktimes=[
      {value: '00:00', viewValue: 'No Breaks'},
      {value: '00:15', viewValue: '15 minutes'},
      {value: '00:30', viewValue: '30 minutes'},
      {value: '00:45', viewValue: '45 minute'},
      {value: '01:00', viewValue: '1 hour'},
    ]

    userDetails;
    prevdata;
    items: Array<any>;

    public projectNames = [];

    public listCostCentres:any= [];

    public filter_list_costcentres: ReplaySubject<[]> = new ReplaySubject<[]>(1);

    public search_control_costcentre: FormControl = new FormControl();
  
    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
  
    protected _onDestroy = new Subject<void>();

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<WorkersLogDialog>,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }

    ngOnDestroy() {
      this._onDestroy.next();
      this._onDestroy.complete();
    }
  
    initializeFilterCostcentres() {
  
      this.filter_list_costcentres.next(this.listCostCentres.slice());
  
        this.search_control_costcentre.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterListCostcentres();
        });
  
    }
  
    protected filterListCostcentres() {
        if (!this.listCostCentres) {
          return;
        }
        // get the search keyword
        let search = this.search_control_costcentre.value;
        if (!search) {
          this.filter_list_costcentres.next(this.listCostCentres.slice());
          return;
        } else {
          search = search.toLowerCase();
        }
        // filter the banks
        this.filter_list_costcentres.next(
          this.listCostCentres.filter(listCostCentre => listCostCentre.costcentre_name.toLowerCase().indexOf(search) > -1)
        );
    }

    ngOnInit() {
        console.log(this.data);
        
        this.editForm = this.formBuilder.group({
          projectId: ['', Validators.required],
          selectedDate: ['', Validators.required],
          start: ['', Validators.required],
          break: ['', Validators.required],
          finish: ['', Validators.required],
          accomplishments: [this.items, [Validators.required]],
          // entryStatus: [''],
          modifiedDate: [''],
          modifiedBy: [''],
          modifiedAt: [''],
      });
        this.getWorkerLog(this.data);


        if (localStorage.getItem('currentUser')) {
            this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
        }

    }


    // public addLog(){ 
    //     // let newDetails;
    //     // newDetails += 'Company:';

    //     let today = new Date();
    //     let passData = {
    //         todaysDate: today,
    //         log: 'Updated an Employee - Logs',
    //         method: 'update',
    //         subject: 'employee',
    //         subjectID: this.data,
    //         prevdata: this.prevdata,
    //         data: this.editForm.value,
    //         url: window.location.href
    //     }
        
    //     this.data_api.addActivityLog(this.userDetails.user_id,passData)
    //       .subscribe(
    //         (result) => {
    //           console.log(result);
    //           this.dialogRef.close('success');
    //         }
    //     ); 
    // }

    public updateTimesheet() {

      if (this.editForm.invalid) {
        alert('invalid');
        return;
      }
  
      console.log(this.editForm.value);

      this.spinnerService.show();

      this.data_api.updateFBTimesheetWithoutImagebySupervisor(this.data.id, this.editForm.value).then(() => {

                  swal.fire({
                      title: "Employee Logs Updated",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-success',
                      },
                      icon: "success"
                  })

                  //this.addLog();
                  
                  this.spinnerService.hide();
                  this.dialogRef.close('success');
          // (error) => {
          //     console.log(error)
          //     this.spinnerService.hide();
          //     swal.fire({
          //         title: error.error.message,
          //         // text: "You clicked the button!",
          //         buttonsStyling: false,
          //         customClass: {
          //           confirmButton: 'btn btn-success',
          //         },
          //         icon: "error"
          //     })
              
          //}
          
        }); 

    }

    public getWorkerLog(data){
      let userDetails;
      userDetails = JSON.parse(localStorage.getItem('currentUser'));
      let today = new Date();
      this.spinnerService.show();
      //this.data_api.getDailyWorkerlog(this.data).subscribe((data) => {
        if(data){
              console.log(data);
              this.agentData = data;
            //   console.log(data);
              this.editForm.patchValue({
                projectId:  data.projectId,
                selectedDate: data.selectedDate.toDate(),
                start:  data.start,
                break:  data.break,
                finish:  data.finish,
                accomplishments: data.accomplishments,
                // entryStatus:  this.agentData[0].entry_status,
                modifiedBy: userDetails.name,
                modifiedDate: today,
              });

            //   if(this.agentData[0].default_hours){
            //     let _defHours = JSON.parse(data[0].default_hours);
            //     this.editForm.patchValue({
            //         start: _defHours.start,
            //         break:  _defHours.break,
            //         finish:  _defHours.finish
            //     });
            //   }

            //   this.prevdata = this.editForm.value;
              this.getFBProjectsWorker(data.workerID);
              
            }
        //});
    }

    
      
    getFBProjectsWorker(workerID): void {

      this.data_api.getFBProjectsWorker(workerID).subscribe(data => {
        console.log(data);
        this.spinnerService.hide();
          if(data){
            this.projectNames = data;
          }      

        });
    
    }

    public changeTimeDialog(control, data): void {
      const dialogRef = this.dialog.open(ChangeTimeDialog2, {
          width: '320px',
          data: data
      });
  
      dialogRef.afterClosed().subscribe(result => {
  
          console.log(result);
  
          if(result){  
              if(control == 'start'){

                this.editForm.patchValue({
                  start: result,
              });
              }else if(control == 'finish'){

                this.editForm.patchValue({
                  finish: result,
                });

              }
          }
      });
    
    }

}

@Component({
  selector: 'changetime-adddialog',
  templateUrl: 'changetime-adddialog.html',
})

  export class ChangeTimeDialog2 implements OnInit {
  
    addFestForm: FormGroup;
    mytime;

    adminData;

    colorBtnDefault;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ChangeTimeDialog2>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }
    
    public setTime() {
        console.log(moment(this.mytime).format('hh:mm A'));
        this.dialogRef.close(moment(this.mytime).format('hh:mm A'));
    }
  
    ngOnInit() {
      this.getAdminSettings();
      console.log(this.data)
      let t = this.data; 
      let cdt = moment(t, 'hh:mm A');
      console.log(cdt.format('YYYY-MM-DD HH:mm'));
      this.mytime = cdt.format('YYYY-MM-DD HH:mm');
    }
    
    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
            // this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }
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