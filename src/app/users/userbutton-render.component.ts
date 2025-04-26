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
import * as moment from 'moment';

@Component({
  template: `
    <a [routerLink]="[]" (click)="openDialog()"><i class="material-icons">edit</i></a>
    <a [routerLink]="[]" (click)="openPasswordDialog()"><i class="material-icons">vpn_key</i></a>
    <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>
  `
})
export class UserRenderComponent implements ViewCell, OnInit {

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
        const dialogRef = this.dialog.open(UserDialog, {
            width: '400px',
            data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
          
          // if(result == 'success'){   
          //     setTimeout(function(){
          //       window.location.reload();
          //     }, 1000);  
          // }
        });
    }


    openPasswordDialog(): void {
        console.log(this.renderValue);
        const dialogRef = this.dialog.open(UserPasswordDialog, {
            width: '400px',
            data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
          
            if(result){   
            }
        });
    }
    
    openDeleteDialog(): void {

      const dialogRef = this.dialog.open(UserDeleteDialog, {
          width: '400px',
          data: this.renderValue
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        
          if(result.fest_confirm=='DELETE'){ 

              console.log(result.id);
              this.spinnerService.show();   
                  console.log(result);
           
                  this.data_api.deleteFBUser(result.id).then(() => {
                            // alert(data2);   
                            // if(data2){
                            //     alert("Updated Successfully");
                            // }
                            // alert("Updated Successfully");
                            swal.fire({
                              title: "User Deleted!",
                              // text: "You clicked the button!",
                              buttonsStyling: false,
                              customClass: {
                                confirmButton: 'btn btn-success',
                              },
                              icon: "success"
                          })
                            this.spinnerService.hide();
                            //window.location.reload();
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
              
          }
      });
  }
}

@Component({
    selector: 'user-dialog',
    templateUrl: 'userdialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
export class UserDialog implements OnInit {
  
    public userData;
    editForm: FormGroup;
    pickupChoices= [
      {value: 'app_admin', viewValue: 'App Admin'},
      {value: 'project_owner', viewValue: 'Project Owner'},
      {value: 'project_worker', viewValue: 'Project Worker'},
      {value: 'project_supervisor', viewValue: 'Project Supervisor'},
    ]

    breaktimes=[
      {value: '00:00', viewValue: 'No Breaks'},
      {value: '00:15', viewValue: '15 minutes'},
      {value: '00:30', viewValue: '30 minutes'},
      {value: '00:45', viewValue: '45 minute'},
      {value: '01:00', viewValue: '1 hour'},
    ]

    adminData;
    colorBtnDefault;

    public userDetails;
    public prevdata;

    constructor(
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<UserDialog>,
      public dialog: MatDialog,
      @Inject(MAT_DIALOG_DATA) public data
      ) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
    ngOnInit() {
        console.log(this.data);
        this.getAdminSettings();

        this.editForm = this.formBuilder.group({
          // id: ['', Validators.required],
          // userName: ['', Validators.required],
          userFirstName: ['', Validators.required],
          userLastName: ['', Validators.required],
          userEmail: ['', Validators.required],
          userRole: ['', Validators.required],
          userStaffNo: [''],
          start: [''],
          break: [''],
          finish: [''],
          userShowTime: [''],
          userMobile: ['']
      });
        this.getUser();
        
        if (localStorage.getItem('currentUser')) {
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
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
    

    public getUser(){

        this.userData = this.data;
        this.editForm.patchValue({
          // id: this.userData[0].data.ID,
          // userName: this.userData[0].data.user_login,
          userFirstName: this.userData.userFirstName,
          userLastName: this.userData.userLastName,
          userEmail: this.userData.userEmail,
          userRole: this.userData.userRole,
          userStart: this.userData.start,
          userBreak:  this.userData.break,
          userFinish: this.userData.finish,
          userStaffNo: this.userData.userStaffNo,
          userShowTime: this.userData.userShowTime,
          userMobile: this.userData.userMobile ? this.userData.userMobile : '',
          // passengerList: this.passengerArray
        });

        //this.prevdata = this.editForm.value;

    }

    public addLog(){
        // let newDetails;
        // newDetails += 'Company:';

        let today = new Date();
        let passData = {
            todaysDate: today,
            log: 'Updated a User',
            method: 'update',
            subject: 'user',
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

    public updateUser() {

      if (this.editForm.invalid) {
        alert('invalid');
        return;
      }
  
      console.log(this.editForm.value);

      this.spinnerService.show();

      // let userData = {
      //     // "username": this.editForm.value.userName,
      //     "first_name": this.editForm.value.firstName,
      //     "last_name": this.editForm.value.lastName,
      //     // "email": this.editForm.value.email,
      //     "name": this.editForm.value.firstName+" "+this.editForm.value.lastName,
      //     "roles": this.editForm.value.role,
      //     "meta":
      //       {
      //         "admin_role": this.editForm.value.role,
      //         "start": this.editForm.value.start,
      //         "break": this.editForm.value.break,
      //         "finish": this.editForm.value.finish,
      //         "staff_no": this.editForm.value.staffNo,
      //         "show_time": this.editForm.value.showTime
      //       }
      // };
      // console.log(userData);
       this.data_api.updateFBUser(this.data.id, this.editForm.value).then(() => {
                  swal.fire({
                      title: "User Information Updated",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-success',
                      },
                      icon: "success"
                  })

                 // this.addLog();

                  this.spinnerService.hide();
                  this.dialogRef.close('success');
          }
        );   
    }
    
    
    public changeTimeDialog(control, data): void {
        const dialogRef = this.dialog.open(ChangeTimeDialog, {
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

    public cleanTime(data){
      if (data){

          if ( (data[0] == 'AM') || (data[0] == 'PM') ){
              return data[1] + " " + data[0];
          }else if ( (data[1] == 'AM') || (data[1] == 'PM') ){
              return data[0] + " " + data[1];
          }

      }else{
          return ''
      }
        
    }

    public cleanBreak(data){
      if (data){
        return data[0];
      }else{
        return ''
      }
    }
}
 

@Component({
  selector: 'changetime-adddialog',
  templateUrl: 'changetime-adddialog.html',
})

  export class ChangeTimeDialog implements OnInit {
  
    addFestForm: FormGroup;
    mytime;

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<ChangeTimeDialog>,
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

@Component({
  selector: 'user-password-dialog',
  templateUrl: 'userpassworddialog.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class UserPasswordDialog implements OnInit {

  public userData;
  form: FormGroup = new FormGroup({});
  submitted = false;

  adminData;
  colorBtnDefault;

  constructor(
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  ngOnInit() {
      this.getAdminSettings();
      this.form = this.formBuilder.group({
        password: ['', [Validators.required]],
        confirm_password: ['', [Validators.required]]
      }, {
        validator: ConfirmedValidator('password', 'confirm_password')
      });
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

  get f(){
    return this.form.controls;
  }

  public updatePassword() {
      if (this.form.invalid) {
        swal.fire({
          title: "Please try typing again your new password",
              // text: htmlVal,
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
        })
        return;
      }

      if (this.form.value.password.length < 6) {
        swal.fire({
          title: "Password should be at least 6 characters",
              // text: htmlVal,
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
        })
        return;
      }


      this.spinnerService.show();

      // let userData = {
      //     // "username": this.editForm.value.userName,
      //     "password": this.form.value.password,
      // };

      this.data_api.updateFBUser(this.data.id, this.form.value).then(() => {
                // swal({
                //     title: "User Password Updated",
                //     // text: "You clicked the button!",
                //     buttonsStyling: false,
                //     confirmButtonClass: "btn btn-success",
                //     type: "success"
                // }).catch(swal.noop)

                swal.fire({
                    title: "User Password Updated",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "success"
                })

                this.spinnerService.hide();

                this.dialogRef.close('success');
        
      });  
    }
}
  @Component({
    selector: 'user-deletedialog',
    templateUrl: 'user-deletedialog.html',
    providers: [
      {provide: DateAdapter, useClass: AppDateAdapter},
      {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
    ]
  })
  
  export class UserDeleteDialog implements OnInit {
  
    deleteFestForm: FormGroup;
    adminData;
    colorBtnDefault;

    constructor(
      private formBuilder: FormBuilder,
      private data_api: DatasourceService,
      public dialogRef: MatDialogRef<UserDeleteDialog>,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    ngOnInit() {
      this.getAdminSettings();

      console.log(this.data);
      // this.deleteFestForm = this.formBuilder.group({
      //     // id: [''],
      //     fest_confirm: ['', Validators.required],
      // });
      
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

  }