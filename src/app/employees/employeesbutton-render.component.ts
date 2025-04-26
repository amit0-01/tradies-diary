import { Component, Input, OnInit, Inject, ViewChild } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';
import swal from 'sweetalert2';
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { DatasourceService} from '../services/datasource.service';
import { NgxSpinnerService } from "ngx-spinner";
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../services/format-datepicker';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import {MatSelect} from '@angular/material/select';
import * as moment from 'moment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  template: `
    <a [routerLink]="[]" (click)="openDialog()"><i class="material-icons">edit</i></a>
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
})
export class EmployeesRenderComponent implements ViewCell, OnInit {

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
        const dialogRef = this.dialog.open(EmployeesDialog, {
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

      const dialogRef = this.dialog.open(EmployeesDeleteDialog, {
          width: '400px',
          data: this.renderValue
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
          if(result.fest_confirm=='DELETE'){ 

              console.log(result.id);
              this.spinnerService.show();   
                  console.log(result);
                  this.data_api.deleteEmployee(result.id)
                  .subscribe((data3) => {
                            // alert(data2);   
                            // if(data2){
                            //     alert("Updated Successfully");
                            // }
                            // alert("Updated Successfully");
                          swal.fire({
                              title: "Employee Deleted!",
                              // text: "You clicked the button!",
                              buttonsStyling: false,
                              customClass: {
                                confirmButton: 'btn btn-success',
                              },
                              icon: "success"
                          })
                            this.spinnerService.hide();
                            window.location.reload();
                  }); 
  
          }else{
            this.renderValue["fest_confirm"] = "";
              swal.fire({
                  title: "Confirmation Failed!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "warning"
              })
              this.spinnerService.hide();
          }
      });
  }

}

@Component({
    selector: 'employees-dialog',
    templateUrl: 'employeesdialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class EmployeesDialog implements OnInit {
  
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
      public dialogRef: MatDialogRef<EmployeesDialog>,
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
          employeeNo: [''],
          name: ['', Validators.required],
          email: [''],
          phone: [''],
          defaultHours: [''],
          defaultCostcode: [''],
          paidRate: [''],
          start: [''],
          break: [''],
          finish: [''],
          hideList: [''],
          showTime: ['']
      });
        this.getStaff();
        this.getCostcentres();

        if (localStorage.getItem('currentUser')) {
            this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
        }

    }

    public getCostcentres(){
      this.data_api.getCostcentres().subscribe((data) => {
          data.forEach(data =>{ 
              this.listCostCentres.push(data)
          })
          this.initializeFilterCostcentres();
      });
    }

    public addLog(){
        // let newDetails;
        // newDetails += 'Company:';

        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Updated an Employee - Global List',
            method: 'update',
            subject: 'employee',
            subjectID: this.data.id,
            prevdata: this.prevdata,
            data: this.editForm.value,
            url: window.location.href
        }
        
        this.data_api.addActivityLog(this.userDetails.user_id,passData)
          .subscribe(
            (result) => {
              console.log(result);
              this.dialogRef.close('success');
            }
        ); 
    }

    public updateStaff() {

      if (this.editForm.invalid) {
        alert('invalid');
        return;
      }
  
      console.log(this.editForm.value);

      this.spinnerService.show();

      this.data_api.updateEmployee(this.data.id, this.editForm.value)
          .subscribe(
            (result) => {
                console.log(result);
              if(result){

                  swal.fire({
                      title: "Employee Information Updated",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-success',
                      },
                      icon: "success"
                  })

                  this.addLog();
                  
                  this.spinnerService.hide();

                  

              }else{
                swal.fire({
                    title: "Error in Updating Employee",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "error"
                })

              }
          },
          (error) => {
              console.log(error)
              swal.fire({
                  title: error.error.message,
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "error"
              })
              
          }
          
        );   

    }
    
    public changeTimeDialog(control, data): void {
      const dialogRef = this.dialog.open(ChangeTimeDialogEdit, {
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

    public getStaff(){
      this.spinnerService.show();
      this.data_api.getEmployee(this.data.id).subscribe((data) => {
              console.log(data);
              this.agentData = data;
              console.log(data);
              this.editForm.patchValue({
                employeeNo: this.agentData[0].staff_no,
                name: this.agentData[0].staff_name,
                email: this.agentData[0].staff_email,
                phone: this.agentData[0].staff_phone,
                // defaultHours: this.agentData[0].default_hours,
                defaultCostcode: this.agentData[0].default_costcode,
                paidRate: this.agentData[0].paid_rate,
                hideList: this.agentData[0].hide_list,
                showTime: this.agentData[0].show_time,
              });

              if(this.agentData[0].default_hours){
                let _defHours = JSON.parse(data[0].default_hours);
                this.editForm.patchValue({
                    start: _defHours.start,
                    break:  _defHours.break,
                    finish:  _defHours.finish
                });
              }

              this.prevdata = this.editForm.value;

              this.spinnerService.hide();
        }
      );
    }

    
  openAddCostCentresDialog(): void {
        const dialogRef = this.dialog.open(CostcentresAddDialogEdit, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result){   
                this.getCostcentres();
                this.editForm.patchValue({
                  defaultCostcode: result.toString()
                });
            }
        });
    }
}

@Component({
  selector: 'employees-deletedialog',
  templateUrl: 'employees-deletedialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})

export class EmployeesDeleteDialog implements OnInit {

  deleteFestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EmployeesDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    // this.deleteFestForm = this.formBuilder.group({
    //     // id: [''],
    //     fest_confirm: ['', Validators.required],
    // });
    
  }
}

@Component({
  selector: 'costcentres-adddialog',
  templateUrl: 'costcentres-adddialog.html',
})

export class CostcentresAddDialogEdit implements OnInit {

  addFestForm: FormGroup;
  userDetails;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CostcentresAddDialogEdit>,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }
  
  public addNewCostcentre() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addCostcentre(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Cost Centre Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.addCostLog(result);
              this.spinnerService.hide();


          }else{

            swal.fire({
                title: "Error in Creating New Cost Centre",
                // text: "You clicked the button!",
                buttonsStyling: false,
                customClass: {
                  confirmButton: 'btn btn-success',
                },
                icon: "error"
            })

            this.spinnerService.hide();

          }
      },
      (error) => {
          console.log(error)
          swal.fire({
              title: error.error.message,
              // text: "You clicked the button!",
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
          })
          
      }
      
    );  
  }

  public addCostLog(id){
      // let newDetails;
      // newDetails += 'Company:';

      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Cost Centre - Global List',
          method: 'create',
          subject: 'costcentre',
          subjectID: id,
          data: this.addFestForm.value,
          url: window.location.href
      }
      
      this.data_api.addActivityLog(this.userDetails.user_id,passData)
        .subscribe(
          (result) => {
            console.log(result);
            this.dialogRef.close(id);
          }
      ); 
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      name: ['', Validators.required],
    }, {
    });

    if (localStorage.getItem('currentUser')) {
        this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

  }
}


@Component({
  selector: 'changetime-adddialog',
  templateUrl: 'changetime-adddialog.html',
})

  export class ChangeTimeDialogEdit implements OnInit {
  
    addFestForm: FormGroup;
    mytime;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ChangeTimeDialogEdit>,
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
      console.log(this.data)
      let t = this.data; 
      let cdt = moment(t, 'hh:mm A');
      console.log(cdt.format('YYYY-MM-DD HH:mm'));
      this.mytime = cdt.format('YYYY-MM-DD HH:mm');
    }
    

}