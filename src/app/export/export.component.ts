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
import { ExportToCsv } from 'export-to-csv';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, startWith } from 'rxjs/operators';
import {MatSelect} from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

declare const $: any;

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class ExportComponent implements OnInit {

    public listStaffs:any= [];
    public listStaffsExport:any= [];
    csvRecords: any[] = [];

    public projectNames:any= [];
    public siteSupervisors = [];
    public dailyStaffOnSite = [];
    generateExportForm: FormGroup;

    public filter_list_employees: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public filter_list_projects: ReplaySubject<[]> = new ReplaySubject<[]>(1);

    public search_control_employee: FormControl = new FormControl();
    public search_control_project: FormControl = new FormControl();

    protected _onDestroy = new Subject<void>();

    adminData;

    colorBtnDefault;

    colorHlightDefault;

    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

    constructor(
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        private rolechecker: RoleChecker,
        public datepipe: DatePipe,
        ) { }

    public ngOnInit() {
        this.getAdminSettings();
        this.generateExportForm = this.formBuilder.group({
            entryDate: [''],
            projectID: [''],
            employeeId: [''],
            dateRange: false,
            fromDate: [''],
            toDate: [''],
        });

        this.getFBProjects();
        this.getAllStaff();
        //this.getProjects();
    }

    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.adminData = data;
            this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
            this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
        }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      console.log(hoverName);
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
    }
    
    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    initializeFilterEmployees() {

        this.filter_list_employees.next(this.listStaffs.slice());

        this.search_control_employee.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.filterListEmployees();
        });
    }

    initializeFilterProjects() {

        this.filter_list_projects.next(this.projectNames.slice());

        this.search_control_project.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
            this.filterListProjects();
        });
    }

    filterListEmployees() {

          if (!this.listStaffs) {
            return;
          }
          // get the search keyword
          let search = this.search_control_employee.value;
          if (!search) {
            this.filter_list_employees.next(this.listStaffs.slice());
            return;
          } else {
            search = search.toLowerCase();
          }
          // filter the banks
          this.filter_list_employees.next(
            this.listStaffs.filter(listStaff => listStaff.staff_name.toLowerCase().indexOf(search) > -1)
          );
        
    }

    filterListProjects() {

            if (!this.projectNames) {
            return;
            }
            // get the search keyword
            let search = this.search_control_project.value;
            if (!search) {
            this.filter_list_projects.next(this.projectNames.slice());
            return;
            } else {
            search = search.toLowerCase();
            }
            // filter the banks
            this.filter_list_projects.next(
            this.projectNames.filter(projectName => projectName.projectName.toLowerCase().indexOf(search) > -1)
            );
        
    }

    // public getProjects(){
    //     this.spinnerService.show();
        
    //     this.data_api.getActiveProjects().subscribe((data) => {
    //         this.projectNames = data;
    //         console.log(this.projectNames);
    //         this.initializeFilterProjects();

    //         this.getStaffs();
    //         //this.getSupervisors();
    //     });

    // }

    getFBProjects() {
     
        this.data_api.getFBProjects().subscribe(data => {
          console.log(data);
 
            if(data){
                this.projectNames = data;
                this.initializeFilterProjects();
            }
        });
    
    }

     public getAllStaff(): void {

            this.data_api.getFBUsersOrderedFname().subscribe(data => {
              console.log(data);
    
                if(data){
                    data.forEach(data2 =>{ 
                        if(!data.password){
                            if(data2.userRole == 'project_worker' ){
                                this.listStaffs.push({id: data2.id, staff_name: data2.userFirstName + ' '+ data2.userLastName, staff_no: data2.userStaffNo, type:'user-worker'}) 
                                this.listStaffsExport.push({id: data2.id, staff_name: data2.userFirstName + ' '+ data2.userLastName, staff_no: data2.userStaffNo, type:'user-worker'}) 
                            }else if(data2.userRole == 'project_supervisor' ){
                                this.listStaffs.push({id: data2.id, staff_name: data2.userFirstName + ' '+ data2.userLastName, staff_no: data2.userStaffNo, type:'user-supervisor'})  
                                this.listStaffsExport.push({id: data2.id, staff_name: data2.userFirstName + ' '+ data2.userLastName, staff_no: data2.userStaffNo, type:'user-supervisor'})  
                            }
                        }
                    });
                    console.log(this.listStaffsExport);
                    this.initializeFilterEmployees();
                }
            });
       
      }
      

    // public getSupervisors(){
    //         // this.spinnerService.show();

    //         this.data_api.getProjectSupervisors().subscribe((data) => {

    //             if(data){

    //                     data.forEach(data2 =>{ 
    //                             console.log(data2);
    //                             this.listStaffs.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-supervisor'})  
    //                             this.listStaffsExport.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-supervisor'})  
    //                     });
    //             }      
    //             console.log(this.listStaffsExport);    
    //             this.getWorkers();   
    //         });
    // }

    // public getWorkers(){
    //     this.data_api.getProjectWorkers().subscribe((data) => {
    //     console.log(data);
    //       if(data){
 
    //             data.forEach(data2 =>{      
    //                 this.listStaffs.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-worker'})  
    //                 this.listStaffsExport.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-worker'})  
    //             });
    //       }
    //       console.log(this.listStaffsExport);
    //       this.initializeFilterEmployees();
    //       this.spinnerService.hide();
    //     });
    // }
    // public getStaffs(){

    //         this.data_api.getEmployees().subscribe((data) => {
    //             // this.projectList = data[0];
    //             console.log(data);
    //             if(data){
    //                 data.forEach(data2 =>{ 
        
    //                     //this.listStaffs.push({id: data2.id, staff_name: data2.staff_name, staff_no: data2.staff_no, type:'global'})  
    //                     this.listStaffsExport.push({id: data2.id, staff_name: data2.staff_name, staff_no: data2.staff_no, type:'global'})  
    //                 });

    //             }
    //             console.log(this.listStaffsExport);
    //             this.getSupervisors();
    //             // console.log(data);
    //             // this.listStaffs = data;

    //             // this.initializeFilterEmployees();

    //         });

            
    // }



  public cleanData(data){
    if (data){
      return data[0];
    }else{
      return ''
    }
      
  }

    public formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        // return [year, month, day].join('-');
        return [day, month, year].join('/');
    }

    public reset(){
        this.generateExportForm.reset();  
        this.generateExportForm.patchValue({
            dateRange: false
        });
        
    }

    // public filterDailyReportsbyDate(){
        
    //     let passData = {
    //         entryDate: this.generateExportForm.value.entryDate,
    //         projectID: this.generateExportForm.value.projectID,
    //         employeeId: this.generateExportForm.value.employeeId,
    //     }

    //     console.log(passData);

    //     this.data_api.filterDailyReportbyDate(passData).subscribe((data) => {

    //         console.log(data);
    //         if(data.length > 0){
    //             data.forEach(data2 =>{ 
    //                 if(data2.staff_site){
    //                     JSON.parse(data2.staff_site).forEach(data3 =>{ 
    
    //                         if(data3.taskStaffFormArray){
    
    //                             data3.taskStaffFormArray.forEach(data4 =>{ 
    
    //                                 let tempdata = {
    //                                     entry_date:  this.formatDate(data2.entry_date),
    //                                     sort_date:  new Date(data2.entry_date),
    //                                     project_id: data2.project_id,
    //                                     project_name: this.projectNames.find(x => x.id === data2.project_id)?.project_name,
    //                                     job_number: this.projectNames.find(x => x.id === data2.project_id)?.job_number,
    //                                     ...data4,
    //                                     staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data3.staffOnSite)),
    //                                     uploader: 'supervisor'
    //                                 }
    //                                if(this.generateExportForm.value.employeeId){
    //                                     if(this.generateExportForm.value.employeeId == data3.staffOnSite){
    //                                         this.dailyStaffOnSite.push(tempdata);
    //                                     }
    //                                }else{
    //                                     this.dailyStaffOnSite.push(tempdata);
    //                                } 
                                    
    
    //                             })
    
    
    //                         }
    //                     })
    
    //                 }
    //             })

    //             this.filterDailyReportsbyDate2(true);

    //             //console.log(this.dailyStaffOnSite); 
    //             // this.downloadExcel();
    //             //this.spinnerService.hide();

    //         }else{

    //             this.filterDailyReportsbyDate2(false);
    //         //     this.spinnerService.hide();
    //         //     swal.fire({
    //         //         title: "No data to export",
    //         //         // text: "You clicked the button!",
    //         //         buttonsStyling: false,
    //         //         customClass: {
    //         //           confirmButton: 'btn btn-success',
    //         //         },
    //         //         icon: "error"
    //         //     })

    //         }

    //     });
    // }

    // public filterDailyReportsbyDate2(res){

    //         let passData = {
    //             entryDate: this.generateExportForm.value.entryDate,
    //             projectID: this.generateExportForm.value.projectID,
    //             employeeId: this.generateExportForm.value.employeeId,
    //         }

    //         this.data_api.filterDailyReportbyDate2(passData).subscribe((data) => {
    //                 console.log(data)
    //                 if(data.length > 0){

    //                     data.forEach(data2 =>{ 
            
    //                         let tempdata = {
    //                             entry_date:  this.formatDate(data2.entry_date),
    //                             sort_date:  new Date(data2.entry_date),
    //                             project_id: data2.project_id,
    //                             project_name: this.projectNames.find(x => x.id === data2.project_id)?.project_name,
    //                             job_number: this.projectNames.find(x => x.id === data2.project_id)?.job_number,
    //                             staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data2.worker_id)),
    //                             start: data2.start,
    //                             finish: data2.finish,
    //                             taskDescription: this.beautifyNotes(data2.notes),
    //                             hours: this.computeTime( data2.start, data2.break, data2.finish),
    //                             uploader: 'employee',
    //                             entry_status: data2.entry_status + ' ' + (data2.modified_by ? "(modified by "+data2.modified_by+")" : "") + ' ' + (data2.modified_date ? "(updated last "+moment(data2.modified_date).format('MM/DD/YYYY')+")" : ""),
    //                             has_image: this.booleanImage(data2.has_image)
    //                         }

    //                         if(this.generateExportForm.value.employeeId){
    //                                 if(this.generateExportForm.value.employeeId == data2.worker_id){
    //                                     this.dailyStaffOnSite.push(tempdata);
    //                                 }
    //                         }else{
    //                                 this.dailyStaffOnSite.push(tempdata);
    //                         } 
                            
    //                     })
    //                     console.log(this.dailyStaffOnSite);
                        
    //                     if(this.dailyStaffOnSite){
    //                         // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
    //                         this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
    //                     }
    //                     console.log(this.dailyStaffOnSite);
    //                     this.downloadExcel();
    //                     this.spinnerService.hide();
    //                 }else{
    //                         if(res === true){
    //                             console.log(this.dailyStaffOnSite);
    //                             this.downloadExcel();
    //                             this.spinnerService.hide();
    //                         }else{
    //                             this.spinnerService.hide();
    //                             swal.fire({
    //                                 title: "No data to export",
    //                                 // text: "You clicked the button!",
    //                                 buttonsStyling: false,
    //                                 customClass: {
    //                                     confirmButton: 'btn btn-success',
    //                                 },
    //                                 icon: "error"
    //                             })
    //                         }
                            
    //                 } 

    //         });
    // }

    public filterFBDailyReportsbyDateRangeOnly(){

        let fromDate;
        let toDate;
        // let projectID = this.generateExportForm.value.projectID;
        // let employeeId = this.generateExportForm.value.employeeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRangeOnly(fromDate,toDate).subscribe(response => {
            console.log(response);
            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
            console.log(data);
            if(data.length > 0){
                data.forEach(data2 =>{ 
                    if(data2.staffFormArray){
                        data2.staffFormArray.forEach(data3 =>{ 
    
                            if(data3.taskStaffFormArray){
                                 //if(data3.staffOnSite == employeeId){

                                    data3.taskStaffFormArray.forEach(data4 =>{ 
        
                                        let tempdata = {
                                            entry_date:  moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                            sort_date:  data2.todaysDate.toDate(),
                                            project_id: data2.id,
                                            project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                            job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                            ...data4,
                                            staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data3.staffOnSite)),
                                            uploader: 'supervisor',
                                            has_image: this.booleanImage2(data2.imageUpload,data3.staffOnSite) == true ? 'Yes' : 'No'
                                        }

                                        this.dailyStaffOnSite.push(tempdata);
                                        
                                    })

                                //}
                            }
                        })
    
                    }
                })
                this.filterFBDailyReportsbyDateRangeOnly2(true);
            }else{
                this.filterFBDailyReportsbyDateRangeOnly2(false);
            }

        });
    }

    public filterFBDailyReportsbyDateRangeOnly2(res){
        console.log(this.dailyStaffOnSite);
        let fromDate;
        let toDate;
        // let projectID = this.generateExportForm.value.projectID;
        // let employeeId = this.generateExportForm.value.employeeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRangeOnly2(fromDate,toDate).subscribe(response => {
            console.log(response);
            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
            if(data.length > 0){

                    data.forEach(data2 =>{ 
                
                            let tempdata = {
                                entry_date:  moment(data2.selectedDate.toDate()).format("DD/MM/YYYY"),
                                sort_date:  data2.selectedDate.toDate(),
                                project_id: data2.projectId,
                                project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data2.workerID)),
                                start: data2.start,
                                finish: data2.finish,
                                taskDescription: this.beautifyNotes(data2.accomplishments),
                                hours: this.computeTime( data2.start, data2.break, data2.finish),
                                uploader: 'employee',
                                entry_status: '',
                                // entry_status: data2.entry_status + ' ' + (data2.modified_by ? "(modified by "+data2.modified_by+")" : "") + ' ' + (data2.modified_date ? "(updated last "+moment(data2.modified_date).format('MM/DD/YYYY')+")" : ""),
                                has_image: this.booleanImage(data2.imageUpload)
                            }

                            this.dailyStaffOnSite.push(tempdata);

                        
                    })
                    console.log(this.dailyStaffOnSite);

                    if(this.dailyStaffOnSite){
                        // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                        this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                    }
                    this.downloadExcel();
                    this.spinnerService.hide();

            }else{

                if(res === true){
                    console.log(this.dailyStaffOnSite);
                    this.downloadExcel();
                    this.spinnerService.hide();
                }else{
                    this.spinnerService.hide();
                    swal.fire({
                        title: "No data to export",
                        // text: "You clicked the button!",
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        icon: "error"
                    })
                }

            }

          });

    }

    public filterFBDailyReportsbyDateRange(){

        let fromDate;
        let toDate;
        let projectID = this.generateExportForm.value.projectID;
        let employeeId = this.generateExportForm.value.employeeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRange(projectID,fromDate,toDate,employeeId).subscribe(response => {
            console.log(response);
            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
               
            if(data.length > 0){
                data.forEach(data2 =>{ 
                    if(data2.staffFormArray){
                        data2.staffFormArray.forEach(data3 =>{ 
    
                            if(data3.taskStaffFormArray){
                                 if(data3.staffOnSite == employeeId){

                                    data3.taskStaffFormArray.forEach(data4 =>{ 
        
                                        let tempdata = {
                                            entry_date: moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                            sort_date:  data2.todaysDate.toDate(),
                                            project_id: data2.id,
                                            project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                            job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                            ...data4,
                                            staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data3.staffOnSite)),
                                            uploader: 'supervisor',
                                            has_image: this.booleanImage2(data2.imageUpload,data3.staffOnSite) == true ? 'Yes' : 'No'
                                        }

                                        this.dailyStaffOnSite.push(tempdata);
                                        
                                    })

                                }
                            }
                        })
    
                    }
                })
                this.filterFBDailyReportsbyDateRange2(true);
            }else{
                this.filterFBDailyReportsbyDateRange2(false);
            }

        });
    }

    public filterFBDailyReportsbyDateRange2(res){
       
        let fromDate;
        let toDate;
        let projectID = this.generateExportForm.value.projectID;
        let employeeId = this.generateExportForm.value.employeeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRange2(projectID,fromDate,toDate,employeeId).subscribe(response => {
            console.log(response);
            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
            if(data.length > 0){

                    data.forEach(data2 =>{ 
                
                            let tempdata = {
                                entry_date:  moment(data2.selectedDate.toDate()).format("DD/MM/YYYY"),
                                sort_date:  data2.selectedDate.toDate(),
                                project_id: data2.projectId,
                                project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data2.workerID)),
                                start: data2.start,
                                finish: data2.finish,
                                taskDescription: this.beautifyNotes(data2.accomplishments),
                                hours: this.computeTime( data2.start, data2.break, data2.finish),
                                uploader: 'employee',
                                entry_status: '',
                                // entry_status: data2.entry_status + ' ' + (data2.modified_by ? "(modified by "+data2.modified_by+")" : "") + ' ' + (data2.modified_date ? "(updated last "+moment(data2.modified_date).format('MM/DD/YYYY')+")" : ""),
                                has_image: this.booleanImage(data2.imageUpload)
                            }

                            this.dailyStaffOnSite.push(tempdata);

                        
                    })
                    console.log(this.dailyStaffOnSite);

                    if(this.dailyStaffOnSite){
                        // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                        this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                    }
                    this.downloadExcel();
                    this.spinnerService.hide();

            }else{

                if(res === true){
                    console.log(this.dailyStaffOnSite);
                    this.downloadExcel();
                    this.spinnerService.hide();
                }else{
                    this.spinnerService.hide();
                    swal.fire({
                        title: "No data to export",
                        // text: "You clicked the button!",
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        icon: "error"
                    })
                }

            }

          });

    }

    public filterFBDailyReportsbyDateRangeProjectOnOnly(){

        let fromDate;
        let toDate;
        let projectID = this.generateExportForm.value.projectID;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRangeProjectOnly(projectID,fromDate,toDate).subscribe(response => {
            console.log(response);
            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
            if(data.length > 0){
                data.forEach(data2 =>{ 
                    if(data2.staffFormArray){
                        data2.staffFormArray.forEach(data3 =>{ 
    
                            if(data3.taskStaffFormArray){

                                    data3.taskStaffFormArray.forEach(data4 =>{ 
        
                                        let tempdata = {
                                            entry_date:  moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                            sort_date:  data2.todaysDate.toDate(),
                                            project_id: data2.id,
                                            project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                            job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                            ...data4,
                                            staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data3.staffOnSite)),
                                            uploader: 'supervisor',
                                            has_image: this.booleanImage2(data2.imageUpload,data3.staffOnSite) == true ? 'Yes' : 'No'
                                        }

                                        this.dailyStaffOnSite.push(tempdata);
                                        
                                    })

                            }
                        })
    
                    }
                })
                this.filterFBDailyReportsbyDateRangeProjectOnOnly2(true);
            }else{
                this.filterFBDailyReportsbyDateRangeProjectOnOnly2(false);
            }

        });
    }

    public filterFBDailyReportsbyDateRangeProjectOnOnly2(res){
       
        let fromDate;
        let toDate;
        let projectID = this.generateExportForm.value.projectID;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRangeProjectOnly2(projectID,fromDate,toDate).subscribe(response => {
            console.log(response);
            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
            if(data.length > 0){

                    data.forEach(data2 =>{ 
                
                            let tempdata = {
                                entry_date:  moment(data2.selectedDate.toDate()).format("DD/MM/YYYY"),
                                sort_date:  data2.selectedDate.toDate(),
                                project_id: data2.projectId,
                                project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data2.workerID)),
                                start: data2.start,
                                finish: data2.finish,
                                taskDescription: this.beautifyNotes(data2.accomplishments),
                                hours: this.computeTime( data2.start, data2.break, data2.finish),
                                uploader: 'employee',
                                entry_status: '',
                                // entry_status: data2.entry_status + ' ' + (data2.modified_by ? "(modified by "+data2.modified_by+")" : "") + ' ' + (data2.modified_date ? "(updated last "+moment(data2.modified_date).format('MM/DD/YYYY')+")" : ""),
                                has_image: this.booleanImage(data2.imageUpload)
                            }

                            this.dailyStaffOnSite.push(tempdata);

                        
                    })
                    console.log(this.dailyStaffOnSite);

                    if(this.dailyStaffOnSite){
                        // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                        this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                    }
                    this.downloadExcel();
                    this.spinnerService.hide();

            }else{

                if(res === true){
                    console.log(this.dailyStaffOnSite);
                    this.downloadExcel();
                    this.spinnerService.hide();
                }else{
                    this.spinnerService.hide();
                    swal.fire({
                        title: "No data to export",
                        // text: "You clicked the button!",
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        icon: "error"
                    })
                }

            }

          });

    }

    public filterFBDailyReportsbyDateRangeWorkerOnOnly(){

        let fromDate;
        let toDate;
        let employeeId = this.generateExportForm.value.employeeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRangeWorkerOnly(fromDate,toDate, employeeId).subscribe(response => {
            console.log(response);
            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
            console.log(data);
            if(data.length > 0){
                data.forEach(data2 =>{ 
                    if(data2.staffFormArray){
                        data2.staffFormArray.forEach(data3 =>{ 
    
                            if(data3.taskStaffFormArray){
                                if(data3.staffOnSite == employeeId){
                                    data3.taskStaffFormArray.forEach(data4 =>{ 
        
                                        let tempdata = {
                                            entry_date: moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                            sort_date:  data2.todaysDate.toDate(),
                                            project_id: data2.id,
                                            project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                            job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                            ...data4,
                                            staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data3.staffOnSite)),
                                            uploader: 'supervisor',
                                            has_image: this.booleanImage2(data2.imageUpload,data3.staffOnSite) == true ? 'Yes' : 'No'
                                        }

                                        this.dailyStaffOnSite.push(tempdata);
                                        
                                    })
                                }
                            }
                        })
    
                    }
                })
                this.filterFBDailyReportsbyDateRangeWorkerOnOnly2(true);
            }else{
                this.filterFBDailyReportsbyDateRangeWorkerOnOnly2(false);
            }

        });
    }

    public filterFBDailyReportsbyDateRangeWorkerOnOnly2(res){
       
        let fromDate;
        let toDate;
        let employeeId = this.generateExportForm.value.employeeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsbyDateRangeWorkerOnly2(fromDate,toDate, employeeId).subscribe(response => {

            let data = [];
            for (let item of response.docs) {
                const itemData = item.data();
                itemData.id = item.id;
                data.push(itemData);
                // this.tableData.push(item.data());
            }
            
            if(data.length > 0){
                    data.forEach(data2 =>{ 
                
                            let tempdata = {
                                entry_date: moment(data2.selectedDate.toDate()).format("DD/MM/YYYY"),
                                sort_date:  data2.selectedDate.toDate(),
                                project_id: data2.projectId,
                                project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data2.workerID)),
                                start: data2.start,
                                finish: data2.finish,
                                taskDescription: this.beautifyNotes(data2.accomplishments),
                                hours: this.computeTime( data2.start, data2.break, data2.finish),
                                uploader: 'employee',
                                entry_status: '',
                                // entry_status: data2.entry_status + ' ' + (data2.modified_by ? "(modified by "+data2.modified_by+")" : "") + ' ' + (data2.modified_date ? "(updated last "+moment(data2.modified_date).format('MM/DD/YYYY')+")" : ""),
                                has_image: this.booleanImage(data2.imageUpload)
                            }

                            this.dailyStaffOnSite.push(tempdata);

                        
                    })
                    console.log(this.dailyStaffOnSite);

                    if(this.dailyStaffOnSite){
                        // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                        this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                    }
                    this.downloadExcel();
                    this.spinnerService.hide();

            }else{
                if(res === true){
                    console.log(this.dailyStaffOnSite);
                    this.downloadExcel();
                    this.spinnerService.hide();
                }else{
                    this.spinnerService.hide();
                    swal.fire({
                        title: "No data to export",
                        // text: "You clicked the button!",
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'btn btn-success',
                        },
                        icon: "error"
                    })
                }

            }

          });

    }

    // public filterDailyReportsbyDateRange(){
        
    //     let passData = {
    //         fromDate: this.generateExportForm.value.fromDate,
    //         toDate: this.generateExportForm.value.toDate,
    //         projectID: this.generateExportForm.value.projectID,
    //         employeeId: this.generateExportForm.value.employeeId,
    //     }

    //     console.log(passData);

    //     this.data_api.filterDailyReportbyDateRange(passData).subscribe((data) => {

    //         console.log(data);
    //         if(data.length > 0){
    //             data.forEach(data2 =>{ 
    //                 if(data2.staff_site){
    //                     JSON.parse(data2.staff_site).forEach(data3 =>{ 
    
    //                         if(data3.taskStaffFormArray){
    
    //                             data3.taskStaffFormArray.forEach(data4 =>{ 
    
    //                                 let tempdata = {
    //                                     entry_date:  this.formatDate(data2.entry_date),
    //                                     sort_date:  new Date(data2.entry_date),
    //                                     project_id: data2.project_id,
    //                                     project_name: this.projectNames.find(x => x.id === data2.project_id)?.project_name,
    //                                     job_number: this.projectNames.find(x => x.id === data2.project_id)?.job_number,
    //                                     ...data4,
    //                                     staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data3.staffOnSite)),
    //                                     uploader: 'supervisor'
    //                                 }
    //                                if(this.generateExportForm.value.employeeId){
    //                                     if(this.generateExportForm.value.employeeId == data3.staffOnSite){
    //                                         this.dailyStaffOnSite.push(tempdata);
    //                                     }
    //                                }else{
    //                                     this.dailyStaffOnSite.push(tempdata);
    //                                } 
                                    
    
    //                             })
    
    
    //                         }
    //                     })
    
    //                 }
    //             })
    //             // console.log(this.dailyStaffOnSite); 
    //             // this.downloadExcel();
    //             // this.spinnerService.hide();
    //             this.filterDailyReportsbyDateRange2(true);
    //         }else{
    //             this.filterDailyReportsbyDateRange2(false);
    //             // this.spinnerService.hide();
    //             // swal.fire({
    //             //     title: "No data to export",
    //             //     // text: "You clicked the button!",
    //             //     buttonsStyling: false,
    //             //     customClass: {
    //             //       confirmButton: 'btn btn-success',
    //             //     },
    //             //     icon: "error"
    //             // })

    //         }

    //     });
    // }

    // public filterDailyReportsbyDateRange2(res){
    //     let passData = {
    //         fromDate: this.generateExportForm.value.fromDate,
    //         toDate: this.generateExportForm.value.toDate,
    //         projectID: this.generateExportForm.value.projectID,
    //         employeeId: this.generateExportForm.value.employeeId,
    //     }

    //     this.data_api.filterDailyReportbyDateRange2(passData).subscribe((data) => {
    //         if(data.length > 0){

    //                 data.forEach(data2 =>{ 
                
    //                         let tempdata = {
    //                             entry_date:  this.formatDate(data2.entry_date),
    //                             sort_date:  new Date(data2.entry_date),
    //                             project_id: data2.project_id,
    //                             project_name: this.projectNames.find(x => x.id === data2.project_id)?.project_name,
    //                             job_number: this.projectNames.find(x => x.id === data2.project_id)?.job_number,
    //                             staff_details: Object.assign({}, this.listStaffsExport.find(o => o.id === data2.worker_id)),
    //                             start: data2.start,
    //                             finish: data2.finish,
    //                             taskDescription: this.beautifyNotes(data2.notes),
    //                             hours: this.computeTime( data2.start, data2.break, data2.finish),
    //                             uploader: 'employee',
    //                             entry_status: data2.entry_status + ' ' + (data2.modified_by ? "(modified by "+data2.modified_by+")" : "") + ' ' + (data2.modified_date ? "(updated last "+moment(data2.modified_date).format('MM/DD/YYYY')+")" : ""),
    //                             has_image: this.booleanImage(data2.has_image)
    //                         }

    //                         if(this.generateExportForm.value.employeeId){
    //                                 if(this.generateExportForm.value.employeeId == data2.worker_id){
    //                                     this.dailyStaffOnSite.push(tempdata);
    //                                 }
    //                         }else{
    //                                 this.dailyStaffOnSite.push(tempdata);
    //                         } 
                        
    //                 })
    //                 console.log(this.dailyStaffOnSite);

    //                 if(this.dailyStaffOnSite){
    //                     // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
    //                     this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
    //                 }
    //                 this.downloadExcel();
    //                 this.spinnerService.hide();

    //         }else{

    //             if(res === true){
    //                 console.log(this.dailyStaffOnSite);
    //                 this.downloadExcel();
    //                 this.spinnerService.hide();
    //             }else{
    //                 this.spinnerService.hide();
    //                 swal.fire({
    //                     title: "No data to export",
    //                     // text: "You clicked the button!",
    //                     buttonsStyling: false,
    //                     customClass: {
    //                         confirmButton: 'btn btn-success',
    //                     },
    //                     icon: "error"
    //                 })
    //             }

    //         }
    //     });  

    // }

    public computeTime(xstart, xbreak, xfinish){

        // console.log(this.taskTradeFormArray(empIndex, staffIndex).value[skillIndex].start);
  
        if( (xfinish != '') && (xstart != '') && (xbreak != '')  ){
         
            let timeFinish = moment(xfinish, 'hh:mm A').format('HH mm');
            let timeStart = moment(xstart, 'hh:mm A').format('HH mm');
            let timeBreak = moment.duration(xbreak);
  
            let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
            let diffDuration = moment.duration(diff);
            let hours =  Math.floor(diffDuration.asHours());
            let minutes = moment.utc(diff).format("mm");
            
            let convertHours = hours + ":" + minutes;
            console.log(timeBreak);
           return (moment.duration(convertHours).asHours()).toFixed(2);

        }else if( (xfinish != '') && (xstart != '') && (xbreak == '')  ){
         
            let timeFinish = moment(xfinish, 'hh:mm A').format('HH mm');
            let timeStart = moment(xstart, 'hh:mm A').format('HH mm');
            let timeBreak = 0;
  
            let diff = (moment(timeFinish, 'HH:mm').subtract(timeBreak)).diff(moment(timeStart, 'HH:mm'))
            let diffDuration = moment.duration(diff);
            let hours =  Math.floor(diffDuration.asHours());
            let minutes = moment.utc(diff).format("mm");
            
            let convertHours = hours + ":" + minutes;
            console.log(timeBreak);
            return  (moment.duration(convertHours).asHours()).toFixed(2);          
        }
  
      }

      public beautifyNotes(data) {

        if(data){
          return data.join(', '); 
        }else{
          return;
        }
            
     }

     public booleanImage(bool) {
        console.log(bool)

        if(bool.length > 0){
          console.log('Yes');
          return 'Yes';   
        }else{
          console.log('No');
          return 'No';
        }
            
     }

     public booleanImage2(imageUpload,empID): boolean {
        console.log(imageUpload)
        console.log(empID)

        let matchedUsers = imageUpload.find(o => o.imageBy === empID);

        console.log(matchedUsers);

        if(matchedUsers){
            return true;
        }else{
            return false;
        }
     }

    generateExcel() {
        this.spinnerService.show();
        if(this.generateExportForm.value.dateRange == true){
            if( this.generateExportForm.value.fromDate && this.generateExportForm.value.toDate){
                if( this.generateExportForm.value.projectID && this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRange();
                }else if( this.generateExportForm.value.projectID && !this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRangeProjectOnOnly();
                }else if( !this.generateExportForm.value.projectID && this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRangeWorkerOnOnly();
                }else if( !this.generateExportForm.value.projectID && !this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRangeOnly();
                }

            }else{
                this.spinnerService.hide();
                swal.fire({
                    title: "From Date and To Date are required.",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-success',
                    },
                    icon: "error"
                })
            }
        }else{
            if( this.generateExportForm.value.entryDate){
                if( this.generateExportForm.value.projectID && this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRange();
                }else if( this.generateExportForm.value.projectID && !this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRangeProjectOnOnly();
                }else if( !this.generateExportForm.value.projectID && this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRangeWorkerOnOnly();
                }else if( !this.generateExportForm.value.projectID && !this.generateExportForm.value.employeeId){
                    this.filterFBDailyReportsbyDateRangeOnly();
                }
            }else{
                this.spinnerService.hide();
                swal.fire({
                    title: "Date is required.",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                        confirmButton: 'btn btn-success',
                    },
                    icon: "error"
                })
            }
        }
        
    }

    downloadExcel() {
        const title = 'Timesheet';
        const header = ['Date', 'Employee \rNumber', 'Employee\nName', 'Project','Job Number', 'Payroll Code', 'Cost Item Code', 'Hours', 'Cost Type Code', 'Description', 'Uploader','Images', 'Status' ]

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Timesheet');

        let titleRow = worksheet.addRow([title]);
        titleRow.font = {family: 4, size: 16, bold: true }
        titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.mergeCells('A1:M2');

        worksheet.getColumn(1).width = 12;
        worksheet.getColumn(2).width = 10;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 30;
        worksheet.getColumn(5).width = 10;
        worksheet.getColumn(6).width = 10;
        worksheet.getColumn(7).width = 10;
        worksheet.getColumn(8).width = 10;
        worksheet.getColumn(9).width = 10;
        worksheet.getColumn(10).width = 80;
        worksheet.getColumn(11).width = 10;
        worksheet.getColumn(12).width = 10;
        worksheet.getColumn(13).width = 40;
        worksheet.addRow([]);

        //Add Header Row
        let headerRow = worksheet.addRow(header);
        headerRow.height = 30;
        headerRow.font = {size: 11, bold: true }
        // Cell Style : Fill and Border
        headerRow.eachCell((cell, number) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F1F0' },
            bgColor: { argb: 'F0F1F0' }
        }
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        cell.alignment = { wrapText: true };
        })

        var full = window.location.host
        //window.location.host is subdomain.domain.com
        var parts = full.split('.')
        var sub = parts[0]

        let exportData=[];

        if(sub == 'diary'){
            this.dailyStaffOnSite.forEach(data => {
                exportData.push([
                    data.entry_date,
                    data.staff_details.staff_no,
                    data.staff_details.staff_name,
                    data.project_name,
                    data.job_number,
                    'E100',
                    '',
                    data.hours,
                    'L',
                    data.taskDescription,
                    data.uploader,
                    data.has_image,
                    data.entry_status
                ]
                )
            });
        }else{
            this.dailyStaffOnSite.forEach(data => {
                exportData.push([
                    data.entry_date,
                    data.staff_details.staff_no,
                    data.staff_details.staff_name,
                    data.project_name,
                    data.job_number,
                    '',
                    '',
                    data.hours,
                    '',
                    data.taskDescription,
                    data.uploader,
                    data.has_image,
                    data.entry_status
                ]
                )
            });
        }
        
    
        worksheet.addRows(exportData);


        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, 'Timesheet.xlsx');
        })
        this.dailyStaffOnSite = [];
    }
    
    // downloadCSV(){
    //         let exportData=[];

    //         if(this.dailyStaffOnSite){

    //             this.dailyStaffOnSite.forEach(data =>{

    //             let tempData = {
    //                 date: data.entry_date,
    //                 employee_no: data.staff_details.staff_no,
    //                 employee_name: data.staff_details.staff_name,
    //                 project: data.project_name,
    //                 job_number: data.job_number,
    //                 payroll_code: '',
    //                 costitem_code: '',
    //                 hours: data.hours,
    //                 costtype_code: '',
    //                 description: data.taskDescription,
    //             }

    //             exportData.push(tempData);
    //                 // data.forEach(data2 =>{      
    //                 //   if(data == data2.id){
    //                 //     this.listVisitors.push({visitor_name: data2.name})  
    //                 //   }
    //                 // });

    //             });

    //         }

    //         const options = { 
    //             fieldSeparator: ',',
    //             quoteStrings: '"',
    //             decimalSeparator: '.',
    //             showLabels: true, 
    //             showTitle: false,
    //             title: 'Timesheet',
    //             useTextFile: false,
    //             useBom: true,
    //             // useKeysAsHeaders: true,
    //             filename:'employees',
    //             headers: ['Date', 'Employee Number', 'Employee Name', 'Project','Job Number', 'Payroll Code', 'Cost Item Code', 'Hours', 'Cost Type Code', 'Description'] //Won't work with useKeysAsHeaders present!
    //         };
            
    //         const csvExporter = new ExportToCsv(options);
            
    //         csvExporter.generateCsv(exportData);
        
    // }
}