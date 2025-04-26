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
  selector: 'app-exporttrades',
  templateUrl: './export-trades.component.html',
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class ExportTradesComponent implements OnInit {

    public listTrades:any= [];
    public listTradesExport:any= [];
    csvRecords: any[] = [];

    public projectNames:any= [];
    public siteSupervisors = [];
    public dailyStaffOnSite = [];
    generateExportForm: FormGroup;

    public filter_list_trades: ReplaySubject<[]> = new ReplaySubject<[]>(1);
    public filter_list_projects: ReplaySubject<[]> = new ReplaySubject<[]>(1);

    public search_control_trade: FormControl = new FormControl();
    public search_control_project: FormControl = new FormControl();

    protected _onDestroy = new Subject<void>();

    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

    adminData;

    colorBtnDefault;
    colorHlightDefault

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
            tradeId: [''],
            dateRange: false,
            fromDate: [''],
            toDate: [''],
        });

        
        this.getFBProjects();
        this.getFBAllTrades();
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

        this.filter_list_trades.next(this.listTrades.slice());

        this.search_control_trade.valueChanges
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

          if (!this.listTrades) {
            return;
          }
          // get the search keyword
          let search = this.search_control_trade.value;
          if (!search) {
            this.filter_list_trades.next(this.listTrades.slice());
            return;
          } else {
            search = search.toLowerCase();
          }
          // filter the banks
          this.filter_list_trades.next(
            this.listTrades.filter(listTrade => listTrade.company_name.toLowerCase().indexOf(search) > -1)
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

    getFBProjects() {
     
        this.data_api.getFBProjects().subscribe(data => {
          console.log(data);
 
            if(data){
                this.projectNames = data;
                this.initializeFilterProjects();
            }
        });
    
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
    public getFBAllTrades(){
        
        this.data_api.getFBAllTrades().subscribe(data => {
            
            console.log(data);
      
            if(data){

                data.sort(function(a, b) {
                    var textA = a.tradeCompanyName.toUpperCase();
                    var textB = b.tradeCompanyName.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                
                data.forEach(data2 =>{ 
                    this.listTrades.push({id: data2.id, company_name: data2.tradeCompanyName})  
                    this.listTradesExport.push({id: data2.id, company_name: data2.tradeCompanyName, trade_staff: data2.staffFormArray})   
                });
            }
            this.initializeFilterEmployees();

        });

    }

    // public getStaffs(){

    //         this.data_api.getTrades().subscribe((data) => {
    //             // this.projectList = data[0];
    //             console.log(data);
    //             if(data){
    //                 data.forEach(data2 =>{ 
        
    //                     this.listTrades.push({id: data2.id, company_name: data2.company_name, type:'global'})  
    //                     this.listTradesExport.push({id: data2.id, company_name: data2.company_name, trade_staff: data2.trade_staff, type:'global'})  

    //                 });

    //             }
    //             console.log(this.listTradesExport);
    //             //this.getSupervisors();
    //             // console.log(data);
    //             // this.listTrades = data;

    //             this.initializeFilterEmployees();

    //         });

            
    // }

    // public getSupervisors(){
    //         // this.spinnerService.show();

    //         this.data_api.getProjectSupervisors().subscribe((data) => {

    //             if(data){

    //                     data.forEach(data2 =>{ 
    //                             console.log(data2);
    //                             this.listTrades.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-supervisor'})  
    //                             this.listTradesExport.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-supervisor'})  
    //                     });
    //             }      
    //             console.log(this.listTradesExport);    
    //             this.getWorkers();   
    //         });
    // }


//     public getWorkers(){
//         this.data_api.getProjectWorkers().subscribe((data) => {
//         console.log(data);
//           if(data){
 
//                 data.forEach(data2 =>{      
//                     this.listTrades.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-worker'})  
//                     this.listTradesExport.push({id: data2.user_email, staff_name: data2.name, staff_no: this.cleanData(data2.meta.staff_no), type:'user-worker'})  
//                 });
//           }
//           console.log(this.listTradesExport);
//           this.initializeFilterEmployees();
//           this.spinnerService.hide();
//         });
//   }

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
    //         tradeId: this.generateExportForm.value.tradeId,
    //     }

    //     console.log(passData);

    //     this.data_api.filterDailyReportTradebyDate(passData).subscribe((data) => {

    //         console.log(data);
    //         if(data.length > 0){

    //             data.forEach(data2 =>{ 
                    
    //                 if(data2.trades_site){

    //                     JSON.parse(data2.trades_site).forEach(data3 =>{ 
    //                         console.log(data3); //data3.tradesOnSite
    //                         if(data3.tradeStaffFormArray){

    //                             data3.tradeStaffFormArray.forEach(data4 =>{ 
    //                                 console.log(data4)
    //                                 if(data4.taskTradeFormArray){
                                       
    //                                     data4.taskTradeFormArray.forEach(data5 =>{ 
    //                                         console.log(data5);
    //                                         let compdetails = this.listTradesExport.find(o => o.id === data3.tradesOnSite);
    //                                         let staffdetails = JSON.parse(compdetails.trade_staff).find(o => o.staffID === data4.staffOnSite);
    //                                         if(staffdetails){
    //                                             staffdetails = staffdetails.staffName;
    //                                         }
    //                                         let tempdata = {
    //                                             entry_date:  this.formatDate(data2.entry_date),
    //                                             sort_date:  new Date(data2.entry_date),
    //                                             project_id: data2.project_id,
    //                                             project_name: this.projectNames.find(x => x.id === data2.project_id)?.project_name,
    //                                             job_number: this.projectNames.find(x => x.id === data2.project_id)?.job_number,
    //                                             ...data5,
    //                                             company_details: compdetails,
    //                                             staff_details: staffdetails
    //                                         }
    //                                         if(this.generateExportForm.value.tradeId){
    //                                                 if(this.generateExportForm.value.tradeId == data3.tradesOnSite){
    //                                                     this.dailyStaffOnSite.push(tempdata);
    //                                                 }
    //                                         }else{
    //                                                 this.dailyStaffOnSite.push(tempdata);
    //                                         } 
                                                
            
    //                                     })

    //                                 }
    //                             })
    //                         }


    //                     })
    
    //                 }
    //             })

    //             if(this.dailyStaffOnSite){
    //                 // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
    //                 this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
    //             }
    //             console.log(this.dailyStaffOnSite);
    //             this.downloadExcel();
    //             this.spinnerService.hide();

    //             //this.filterDailyReportsbyDate2(true);

    //             //console.log(this.dailyStaffOnSite); 
    //             // this.downloadExcel();
    //             //this.spinnerService.hide();

    //         }else{

    //             //this.filterDailyReportsbyDate2(false);
    //             this.spinnerService.hide();
    //             swal.fire({
    //                 title: "No data to export",
    //                 // text: "You clicked the button!",
    //                 buttonsStyling: false,
    //                 customClass: {
    //                   confirmButton: 'btn btn-success',
    //                 },
    //                 icon: "error"
    //             })

    //         }

    //     });
    // }

    public filterFBDailyReportsbyDateRangeTradeOnOnly(){

        let fromDate;
        let toDate;

        let tradeId = this.generateExportForm.value.tradeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsTradebyDateRangeTradeOnly(fromDate,toDate,tradeId).subscribe(response => {
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

                    if(data2.tradeFormArray){

                        data2.tradeFormArray.forEach(data3 =>{ 

                            if(data3.tradeStaffFormArray){

                                data3.tradeStaffFormArray.forEach(data4 =>{ 

                                        if(data4.taskTradeFormArray){
                
                                                data4.taskTradeFormArray.forEach(data5 =>{ 
                                                    
                                                    console.log(data5);
                                                    let compdetails = this.listTradesExport.find(o => o.id === data3.tradesOnSite);
                                                    let staffdetails = compdetails.trade_staff.find(o => o.staffID === data4.staffOnSite);
                                                    if(staffdetails){
                                                        staffdetails = staffdetails.staffName;
                                                    }
                                                    let tempdata = {
                                                        entry_date: moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                                        sort_date:  data2.todaysDate.toDate(),
                                                        project_id: data2.projectId,
                                                        project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                                        job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                                        ...data5,
                                                        company_details: compdetails,
                                                        staff_details: staffdetails
                                                    }
                                                    if(this.generateExportForm.value.tradeId){
                                                            if(this.generateExportForm.value.tradeId == data3.tradesOnSite){
                                                                this.dailyStaffOnSite.push(tempdata);
                                                            }
                                                    }else{
                                                            this.dailyStaffOnSite.push(tempdata);
                                                    } 
                                                        
                    
                                                })
                    
                
                                        }

                                })

                            }

                        })
    
                    }
                })

                if(this.dailyStaffOnSite){
                    // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                    this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                }
                console.log(this.dailyStaffOnSite);
                this.downloadExcel();
                this.spinnerService.hide();

            }else{
            //     this.filterDailyReportsbyDateRange2(false);
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
        })
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

        this.data_api.filterFBDailyReportsTradebyDateRangeProjectOnly(projectID,fromDate,toDate).subscribe(response => {
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

                    if(data2.tradeFormArray){

                        data2.tradeFormArray.forEach(data3 =>{ 

                            if(data3.tradeStaffFormArray){

                                data3.tradeStaffFormArray.forEach(data4 =>{ 

                                        if(data4.taskTradeFormArray){
                
                                                data4.taskTradeFormArray.forEach(data5 =>{ 
                                                    
                                                    console.log(data5);
                                                    let compdetails = this.listTradesExport.find(o => o.id === data3.tradesOnSite);
                                                    let staffdetails = compdetails.trade_staff.find(o => o.staffID === data4.staffOnSite);
                                                    if(staffdetails){
                                                        staffdetails = staffdetails.staffName;
                                                    }
                                                    let tempdata = {
                                                        entry_date: moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                                        sort_date:  data2.todaysDate.toDate(),
                                                        project_id: data2.projectId,
                                                        project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                                        job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                                        ...data5,
                                                        company_details: compdetails,
                                                        staff_details: staffdetails
                                                    }
                                                    if(this.generateExportForm.value.tradeId){
                                                            if(this.generateExportForm.value.tradeId == data3.tradesOnSite){
                                                                this.dailyStaffOnSite.push(tempdata);
                                                            }
                                                    }else{
                                                            this.dailyStaffOnSite.push(tempdata);
                                                    } 
                                                        
                    
                                                })
                    
                
                                        }

                                })

                            }

                        })
    
                    }
                })

                if(this.dailyStaffOnSite){
                    // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                    this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                }
                console.log(this.dailyStaffOnSite);
                this.downloadExcel();
                this.spinnerService.hide();

            }else{
            //     this.filterDailyReportsbyDateRange2(false);
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
        })
    }

    public filterFBDailyReportsbyDateRange(){

        let fromDate;
        let toDate;
        let projectID = this.generateExportForm.value.projectID;
        let tradeId = this.generateExportForm.value.tradeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsTradebyDateRange(projectID,fromDate,toDate,tradeId).subscribe(response => {
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

                    if(data2.tradeFormArray){

                        data2.tradeFormArray.forEach(data3 =>{ 

                            if(data3.tradeStaffFormArray){

                                data3.tradeStaffFormArray.forEach(data4 =>{ 

                                        if(data4.taskTradeFormArray){
                
                                                data4.taskTradeFormArray.forEach(data5 =>{ 
                                                    
                                                    console.log(data5);
                                                    let compdetails = this.listTradesExport.find(o => o.id === data3.tradesOnSite);
                                                    let staffdetails = compdetails.trade_staff.find(o => o.staffID === data4.staffOnSite);
                                                    if(staffdetails){
                                                        staffdetails = staffdetails.staffName;
                                                    }
                                                    let tempdata = {
                                                        entry_date: moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                                        sort_date:  data2.todaysDate.toDate(),
                                                        project_id: data2.projectId,
                                                        project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                                        job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                                        ...data5,
                                                        company_details: compdetails,
                                                        staff_details: staffdetails
                                                    }
                                                    if(this.generateExportForm.value.tradeId){
                                                            if(this.generateExportForm.value.tradeId == data3.tradesOnSite){
                                                                this.dailyStaffOnSite.push(tempdata);
                                                            }
                                                    }else{
                                                            this.dailyStaffOnSite.push(tempdata);
                                                    } 
                                                        
                    
                                                })
                    
                
                                        }

                                })

                            }

                        })
    
                    }
                })

                if(this.dailyStaffOnSite){
                    // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                    this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                }
                console.log(this.dailyStaffOnSite);
                this.downloadExcel();
                this.spinnerService.hide();

            }else{
            //     this.filterDailyReportsbyDateRange2(false);
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
        })
    }


    public filterFBDailyReportsbyDateRangeOnly(){

        let fromDate;
        let toDate;
        // let projectID = this.generateExportForm.value.projectID;
        // let tradeId = this.generateExportForm.value.tradeId;

        if(this.generateExportForm.value.dateRange == true){
            fromDate = this.generateExportForm.value.fromDate;
            toDate = this.generateExportForm.value.toDate;
        }else{
            fromDate = this.generateExportForm.value.entryDate;
            toDate = this.generateExportForm.value.entryDate;
        }

        this.data_api.filterFBDailyReportsTradebyDateRangeOnly(fromDate,toDate).subscribe(response => {
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

                    if(data2.tradeFormArray){

                        data2.tradeFormArray.forEach(data3 =>{ 

                            if(data3.tradeStaffFormArray){

                                data3.tradeStaffFormArray.forEach(data4 =>{ 

                                        if(data4.taskTradeFormArray){
                
                                                data4.taskTradeFormArray.forEach(data5 =>{ 
                                                    
                                                    console.log(data3);
                                                    let compdetails = this.listTradesExport.find(o => o.id === data3.tradesOnSite);
                                                    console.log(compdetails);
                                                    let staffdetails = compdetails.trade_staff.find(o => o.staffID === data4.staffOnSite);
                                                    console.log(staffdetails);
                                                    if(staffdetails){
                                                        staffdetails = staffdetails.staffName;
                                                    }
                                                    let tempdata = {
                                                        entry_date: moment(data2.todaysDate.toDate()).format("DD/MM/YYYY"),
                                                        sort_date:  data2.todaysDate.toDate(),
                                                        project_id: data2.projectId,
                                                        project_name: this.projectNames.find(x => x.id === data2.projectId)?.projectName,
                                                        job_number: this.projectNames.find(x => x.id === data2.projectId)?.jobNumber,
                                                        ...data5,
                                                        company_details: compdetails,
                                                        staff_details: staffdetails
                                                    }
                                                    if(this.generateExportForm.value.tradeId){
                                                            if(this.generateExportForm.value.tradeId == data3.tradesOnSite){
                                                                this.dailyStaffOnSite.push(tempdata);
                                                            }
                                                    }else{
                                                            this.dailyStaffOnSite.push(tempdata);
                                                    } 
                                                        
                    
                                                })
                    
                
                                        }

                                })

                            }

                        })
    
                    }
                })

                if(this.dailyStaffOnSite){
                    // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
                    this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
                }
                console.log(this.dailyStaffOnSite);
                this.downloadExcel();
                this.spinnerService.hide();

            }else{
            //     this.filterDailyReportsbyDateRange2(false);
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
        })
    }

    // public filterDailyReportsbyDateRange(){
        
    //     let passData = {
    //         fromDate: this.generateExportForm.value.fromDate,
    //         toDate: this.generateExportForm.value.toDate,
    //         projectID: this.generateExportForm.value.projectID,
    //         tradeId: this.generateExportForm.value.tradeId,
    //     }

    //     console.log(passData);

    //     this.data_api.filterDailyReportTradebyDateRange(passData).subscribe((data) => {

    //         console.log(data);
    //         if(data.length > 0){

    //             data.forEach(data2 =>{ 

    //                 if(data2.trades_site){

    //                     JSON.parse(data2.trades_site).forEach(data3 =>{ 

    //                         if(data3.tradeStaffFormArray){

    //                             data3.tradeStaffFormArray.forEach(data4 =>{ 

    //                                     if(data4.taskTradeFormArray){
                
    //                                             data4.taskTradeFormArray.forEach(data5 =>{ 
                                                    
    //                                                 console.log(data5);
    //                                                 let compdetails = this.listTradesExport.find(o => o.id === data3.tradesOnSite);
    //                                                 let staffdetails = JSON.parse(compdetails.trade_staff).find(o => o.staffID === data4.staffOnSite);
    //                                                 if(staffdetails){
    //                                                     staffdetails = staffdetails.staffName;
    //                                                 }
    //                                                 let tempdata = {
    //                                                     entry_date:  this.formatDate(data2.entry_date),
    //                                                     sort_date:  new Date(data2.entry_date),
    //                                                     project_id: data2.project_id,
    //                                                     project_name: this.projectNames.find(x => x.id === data2.project_id)?.project_name,
    //                                                     job_number: this.projectNames.find(x => x.id === data2.project_id)?.job_number,
    //                                                     ...data5,
    //                                                     company_details: compdetails,
    //                                                     staff_details: staffdetails
    //                                                 }
    //                                                 if(this.generateExportForm.value.tradeId){
    //                                                         if(this.generateExportForm.value.tradeId == data3.tradesOnSite){
    //                                                             this.dailyStaffOnSite.push(tempdata);
    //                                                         }
    //                                                 }else{
    //                                                         this.dailyStaffOnSite.push(tempdata);
    //                                                 } 
                                                        
                    
    //                                             })
                    
                
    //                                     }

    //                             })

    //                         }

    //                     })
    
    //                 }
    //             })

    //             if(this.dailyStaffOnSite){
    //                 // this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => b.sort_date - a.sort_date) // newest to oldest
    //                 this.dailyStaffOnSite = this.dailyStaffOnSite.sort((a, b) => a.sort_date - b.sort_date)  // oldest to newest
    //             }
    //             console.log(this.dailyStaffOnSite);
    //             this.downloadExcel();
    //             this.spinnerService.hide();

    //             // console.log(this.dailyStaffOnSite); 
    //             // this.downloadExcel();
    //             // this.spinnerService.hide();
    //         //     this.filterDailyReportsbyDateRange2(true);
    //         }else{
    //         //     this.filterDailyReportsbyDateRange2(false);
    //             this.spinnerService.hide();
    //             swal.fire({
    //                 title: "No data to export",
    //                 // text: "You clicked the button!",
    //                 buttonsStyling: false,
    //                 customClass: {
    //                   confirmButton: 'btn btn-success',
    //                 },
    //                 icon: "error"
    //             })

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
    //                             staff_details: Object.assign({}, this.listTradesExport.find(o => o.id === data2.worker_id)),
    //                             start: data2.start,
    //                             finish: data2.finish,
    //                             taskDescription: this.beautifyNotes(data2.notes),
    //                             hours: this.computeTime( data2.start, data2.break, data2.finish),
    //                             uploader: 'employee'
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
          return JSON.parse(data).join(', ');;    
        }else{
          return;
        }
            
    }

    generateExcel() {        
        
        this.spinnerService.show();
        if(this.generateExportForm.value.dateRange == true){
            if( this.generateExportForm.value.fromDate && this.generateExportForm.value.toDate){
                if( this.generateExportForm.value.projectID && this.generateExportForm.value.tradeId){
                    this.filterFBDailyReportsbyDateRange();
                }else if( this.generateExportForm.value.projectID && !this.generateExportForm.value.tradeId){
                    this.filterFBDailyReportsbyDateRangeProjectOnOnly();
                }else if( !this.generateExportForm.value.projectID && this.generateExportForm.value.tradeId){
                    this.filterFBDailyReportsbyDateRangeTradeOnOnly();
                }else if( !this.generateExportForm.value.projectID && !this.generateExportForm.value.tradeId){
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
                if( this.generateExportForm.value.projectID && this.generateExportForm.value.tradeId){
                    this.filterFBDailyReportsbyDateRange();
                }else if( this.generateExportForm.value.projectID && !this.generateExportForm.value.tradeId){
                    this.filterFBDailyReportsbyDateRangeProjectOnOnly();
                }else if( !this.generateExportForm.value.projectID && this.generateExportForm.value.tradeId){
                    this.filterFBDailyReportsbyDateRangeTradeOnOnly();
                }else if( !this.generateExportForm.value.projectID && !this.generateExportForm.value.tradeId){
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
        // this.spinnerService.show();
        // if(this.generateExportForm.value.dateRange == true){
        //     this.filterDailyReportsbyDateRange();
        // }else{
        //     this.filterDailyReportsbyDate();
        // }
    }



    downloadExcel() {
        const title = 'Timesheet';
        const header = ['Date', 'Company \Name', 'Employee\nName', 'Project','Job Number', 'Hours','Description']

        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Timesheet');

        let titleRow = worksheet.addRow([title]);
        titleRow.font = {family: 4, size: 16, bold: true }
        titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.mergeCells('A1:K2');

        worksheet.getColumn(1).width = 12;
        worksheet.getColumn(2).width = 30;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 30;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 10;
        worksheet.getColumn(7).width = 80;
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

        if(sub == 'dcb'){
            this.dailyStaffOnSite.forEach(data => {
                exportData.push([
                    data.entry_date,
                    data.company_details.company_name,
                    data.staff_details,
                    data.project_name,
                    data.job_number,
                    data.hours,
                    data.taskDescription
                ]
                )
            });
        }else{
            this.dailyStaffOnSite.forEach(data => {
                exportData.push([
                    data.entry_date,
                    data.company_details.company_name,
                    data.staff_details,
                    data.project_name,
                    data.job_number,
                    data.hours,
                    data.taskDescription
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