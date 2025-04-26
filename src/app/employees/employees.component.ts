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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import swal from 'sweetalert2';
import {EmployeesRenderComponent} from './employeesbutton-render.component';
import { ExportToCsv } from 'export-to-csv';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { RoleChecker } from '../services/role-checker.service';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import {MatSelect} from '@angular/material/select';
import * as moment from 'moment';
import { AuthenticationService } from '../shared/authentication.service';

declare const $: any;

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
})
export class EmployeesComponent implements OnInit {

  source: LocalDataSource = new LocalDataSource;
  public projectList;

  public listStaffs;

  csvRecords: any[] = [];
  header = true;

  public settings = {
    actions: { 
      delete: false,
      add: false,
      edit: false,
      //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
    },
    pager: {
      display: false,
    },
    attr: {
      class: 'table table-bordered'
    },
    hideSubHeader: true,
    mode: 'external',
    columns: {
      customactions: {
        title: 'Action',
        width: '100px',
        type : 'custom',
        filter: false,
        valuePrepareFunction: (cell, row) => row,
        renderComponent: EmployeesRenderComponent
      //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        // }
      },
      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      staff_no: {
        title: 'Employee No',
        valuePrepareFunction: (cell,row) => {
            return row.staff_no;
        }
      },
      staff_name: {
        title: 'Name',
        valuePrepareFunction: (cell,row) => {
            return row.staff_name;
        }
      },
      staff_email: {
        title: 'Email',
        valuePrepareFunction: (cell,row) => {
            return row.staff_email;
        }
      },
      staff_phone: {
        title: 'Phone',
        valuePrepareFunction: (cell,row) => {
            return row.staff_phone;
        }
      },
      default_hours: {
        title: 'Default Hours',
        valuePrepareFunction: (cell,row) => {
            return this.getDefaultHours(row.default_hours);
        }
      },
      hide_list: {
        title: 'Hide from List',
        valuePrepareFunction: (cell,row) => {
            return this.getHideValue(row.hide_list);
        }
      },
      // default_costcode: {
      //   title: 'Default Cost Code',
      //   valuePrepareFunction: (cell,row) => {
      //       return row.default_costcode;
      //   }
      // },
      // paid_rate: {
      //   title: 'Paid Rate',
      //   valuePrepareFunction: (cell,row) => {
      //       return row.paid_rate;
      //   }
      // },
    }
  };

  constructor(
    private data_api: DatasourceService,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private ngxCsvParser: NgxCsvParser,
    private rolechecker: RoleChecker,
    public authService: AuthenticationService
    ) { }

  public ngOnInit() {
    // this.validateToken();
    this.rolechecker.check(4)
      this.getStaffs();
  }

  // public validateToken(){
  //   this.spinnerService.show();
  //     this.data_api.checkToken().subscribe((data) => {
  //         console.log(data);
  //         if(data.code =='jwt_auth_valid_token'){
  //             return;
  //         }else{

  //           this.spinnerService.hide();

  //           swal.fire({
  //               title: "Session Expired.",
  //               text: "Please log in again.",
  //               buttonsStyling: false,
  //               customClass: {
  //                 confirmButton: 'btn btn-success',
  //               },
  //               icon: "error"
  //           }).then((result) => {
  //             this.authService.logout();
  //           })

  //         }
  //     },
  //     (error) =>{

  //       console.log(error);
  //       if(error.error.code == "jwt_auth_invalid_token"){
  //         this.spinnerService.hide();
  //         swal.fire({
  //             title: "Session Expired.",
  //             text: "Please log in again.",
  //             buttonsStyling: false,
  //             customClass: {
  //               confirmButton: 'btn btn-success',
  //             },
  //             icon: "error"
  //         }).then((result) => {
  //           this.authService.logout();
  //           })

  //       }else{
  //         this.spinnerService.hide();
  //         swal.fire({
  //             title: error.error.message,
  //             // text: "You clicked the button!",
  //             buttonsStyling: false,
  //             customClass: {
  //               confirmButton: 'btn btn-success',
  //             },
  //             icon: "error"
  //         })

  //       } 


  //       }
  //     );

  // }

  public getStaffs(){
        this.spinnerService.show();

        this.data_api.getEmployees().subscribe(
          
          (data) => {

                  this.source.load(data);
                  // this.projectList = data[0];
                  this.spinnerService.hide();
                  console.log(data);
                  this.listStaffs = data;
          });
  }

  public getDefaultHours(defHours){
      if(defHours){
        let _defHours = JSON.parse(defHours)
        return 'Start '+_defHours.start+'; Break: '+_defHours.break+'; Finish: '+_defHours.finish;
      }
  }

  public getHideValue(val){
      if(val == 1){
        return 'Yes';
      }else{
        return 'No';
      }
  }

  openAddDialog(): void {
      const dialogRef = this.dialog.open(EmployeesAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          if(result == 'success'){   
              setTimeout(function(){
                window.location.reload();
              }, 1000);  
          }
      });
  }

   // Your applications input change listener for the CSV File
   fileChangeListener($event: any): void {
    this.spinnerService.show();
      // Select the files from the event
      const files = $event.srcElement.files;
  
      // Parse the file you want to select for the operation along with the configuration
      this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',' })
        .pipe().subscribe((result: Array<any>) => {
  
          console.log('Result', result);
          this.csvRecords = result;

          this.data_api.importEmployees(result)
          .subscribe(
            (result2) => {
                swal.fire({
                      title: "New Employees Imported!",
                      // text: "You clicked the button!",
                      buttonsStyling: false,
                      customClass: {
                        confirmButton: 'btn btn-success',
                      },
                      icon: "success"
                  })

                  this.spinnerService.hide();
                  setTimeout(function(){
                    window.location.reload();
                  }, 1000);  

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


        }, (error: NgxCSVParserError) => {
          console.log('Error', error);
        });
  
    }

  downloadCSV(){
        let exportData=[];

        if(this.listStaffs){

            this.listStaffs.forEach(data =>{

                let tempData = {
                  employee_no: data.staff_no,
                  employee_name: data.staff_name,
                  employee_email: data.staff_email,
                  employee_phone: data.staff_phone,
                  default_hours: data.default_hours,
                  default_costcode: data.default_costcode,
                  paid_rate: data.paid_rate,
                  hide_list: data.hide_list,
                }
                exportData.push(tempData);
                // data.forEach(data2 =>{      
                //   if(data == data2.id){
                //     this.listVisitors.push({visitor_name: data2.name})  
                //   }
                // });

            });

        }

          const options = { 
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true, 
            showTitle: false,
            // title: 'My Awesome CSV',
            useTextFile: false,
            useBom: true,
            useKeysAsHeaders: true,
            filename:'employees'
            // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
          };
        
        const csvExporter = new ExportToCsv(options);
        
        csvExporter.generateCsv(exportData);
     
  }

}




@Component({
  selector: 'employees-adddialog',
  templateUrl: 'employees-adddialog.html',
})

export class EmployeesAddDialog implements OnInit {

  addFestForm: FormGroup;
  public listCostCentres:any= [];

  breaktimes=[
    {value: '00:00', viewValue: 'No Breaks'},
    {value: '00:15', viewValue: '15 minutes'},
    {value: '00:30', viewValue: '30 minutes'},
    {value: '00:45', viewValue: '45 minute'},
    {value: '01:00', viewValue: '1 hour'},
  ]

  public userDetails;

  public filter_list_costcentres: ReplaySubject<[]> = new ReplaySubject<[]>(1);

  public search_control_costcentre: FormControl = new FormControl();

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EmployeesAddDialog>,
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
  
  public addLog(id){
      // let newDetails;
      // newDetails += 'Company:';

      let today = new Date();
      let passData = {
          todaysDate: today,
          log: 'Created New Employee - Global List',
          method: 'create',
          subject: 'employee',
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

  public addNewStaff() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addEmployee(this.addFestForm.value)
      .subscribe(
        (result) => {
          if(result){

              swal.fire({
                  title: "New Employee Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })

              this.spinnerService.hide();
              this.addLog(result);
          }else{

            swal.fire({
                title: "Error in Creating New Employee",
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

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      employeeNo: [''],
      name: ['', Validators.required],
      email: [''],
      phone: [''],
      start: [''],
      break: [''],
      finish: [''],
      // defaultHours: [''],
      defaultCostcode: [''],
      paidRate: [''],
      hideList: [''],
      showTime: ['']
    }, {
    });
    this.getCostcentres();

    if (localStorage.getItem('currentUser')) {
        this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }

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

                this.addFestForm.patchValue({
                  start: result,
              });
              }else if(control == 'finish'){

                this.addFestForm.patchValue({
                  finish: result,
                });

              }
          }
      });
    
  }


  public getCostcentres(){
    this.data_api.getCostcentres().subscribe((data) => {
        data.forEach(data =>{ 
            this.listCostCentres.push(data)
        })
        this.initializeFilterCostcentres();
    });
  }

  openAddCostCentresDialog(): void {
      const dialogRef = this.dialog.open(CostcentresAddDialog, {
          width: '400px',
          // data: this.renderValue
      });

      dialogRef.afterClosed().subscribe(result => {
          console.log(result);
          if(result){   
              this.getCostcentres();
              this.addFestForm.patchValue({
                defaultCostcode: result.toString()
              });
          }
      });
  }

}


@Component({
  selector: 'costcentres-adddialog',
  templateUrl: 'costcentres-adddialog.html',
})

export class CostcentresAddDialog implements OnInit {

  addFestForm: FormGroup;
  userDetails;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CostcentresAddDialog>,
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