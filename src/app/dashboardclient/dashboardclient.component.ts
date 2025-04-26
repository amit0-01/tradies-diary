
import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef, Input, Inject} from '@angular/core';
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
import { first } from 'rxjs/operators';
import { ExpandableRowComponent } from './expandable-row.component';
import { Subject } from 'rxjs';
import { createExpandableRow } from '../utils/shared-function';
import { MatDialog } from '@angular/material/dialog';
import { render } from 'ngx-color';
declare const $: any;
@Component({
  selector: 'app-dashboardclient',
  templateUrl: './dashboardclient.component.html',
  styles : [`
    :host ::ng-deep .material-icons {
    font-size: 13px;
    color: black;
  }`]
})
export class DashboardClientComponent {
  datatableOptions = {
    data: [],
    columns: [],
    destroy: true,
    searching: false
  }
  dtOptionsForVariation = {...this.datatableOptions}
  dtTriggerVariation: Subject<any> = new Subject();
  dtOptionsForSelection = {...this.datatableOptions}
  dtTriggerSelection :  Subject<any> = new Subject();
  dtOptionsForRFI =  {...this.datatableOptions}
  dtTriggerRfi: Subject<any> = new Subject();

  source: any
  // **********************+++++++++++++++++++++++++*******************
  selectionSource: any
  rfiSource: any
  // **********************+++++++++++++++++++++++++*******************
  public reportList;
  selectedMode: boolean = true;
  // This will contain selected rows
  selectedRows = [];
  filterWeeklyReports: FormGroup;
  public projectNames = [];
  public projectNamesRecVar = [];

  public siteSupervisors = [];
  public curUserID;

  public selected: any

  searchChoices = [
    {value: 'entry_date', viewValue: 'Entry Date'},
    {value: 'project_id', viewValue: 'Project'},
    // {value: 'supervisor_id', viewValue: 'Supervisor'},
    {value: 'has_image', viewValue: 'Uploaded Images'},
  ]

  imageBoolean = [
    {value: 'true', viewValue: 'Yes'},
    {value: 'false', viewValue: 'No'},
  ]
  // *************************+++++++++++++++++++++++++++++*******************
  selections: string[] = ['Variation', 'Selection', 'Rfi']
  // selectedClientData: string = 'Variation'
  // CHOOSE SELECTION
  // projectSelect(event: any) {
  //   this.selectedClientData = event.value;
  // }
  // *************************+++++++++++++++++++++++++++++*******************

  // public dashboarVariationSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   selectedRowIndex: -1,
  //   columns: {
  //     customactions: {
  //       width: '30px',
  //       title: '',
  //       type : 'html',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {          
  //         return `<a target="_blank" href="#/dashboard-variants/${row.id}"><i class="material-icons">preview</i></a>
  //                 `;
  //       }
  //     },
  //     variations_num: {
  //       title: 'Variations No.',
  //       width: '100px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.variantsNumber;
  //       }
  //     },
  //     variations_name: {
  //       title: 'Variations Name',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.variationsName;
  //       }
  //     },
  //     cost: {
  //       title: 'Cost',
  //       width: '150px',
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.variationGroupArray[0].groupTotal;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     due_date: {
  //       title: 'Due Date',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.dueDate ? row.dueDate.toDate().toDateString(): '';
  //       }
  //     },
  //     status: {
  //       title: 'Status',
  //       width: '150px',
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.status;
  //       }
  //     },
  //     created_at: {
  //       title: 'Created At',
  //       type: 'custom',
        // renderComponent: ExpandableRowComponent,
  //       filter: false,
  //       sort: false
  //     }
  //   }
  // };

  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************
   
  // public dashboardSelectionSettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   selectedRowIndex: -1,
  //   columns: {
  //     customactions: {
  //       width: '30px',
  //       title: '',
  //       type : 'html',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {          
  //         return `<a target="_blank" href="#/dashboard-selection/${row.id}"><i class="material-icons">preview</i></a>`;
  //       }
  //     },
  //     variations_num: {
  //       title: 'Selection No.',
  //       width: '100px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.selectionNumber;
  //       }
  //     },
  //     variations_name: {
  //       title: 'Selection Name',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.selectionName;
  //       }
  //     },
  //     cost: {
  //       title: 'Cost',
  //       width: '150px',
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.selectionGroupArray[0].groupTotal;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     due_date: {
  //       title: 'Due Date',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.dueDate ? row.dueDate.toDate().toDateString(): '';
  //       }
  //     },
  //     status: {
  //       title: 'Status',
  //       width: '150px',
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.status;
  //       }
  //     },
  //     created_at: {
  //       title: 'Created At',
  //       type: 'custom',
  //       renderComponent: ExpandableRowComponent, 
  //       filter: false,
  //       sort: false
  //     }
  //   }
  // };
  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************
  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************
  // public dashboardRFISettings = {
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   selectedRowIndex: -1,
  //   columns: {
  //     customactions: {
  //       width: '30px',
  //       title: '',
  //       type : 'html',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {          
  //         return `<a target="_blank" href="#/dashboard-rfi/${row.id}"><i class="material-icons">preview</i></a>
  //                 `;
  //       }
  //     },
  //     variations_num: {
  //       title: 'RFI No.',
  //       width: '100px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.rfiNumber;
  //       }
  //     },
  //     variations_name: {
  //       title: 'RFI Name',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return row.rfiName;
  //       }
  //     },
  //     project_name: {
  //       title: 'Project Name',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return this.projectNames.find(o => o.id === row.projectId)?.projectName;
  //       }
  //     },
  //     due_date: {
  //       title: 'Due Date',
  //       width: '150px',
  //       filter: false,
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.dueDate ? row.dueDate.toDate().toDateString(): '';
  //       }
  //     },
  //     status: {
  //       title: 'Status',
  //       width: '150px',
  //       sort: false,
  //       valuePrepareFunction: (cell,row) => {
  //           return row.status;
  //       }
  //     },
  //     created_at: {
  //       title: 'Created At',
  //       type: 'custom',
  //       renderComponent: ExpandableRowComponent,
  //       filter: false,
  //       sort: false
  //     }   
  //   }
  // };
  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************
  // public settings = {
  //   // selectMode: 'multi',
  //   actions: { 
  //     delete: false,
  //     add: false,
  //     edit: false,
  //     //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
  //   },
  //   pager: {
  //     display: false,
  //   },
  //   attr: {
  //     class: 'table table-bordered'
  //   },
  //   hideSubHeader: true,
  //   mode: 'external',
  //   columns: {
  //     customactions: {
  //       width: '30px',
  //       title: 'Action',
  //       type : 'html',
  //       filter: false,
  //       valuePrepareFunction: (cell,row) => {
  //         return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">edit</i></a>`;
  //       }
  //     },
  //     // id: {
  //     //   title: 'ID',
  //     //   valuePrepareFunction: (cell,row) => {
  //     //     return row.id;
  //     //   }
  //     // },
  //     project_name: {
  //       title: 'Project Name',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.project_name;
  //       }
  //     },
  //     entry_date: {
  //       title: 'Entry Date',
  //       valuePrepareFunction: (cell,row) => {
  //         return this.formatDate(row.entry_date);
  //       }
  //     },
  //     supervisor_name: {
  //       title: 'Supervisor Name',
  //       valuePrepareFunction: (cell,row) => {
  //           return row.display_name;
  //       }
  //     },
  //     lost_days_week : {
  //       title: 'Total Days Lost',
  //       valuePrepareFunction: (cell,row) => {
  //         return Math.floor( (row.lost_hours_week /8) );
  //       }
  //     },
  //     lost_hours_week : {
  //       title: 'Total Hours Lost',
  //       valuePrepareFunction: (cell,row) => {
  //           return ( (row.lost_hours_week / 8) - Math.floor( (row.lost_hours_week /8) ) ) * 8;
  //       }
  //     },
  //     image_size : {
  //       title: 'Total Size of Images',
  //       valuePrepareFunction: (cell,row) => {
  //           return this.formatBytes(row.total_file_size);
  //       }
  //     },
  //   }
  // };

  public userDetails;

  public dashboardDailyReportList = [];

  constructor(
    private data_api: DatasourceService,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private renderer2: Renderer2,
    private e: ElementRef,
    private rolechecker: RoleChecker
    ) { }

  public ngOnInit() {
      // this.rolechecker.check(3)
      // this.getWeeklyReports();
      this.filterWeeklyReports = this.formBuilder.group({
          entryDate: [''],
          projectID: [''],
          supervisorId: [''],
          hasImage: [''],
      });

      if (localStorage.getItem('currentUser')) {
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
      }
      this.getFBProjects();
      // this.getSupervisors();
      this.getClientSelection();
      this.getClientRFI();
  }
  
  // findIdFromEmail(): Promise<string | null> {
  //   return new Promise((resolve, reject) => {
  //     this.data_api.getFBUsersOrdered().subscribe((data: any) => {
  //       const user = data.find((user: any) => user.userEmail === this.userDetails.email);
  //       if (user) {
  //         resolve(user.id); // Resolve the promise with the user.id
  //       } else {
  //         resolve(null); // If no user found, resolve with null or handle as needed
  //       }
  //     }, (error) => {
  //       reject(error); // Reject the promise if there's an error in the observable
  //     });
  //   });
  // }

  async getFBRecent(){
      //  const toSearchId = await this.findIdFromEmail();
      //  console.log('tosearchid', toSearchId);
        this.data_api.getFBClientVariations(this.userDetails.user_id).pipe().subscribe(dataDailyReports => {
            // this.source = new LocalDataSource(dataDailyReports)
            if(dataDailyReports){
                this.dashboardDailyReportList = [];
                dataDailyReports.forEach(data =>{  
                    if(data){
                      if(data.status != "Draft"){
                        this.dashboardDailyReportList.push(data)
                      }
                    }
                    
                })
            }
            this.source = this.dashboardDailyReportList

            // this.source = new LocalDataSource(this.dashboardDailyReportList)
            this.getFBRecent2Variation();
        });


  }
  
  // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************
  async getClientSelection(){
    // const toSearchId = await this.findIdFromEmail();
    this.spinnerService.show();
     this.data_api.getFBClientSelections(this.userDetails.user_id).pipe().subscribe(dataDailyReports => {
         // this.source = new LocalDataSource(dataDailyReports)
         if(dataDailyReports){
             this.dashboardDailyReportList = [];
             dataDailyReports.forEach(data =>{  
                 if(data){
                   if(data.status != "Draft"){
                     this.dashboardDailyReportList.push(data)
                   }
                 }
                 
             })
         }
        //  this.selectionSource = new LocalDataSource(this.dashboardDailyReportList)
        this.selectionSource = this.dashboardDailyReportList;
         this.getFBRecent2Selection();
         this.spinnerService.hide();
     });
  }
  // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************
  // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************
  dashboardClientRFI:any[]
  async getClientRFI(){
    this.spinnerService.show();
    // const toSearchId = await this.findIdFromEmail();
     this.data_api.getFBClientRFIs(this.userDetails.user_id).pipe().subscribe(dataDailyReports => {
         // this.source = new LocalDataSource(dataDailyReports)
         if(dataDailyReports){
             this.dashboardClientRFI = [];
             dataDailyReports.forEach(data =>{  
                 if(data){
                   if(data.status != "Draft"){
                     this.dashboardClientRFI.push(data)
                   }
                 }
                 
             })
         }
        //  this.rfiSource = new LocalDataSource(this.dashboardClientRFI)
        this.rfiSource = this.dashboardClientRFI;
         this.getFBRecent2Rfi();
         this.spinnerService.hide();
     });
  }
    // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************
    dashboardDailyReportList2:any = []
    dashboardDailyReportList3:any = []

  getFBRecent2Variation(){
    // FOR VARIATION 
    if(this.projectNamesRecVar.length){
      this.projectNamesRecVar.forEach(async projectId =>{ 
          await this.data_api.getFBClientVariationsProject(projectId).pipe().subscribe(dataDailyReports2 => {      
              if(dataDailyReports2){
                //  this.dashboardDailyReportList = [];
                dataDailyReports2.forEach(data =>{  
                      if(data){
                        if(data.status != "Draft"){
                          this.dashboardDailyReportList.push(data)
                        }
                      }
                      
                  })
              }
              const mapFromColors = new Map(
                this.dashboardDailyReportList.map(c => [c.id, c])
              );
              
              const uniqueColors = [...mapFromColors.values()];
              // this.source = new LocalDataSource(uniqueColors)
              this.source.push(...uniqueColors);
              this.setTableDataForVariation(this.source);
          });
      })
    } else{
      this.setTableDataForVariation(this.source);
    }
  }

  getFBRecent2Selection(){
    // FOR SELECTION 
    if(this.projectNamesRecSel.length){
      this.projectNamesRecSel.forEach(async projectId =>{ 
          await this.data_api.getFBClientSelectionsProject(projectId).pipe().subscribe(dataDailyReports2 => {      
              if(dataDailyReports2){
                //  this.dashboardDailyReportList = [];
                dataDailyReports2.forEach(data =>{  
                      if(data){
                        if(data.status != "Draft"){
                          this.dashboardDailyReportList2.push(data)
                        }
                      }
                      
                  })
              }
              const mapFromColors = new Map(
                this.dashboardDailyReportList2.map(c => [c.id, c])
              );
              
              const uniqueColors = [...mapFromColors.values()];
              // this.selectionSource = new LocalDataSource(uniqueColors)
              this.selectionSource.push(...uniqueColors);
              this.setTableDataForSelection(this.selectionSource);
          });
      })
    } else{
      this.setTableDataForSelection(this.selectionSource);
    }
  }

  getFBRecent2Rfi(){
    // FOR RFI
    if(this.projectNamesRecRfi.length){
      this.projectNamesRecRfi.forEach(async projectId =>{ 
          await this.data_api.getFBClientRfisProject(projectId).pipe().subscribe(dataDailyReports2 => {      
              if(dataDailyReports2){
                //  this.dashboardDailyReportList = [];
                dataDailyReports2.forEach(data =>{  
                      if(data){
                        if(data.status != "Draft"){
                          this.dashboardDailyReportList3.push(data)
                        }
                      }
                      
                  })
              }
              const mapFromColors = new Map(
                this.dashboardDailyReportList3.map(c => [c.id, c])
              );
              
              const uniqueColors = [...mapFromColors.values()];
              this.rfiSource.push(...uniqueColors); 
              this.setTableDataForRfi(this.rfiSource);
              // this.rfiSource = new LocalDataSource(uniqueColors)
          });
      }) 
    }else{
      this.setTableDataForRfi(this.rfiSource);
    }
  
  }
  // SETTING DATATABEL DATA
  setTableDataForVariation(data:any){
    const uniqueData = data.filter(
      (obj, index, self) =>
        index === self.findIndex((o) => o.variantsNumber === obj.variantsNumber)
    );
    if ($.fn.dataTable.isDataTable('#variationTable')) {
      $('#variationTable').DataTable().destroy();
    }        
    this.dtOptionsForVariation.data = uniqueData
    this.dtOptionsForVariation.columns = [
      {
        title: '',
        render: (data, type, row) => {
          return `<a target="_blank" href="#/dashboard-variants/${row.id}">
                    <i class="material-icons">preview</i>
                  </a>`;
        },
        width: '30px',
        orderable: false,
        searchable: false
      },
      {
        title: 'Variations No.',
        data: 'variantsNumber',
        width: '100px',
        orderable: false,
        searchable: false
      },
      {
        title: 'Variations Name',
        data: 'variationsName',
        width: '150px',
        orderable: false,
        searchable: false
      },
      {
        title: 'Cost',
        render: (data, type, row) => {
          return row.variationGroupArray[0]?.groupTotal || '';
        },
        width: '150px',
        orderable: false
      },
      {
        title: 'Project Name',
        render: (data, type, row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName || '';
        },
        width: '150px',
        orderable: false,
        searchable: false
      },
      {
        title: 'Due Date',
        render: (data, type, row) => {
          return row.dueDate ? row.dueDate.toDate().toDateString() : '';
        },
        width: '150px',
        orderable: false,
        searchable: false
      },
      {
        title: 'Status',
        data: 'status',
        width: '150px',
        orderable: false
      },
      {
        title: 'Created At',
        data: 'createdAt',
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          createExpandableRow(cell, rowData.createdAt);
        },
        width: '150px',
        orderable: false
      }
    ];
  
    this.dtTriggerVariation.next();
  }

  
  setTableDataForSelection(data:any){
    const uniqueData = data.filter(
      (obj, index, self) =>
        index === self.findIndex((o) => o.selectionNumber === obj.selectionNumber)
    );
    if ($.fn.dataTable.isDataTable('#selectionTable')) {
      $('#selectionTable').DataTable().destroy();
    }        
    this.dtOptionsForSelection.data = uniqueData
    this.dtOptionsForSelection.columns = [
      {
        title: '',
        width: '30px',
        orderable: false,
        searchable: false,
        render: (data, type, row) => {
          return `<a target="_blank" href="#/dashboard-selection/${row.id}">
                    <i class="material-icons">preview</i>
                  </a>`;
        }
      },
      {
        title: 'Selection No.',
        width: '100px',
        orderable: false,
        searchable: false,
        data: 'selectionNumber'
      },
      {
        title: 'Selection Name',
        width: '150px',
        orderable: false,
        searchable: false,
        data: 'selectionName'
      },
      {
        title: 'Cost',
        width: '150px',
        orderable: false,
        searchable: false,
        render: (data, type, row) => {
          return row.selectionGroupArray[0]?.groupTotal || 'N/A';
        }
      },
      {
        title: 'Project Name',
        width: '150px',
        orderable: false,
        searchable: false,
        render: (data, type, row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName || 'N/A';
        }
      },
      {
        title: 'Due Date',
        width: '150px',
        orderable: false,
        searchable: false,
        render: (data, type, row) => {
          return row.dueDate ? row.dueDate.toDate().toDateString(): '';
        }
      },
      {
        title: 'Status',
        width: '150px',
        orderable: false,
        searchable: false,
        data: 'status'
      },
      {
        title: 'Created At',
        data: 'createdAt',
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          createExpandableRow(cell, rowData.createdAt);
        },
        width: '150px',
        orderable: false
      }

    ]
    this.dtTriggerSelection.next();
  }
  setTableDataForRfi(data:any){
    const uniqueData = data.filter(
      (obj, index, self) =>
        index === self.findIndex((o) => o.rfiNumber === obj.rfiNumber)
    );
    if ($.fn.dataTable.isDataTable('#rfiTable')) {
      $('#rfiTable').DataTable().destroy();
    }        
    this.dtOptionsForRFI.data = uniqueData
    this.dtOptionsForRFI.columns = [
      {
        title: '',
        width: '30px',
        render: (data, type, row) => {
          return `<a target="_blank" href="#/dashboard-rfi/${row.id}">
                    <i class="material-icons">preview</i>
                  </a>`;
        }
      },
      {
        title: 'RFI No.',
        render: (data, type, row) => {return row ? row?.rfiNumber : "";
        }
      },
      {
        title: 'RFI Name',
        render: (data, type, row) => {return row ? row.rfiName : "";}
      },
      {
        title: 'Project Name',
        render: (data, type, row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName || 'N/A';
        }
      },
      {
        title: 'Due Date',
        width: '150px',
        render: (data, type, row) => {
          return row.dueDate ? row.dueDate.toDate().toDateString(): '';
        }
      },
      {
        title: 'Status',
        width: '150px',
        data: 'status'
      },
      {
        title: 'Created At',
        data: 'createdAt',
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          createExpandableRow(cell, rowData.createdAt);
        },
        width: '150px',
        orderable: false
      }
    ]
    this.dtTriggerRfi.next();
  }
  // SETTING DATATABLE DATA CLOSE
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
  public formatBytes(bytes, decimals = 2) {
     if (bytes > 0){
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
     }else{
        return '0 Bytes';
     }
}
projectNamesRecSel = []
projectNamesRecRfi = []
getFBProjects() {
  this.spinnerService.show();
  this.data_api.getFBRecentProjects().subscribe(data => {
    let projectList = [];
    this.projectNames = [];
      if(data){
        data.forEach(data2 =>{ 
          projectList.push(data2);
          if(data2.recipientVariation){
            if(data2.recipientVariation.includes( this.userDetails.user_id)){
                this.projectNamesRecVar.push(data2.id);
            } 
            if(data2.recipientSelection.includes( this.userDetails.user_id)){
                this.projectNamesRecSel.push(data2.id);
            } 
            if(data2.recipientRFI.includes( this.userDetails.user_id)){
              this.projectNamesRecRfi.push(data2.id);
          }
          }
        })
        this.projectNames = projectList;
        this.projectNames.sort(function(a, b) {
            var textA = a.projectName.toUpperCase();
            var textB = b.projectName.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

      }
      this.getFBRecent();
      this.spinnerService.hide();
  });
}
  // public getProjects(){
  //     // this.spinnerService.show();
  //     let currentUser = JSON.parse((localStorage.getItem('currentUser')));
  //     this.curUserID = currentUser.user_id;
  //     this.data_api.getProjectsClient(this.curUserID).subscribe((data) => {
  //         data.forEach(data =>{ 
  //             this.projectNames.push(data)
  //         })
  //     });
  // }
  
  // public getSupervisors(){
  //       // this.spinnerService.show();
  //       this.data_api.getProjectSupervisors().subscribe((data) => {
  //           data.forEach(data =>{ 
  //               this.siteSupervisors.push(data)
  //           })
  //       });
  // }
  public getWeeklyReports(){
        this.spinnerService.show();
        let currentUser = JSON.parse((localStorage.getItem('currentUser')));
        this.curUserID = currentUser.user_id;
        this.data_api.getWeeklyReportsClient(this.curUserID).subscribe((data) => {
            this.source.load(data);
            this.reportList = data;
            this.spinnerService.hide();
            this.selectedMode = false;
            setTimeout(() => {
              this.disableCheckboxes();
            }, 1000);
            // this.disableCheckboxes();
        });
  }
  ngAfterViewInit() {
    /* You can call this with a timeOut because if you don't you'll only see one checkbox... the other checkboxes take some time to render and appear, which is why we wait for it */
    // setTimeout(() => {
    //   this.disableCheckboxes();
    // }, 5000);
    // this.getWeeklyReports();
  }
  public filterReports(){
    this.spinnerService.show();
      this.data_api.getClientWeeklyReportsQuery(this.curUserID, this.filterWeeklyReports.value).subscribe((data) => {
        this.source.load(data);
        this.reportList = data;
        this.spinnerService.hide();
        // this.hidePaginator = true;
        this.selectedMode = false;
        setTimeout(() => {
          this.disableCheckboxes();
        }, 1000);
        
      })
  }
  public disableCheckboxes() {
    var checkbox = this.e.nativeElement.querySelectorAll('input[type=checkbox]');
    checkbox.forEach((element, index) => {
      // /* disable the select all checkbox */
      // if (index == 0){this.renderer2.setAttribute(element, "disabled", "true");}
      /* disable the checkbox if set column is false */
      if (index >0 && this.reportList[index-1].has_image != 'true') {
        this.renderer2.setAttribute(element, "disabled", "true");
      }
    });
  }
    // UserRowSelected Event handler
    onRowSelect(event) {
      this.selectedRows = [];
      event.selected.forEach(element => {
          if(element.has_image == 'true'){
            this.selectedRows.push(element)
          }
      });
    }
  
    public deleteImages(){
      this.spinnerService.show();
      this.data_api.deleteWeeklyReportsImages(this.selectedRows).subscribe((data) => {
          swal.fire({
            title: "Images Deleted.",
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
      
    }

}
