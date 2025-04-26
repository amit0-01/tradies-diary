import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Inject} from '@angular/core';
import { DatasourceService} from '../services/datasource.service';
import { LocalDataSource } from 'ng2-smart-table';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
// import {ButtonRenderComponent} from './pricebutton-render.component';
import {UserDeleteDialog, UserDialog, UserPasswordDialog, UserRenderComponent} from './userbutton-render.component';
import swal from 'sweetalert2';
import {MatDialog as MatDialog, MatDialogRef as MatDialogRef, MAT_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import { RoleChecker } from '../services/role-checker.service';
import * as moment from 'moment';
declare const $: any;
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { changeTableLimit, getTableLimit } from '../utils/shared-function';
// import { Config } from 'datatables.net';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
  })
  export class UsersComponent implements OnInit {
    dtOptions: any = {
      data: [],
      columns: [],
      destroy: true
    };
    dtTrigger: Subject<any> = new Subject();
    userSource: any;
    

    adminData;

    colorBtnDefault;
    Data: any
    currentUser
    moduleName = 'user'

    // public settings = {
    //   actions: { 
    //     delete: false,
    //     add: false,
    //     edit: false,
    //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
    //   },
    //   attr: {
    //     class: 'table table-bordered'
    //   },
    //   pager : {
    //     display : false,
    //   },
    //   hideSubHeader: true,
    //   mode: 'external',
    //   columns: {
    //     customactions: {
    //       title: 'Action',
    //       type : 'custom',
    //       width: '150px',
    //       valuePrepareFunction: (cell, row) => row,
    //         renderComponent: UserRenderComponent
    //     },
    //     UserID: {
    //       title: 'Employee No',
    //       valuePrepareFunction: (cell,row) => {
    //         return row.userStaffNo;
    //       }
    //     },
    //     DisplayName: {
    //       title: 'Full Name',
    //       valuePrepareFunction: (cell,row) => {
    //         return row.userLastName+", "+row.userFirstName;
    //       }
    //     },
    //     UserRole: {
    //       title: 'User Role',
    //       valuePrepareFunction: (cell,row) => {
    //         return this.formatUserRole(row.userRole);
    //       }
    //     },
    //     EmailAddress: {
    //       title: 'Email Address',
    //       valuePrepareFunction: (cell,row) => {
    //         return row.userEmail + " " +  (row.password ? '( invalid account - please delete )' : '' );
    //       }
    //     },
    //   }
    // };

    constructor(
      private data_api: DatasourceService,
      private formBuilder: FormBuilder,
      private spinnerService: NgxSpinnerService,
      public dialog: MatDialog,
      private rolechecker: RoleChecker,
      private http: HttpClient, 
      ) { }

    public formatUserRole(role){
        if(role == 'project_worker'){
            return "Project Worker"
        }else if(role == 'project_supervisor'){
            return "Site Supervisor"
        }else if(role == 'project_owner'){
            return "External User"
          }else if(role == 'app_admin'){
            return "Administrator"
        }
    }


    public getAllUsers(){
        this.spinnerService.show();
        this.data_api.getAllUsers().subscribe((data) => {
               
                console.log(data);
  
                this.userSource = new LocalDataSource(data)

                this.spinnerService.hide();
          }
        );
      }

      getFBUsersOrdered(): void {
      this.spinnerService.show();
      this.data_api.getFBUsersOrdered().subscribe(data => {
        console.log(data);

          if(data){

            var filtered = data.filter(function(el) { return el.userEmail != "cj@spindesign.com.au"; }); 
            // this.userSource = new LocalDataSource(filtered)
            this.userSource = filtered;

            this.setTableData(this.userSource)
            this.spinnerService.hide();

          }

      });
    }

    ngOnInit() {
      let currentUser = JSON.parse((localStorage.getItem('currentUser')));
      this.currentUser = currentUser;
      //this.rolechecker.check(4)
      //this.getAllUsers();
      this.getFBUsersOrdered();
      this.getAdminSettings();
      this.sendData();
    }

      ngAfterViewInit(): void {
      $('#DataTables_Table_0').on('length.dt', (e, settings, len) => {
        console.log('len', len)
        // this.changeTableLimit(len)
        changeTableLimit(this.data_api, this.currentUser.email, len,this.spinnerService,this.moduleName)
      });
    }
    

      setTableData(userSource:any){
          console.log('this.userSource', userSource);
          if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
            $('#DataTables_Table_0').DataTable().destroy();
          }        
          this.dtOptions.data = userSource
          this.dtOptions.columns  = [
            {
              title: 'Actions',
              data: null,
              createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
                cell.innerHTML = `
                  <a class="edit-btn" style="color: #000000; cursor:pointer;" title="Edit"><i class="material-icons">edit</i></a>
                  <a class="password-btn" style="color: #000000; cursor:pointer;" title="Change password"><i class="material-icons">vpn_key</i></a>
                  <a class="delete-btn" style="color: #000000; cursor:pointer;" title="Delete"><i class="material-icons">delete</i></a>
                `;
        
                cell.querySelector('.edit-btn')?.addEventListener('click', () => this.openDialog(rowData));
                cell.querySelector('.password-btn')?.addEventListener('click', () => this.openPasswordDialog(rowData));
                cell.querySelector('.delete-btn')?.addEventListener('click', () => this.openDeleteDialog(rowData));
              },
            },
            { title: 'Employee No', data: 'userStaffNo',
              render: (data) => {
                return data ? data : '--';
              }
             },
            { title: 'Full Name',
              data: null,
              render: (data, type, row) => {
                return `${row.userFirstName} , ${row.userLastName}`;
              }
            },
            { title: 'User Role', data: 'userRole' },
            { title: 'Email Address', data: 'userEmail' },
          ]
          this.dtTrigger.next();

          getTableLimit(this.data_api,this.currentUser.email,this.moduleName).then(res =>{
                  if(res){
                  this.dtOptions.pageLength = res;
                  this.dtTrigger.next();
                  }
            })
      }

      renderActionColumn(row): string {
        // You can return custom HTML or a component selector here
        // Add buttons or HTML to allow rendering an Angular component
        return `<a [routerLink]="[]" (click)="openDialog(row)"><i class="material-icons">edit</i></a>
                <a [routerLink]="[]" (click)="openPasswordDialog(row)"><i class="material-icons">vpn_key</i></a>
                <a [routerLink]="[]" (click)="openDeleteDialog(row)"><i class="material-icons">delete</i></a>`;
      }



          openDialog(row:any): void {
              console.log(row);
              const dialogRef = this.dialog.open(UserDialog, {
                  width: '400px',
                  data: row
              });
      
              dialogRef.afterClosed().subscribe(result => {
              
                console.log('result',result);
                // if(result == 'success'){
                //   if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
                //     $('#DataTables_Table_0').DataTable().destroy();
                //   } 
                //   this.getFBUsersOrdered();
                // }
              });
          }
      
      
          openPasswordDialog(row:any): void {
              console.log(row);
              const dialogRef = this.dialog.open(UserPasswordDialog, {
                  width: '400px',
                  data: row
              });
      
              dialogRef.afterClosed().subscribe(result => {
                
                  if(result){   
                  }
              });
          }
          
          openDeleteDialog(row: any): void {
            const dialogRef = this.dialog.open(UserDeleteDialog, {
              width: '400px',
              data: row,
            });
          
            dialogRef.afterClosed().subscribe((result) => {
              if (result?.fest_confirm === 'DELETE') {
                console.log(result.id);
                this.spinnerService.show();
          
                this.data_api.deleteFBUser(result.id).then(() => {
                  // console.log('User deleted successfully');
                  // // Filter out the deleted user
                  // this.userSource = this.userSource.filter((user) => user.id !== result.id);
                  // this.setTableData(this.userSource); 
                  // // this.getFBUsersOrdered();
                  // this.spinnerService.hide();
          
                  swal.fire({
                    title: 'User Deleted!',
                    icon: 'success',
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                  });
                });
              } else {
                swal.fire({
                  title: 'Confirmation Failed!',
                  icon: 'warning',
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-warning',
                  },
                });
              }
            });
          }

    sendData(){
      this.Data = {
        collectionName : 'users'
      }
    }
     
    results: any[] = [];
    // SEARCH
    onSearchResults(results: any[]) {
      console.log('results', results)
      if(results!=null){
      this.userSource = new LocalDataSource(results)
      } else{
        this.getFBUsersOrdered();
      }
      // this.results = results; // Set the results received from the search component
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

    openAddDialog(): void {
        const dialogRef = this.dialog.open(UserAddDialog, {
            width: '400px',
            // data: this.renderValue
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result == 'success'){   
                // setTimeout(function(){
                //   window.location.reload();
                // }, 1000);  
                // this.getFBUsersOrdered();
            }
        });
    }

}


@Component({
  selector: 'user-adddialog',
  templateUrl: 'useradddialog.html',
})

export class UserAddDialog implements OnInit {

  addFestForm: FormGroup;

  public userDetails;
  itemUserAccounts = [];
  accountFirebase;

  pickupChoices= [
    {value: 'app_admin', viewValue: 'Report Admin'},
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

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UserAddDialog>,
    public dialog: MatDialog,
    private data_api: DatasourceService,
    private spinnerService: NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  get g(){
    return this.addFestForm.controls;
  }

  public addLog(id){
      // let newDetails;
      // newDetails += 'Company:';

      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New User',
          method: 'create',
          subject: 'user',
          subjectID: id,
          data: this.addFestForm.value,
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

  public checkFBUserExist(): void {

        this.spinnerService.show();
        this.data_api.checkFBUserExist(this.addFestForm.value.userEmail).pipe(first()).subscribe(data => {
          console.log(data);

            if(data.length > 0){

              this.spinnerService.hide();

              this.addFestForm.controls['userEmail'].reset()

              swal.fire({
                  title: "Email Address already exist",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "error"
              })

          }else{

            this.spinnerService.hide();
          }
        });

  }

  public addNewUser() {
      
      if (this.addFestForm.invalid) {
        swal.fire({
          title: "Invalid form. Please fill all the fields and submit again",
              // text: htmlVal,
              buttonsStyling: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              icon: "error"
        })
        return;
      }

      if (this.addFestForm.value.password.length < 6) {
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
            
      this.itemUserAccounts.push(this.accountFirebase);
      this.addFestForm.patchValue({
          userAccounts: this.itemUserAccounts,
      });

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let userData = {
      //     "user_first_name": this.addFestForm.value.firstName,
      //     "user_last_name": this.addFestForm.value.lastName,
      //     "user_email": this.addFestForm.value.email,
      //     "user_password": this.addFestForm.value.password,
      //     "user_role": this.addFestForm.value.role,
      //     "user_start": this.addFestForm.value.start,
      //     "user_break": this.addFestForm.value.break,
      //     "user_finish": this.addFestForm.value.finish,
      //     "user_staff_no": this.addFestForm.value.staffNo,
      //     "user_show_time": this.addFestForm.value.showTime
      // };
      //console.log(userData);
      this.data_api.createUser(this.addFestForm.value).then(() => {
       console.log('Created new item successfully!');

        $.notify({
          icon: 'notifications',
          message: 'User Submitted.'
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
            setTimeout(()=>{ 
               this.spinnerService.hide();
               this.dialogRef.close('success');
            }, 3000);  
        
      });
    
    //   this.data_api.addNewUser(userData)
    //   .subscribe(
    //     (result) => {
    //       if(result){
    //         console.log(result)

    //             this.data_api.sendUserNotification(userData).subscribe((result2) => {
    //               if(result2 !== null){
    //                     console.log(result2);
    //                     swal.fire({
    //                         title: "New User Created!",
    //                         // text: "You clicked the button!",
    //                         buttonsStyling: false,
    //                         customClass: {
    //                           confirmButton: 'btn btn-success',
    //                         },
    //                         icon: "success"
    //                     })

    //                     this.addLog(result.id);

    //                     this.spinnerService.hide();
                        
    //                 }
    //             });


    //       }else{
    //         swal.fire({
    //             title: "Error in Creating New User",
    //             // text: "You clicked the button!",
    //             buttonsStyling: false,
    //             customClass: {
    //               confirmButton: 'btn btn-success',
    //             },
    //             icon: "error"
    //         })
    //         this.spinnerService.hide();
    //       }
    //   },
    //   (error) => {
    //       console.log(error)
    //       swal.fire({
    //           title: error.error.message,
    //           // text: "You clicked the button!",
    //           buttonsStyling: false,
    //           customClass: {
    //             confirmButton: 'btn btn-success',
    //           },
    //           icon: "error"
    //       })
    //       this.spinnerService.hide();
    //   }
      
    // );  
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      // userName: ['', Validators.required],
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$') ]],
      userRole: ['', Validators.required],
      userShowTime: [''],
      userStart: [''],
      userBreak: [''],
      userFinish: [''],
      userStaffNo: [''],
      userAccounts: [this.itemUserAccounts],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required],
      emailHeaderNewUser: [''],
      accountFirebase: [''],
      userMobile: [''],
      textSignature: [''],
      emailSignature: [''],
    }, {
      validator: ConfirmedValidator('password', 'confirm_password')
    });
    
    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }
    
    this.getAdminSettings();
    this.accountFirebase = this.data_api.getCurrentProject();
  }


  getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          console.log(data);
          this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
          if(data){
            if(data.logo){
              this.addFestForm.patchValue({
                emailHeaderNewUser: data.logo,
              });
            }
            if(data.textSignature){
              this.addFestForm.patchValue({
                textSignature: data.textSignature
              });
            }

            if(data.emailSignature){
              this.addFestForm.patchValue({
                emailSignature: data.emailSignature
              });
            }

            this.addFestForm.patchValue({
              accountFirebase: this.accountFirebase,
            });

          }
      }); 
  }

  onButtonEnter(hoverName: HTMLElement) {
    hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
    console.log(hoverName);
  }

  onButtonOut(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
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

              this.addFestForm.patchValue({
                userStart: result,
            });
            }else if(control == 'finish'){

              this.addFestForm.patchValue({
                userFinish: result,
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