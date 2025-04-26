import { Component, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalDataSource } from 'ng2-smart-table';
import { DatasourceService } from 'src/app/services/datasource.service';
import { RoleChecker } from 'src/app/services/role-checker.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-client-data',
  templateUrl: './client-data.component.html',
  styleUrls: ['./client-data.component.css']
})
export class ClientDataComponent {

  // source: LocalDataSource = new LocalDataSource;
  source: any
  // **********************+++++++++++++++++++++++++*******************
  // selectionSource: LocalDataSource = new LocalDataSource;
  selectionSource: any
  // rfiSource: LocalDataSource = new LocalDataSource;
  rfiSource: any
  dtVariationOptions:any = {};
  dtSelectionOptions: any = {};
  dtRfiOptions : any = {};
  // dtTrigger: Subject<any> = new Subject();
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
  selectedClientData: string
  // CHOOSE SELECTION
  projectSelect(event: any) {
    this.selectedClientData = event.value;
    console.log(this.selectedClientData);  // Access the selected value directly
  }
  // *************************+++++++++++++++++++++++++++++*******************

  public dashboardDailyReportSettings = {
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
      class: 'table'
    },
    hideSubHeader: true,
    mode: 'external',
    selectedRowIndex: -1,
    columns: {
      customactions: {
        width: '30px',
        title: '',
        type : 'html',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {          
          const link = `<a href="#/dashboard-variants/${row.id}"><i class="material-icons">preview</i></a>`;
          return this.sanitizer.bypassSecurityTrustHtml(link);        }
      },
      variations_num: {
        title: 'Variations No.',
        width: '100px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.variantsNumber;
        }
      },
      variations_name: {
        title: 'Variations Name',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.variationsName;
        }
      },
      project_name: {
        title: 'Project Name',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
        }
      },
      due_date: {
        title: 'Due Date',
        width: '150px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.dueDate ? row.dueDate.toDate().toDateString(): '';
        }
      },
      status: {
        title: 'Status',
        width: '150px',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.status;
        }
      },
      created_at: {
        title: 'Created At',
        width: '500px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.createdAt ? row.createdAt.toDate().toString(): '';
        }
      }   
    }
  };


  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************
   

  public dashboardSelectionSettings = {
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
      class: 'table'
    },
    hideSubHeader: true,
    mode: 'external',
    selectedRowIndex: -1,
    columns: {
      customactions: {
        width: '30px',
        title: '',
        type : 'html',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {          
          return `<a target="_blank" href="#/dashboard-selection/${row.id}"><i class="material-icons">preview</i></a>`;
        }
      },
      variations_num: {
        title: 'Selection No.',
        width: '100px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.selectionNumber;
        }
      },
      variations_name: {
        title: 'Selection Name',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.selectionName;
        }
      },
      project_name: {
        title: 'Project Name',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
        }
      },
      due_date: {
        title: 'Due Date',
        width: '150px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.dueDate ? row.dueDate.toDate().toDateString(): '';
        }
      },
      status: {
        title: 'Status',
        width: '150px',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.status;
        }
      },
      created_at: {
        title: 'Created At',
        width: '500px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.createdAt ? row.createdAt.toDate().toString(): '';
        }
      }   
    }
  };

  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************

  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************

  public dashboardRFISettings = {
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
      class: 'table'
    },
    hideSubHeader: true,
    mode: 'external',
    selectedRowIndex: -1,
    columns: {
      customactions: {
        width: '30px',
        title: '',
        type : 'html',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {          
          return `<a target="_blank" href="#/dashboard-rfi/${row.id}"><i class="material-icons">preview</i></a>
                  `;
        }
      },
      variations_num: {
        title: 'RFI No.',
        width: '100px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.rfiNumber;
        }
      },
      variations_name: {
        title: 'RFI Name',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return row.rfiName;
        }
      },
      project_name: {
        title: 'Project Name',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
        }
      },
      due_date: {
        title: 'Due Date',
        width: '150px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.dueDate ? row.dueDate.toDate().toDateString(): '';
        }
      },
      status: {
        title: 'Status',
        width: '150px',
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.status;
        }
      },
      created_at: {
        title: 'Created At',
        width: '500px',
        filter: false,
        sort: false,
        valuePrepareFunction: (cell,row) => {
            return row.createdAt ? row.createdAt.toDate().toString(): '';
        }
      }   
    }
  };
  // ***********************************************************++++++++++++++++++++++++++++++++++***********************************************************

  public settings = {
    // selectMode: 'multi',
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
        width: '30px',
        title: 'Action',
        type : 'html',
        filter: false,
        valuePrepareFunction: (cell,row) => {
          return `<a href="#/weekly-report/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        }
      },
      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      project_name: {
        title: 'Project Name',
        valuePrepareFunction: (cell,row) => {
            return row.project_name;
        }
      },
      entry_date: {
        title: 'Entry Date',
        valuePrepareFunction: (cell,row) => {
          return this.formatDate(row.entry_date);
        }
      },
      supervisor_name: {
        title: 'Supervisor Name',
        valuePrepareFunction: (cell,row) => {
            return row.display_name;
        }
      },
      lost_days_week : {
        title: 'Total Days Lost',
        valuePrepareFunction: (cell,row) => {
          return Math.floor( (row.lost_hours_week /8) );
        }
      },
      lost_hours_week : {
        title: 'Total Hours Lost',
        valuePrepareFunction: (cell,row) => {
            return ( (row.lost_hours_week / 8) - Math.floor( (row.lost_hours_week /8) ) ) * 8;
        }
      },
      image_size : {
        title: 'Total Size of Images',
        valuePrepareFunction: (cell,row) => {
            return this.formatBytes(row.total_file_size);
        }
      },
    }
  };

  // public userDetails;
  public clientId : string;

  public dashboardDailyReportList = [];
  public userDetails;


  constructor(
    private data_api: DatasourceService,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private renderer2: Renderer2,
    private e: ElementRef,
    private rolechecker: RoleChecker,
    private route : ActivatedRoute,
    private sanitizer : DomSanitizer,
    private router : Router 
    ) { 
    this.route.paramMap.subscribe(params => {
      this.clientId = params.get('id');
      console.log('id',this.clientId)
     })
    }

  public ngOnInit() {
      // this.rolechecker.check(3)
      // this.getWeeklyReports();
      if (localStorage.getItem('currentUser')) {
        this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }
      this.filterWeeklyReports = this.formBuilder.group({
          entryDate: [''],
          projectID: [''],
          supervisorId: [''],
          hasImage: [''],
      });

      // if (localStorage.getItem('currentUser')) {
      //     this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
      // }
      // console.log( this.userDetails);
      this.getFBProjects();
      // this.getSupervisors();
      this.getClientSelection();
      this.getClientRFI();
  }
  
  // findIdFromEmail(): Promise<string | null> {
  //   return new Promise((resolve, reject) => {
  //     this.data_api.getFBUsersOrdered().subscribe((data: any) => {
  //       console.log('data', data);
  //       const user = data.find((user: any) => user.userEmail === this.userDetails.email);
  //       console.log('user', user ? user.id : 'No user found');

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
       console.log('toSearchId', this.clientId)
        this.data_api.getFBClientVariations(this.clientId).pipe().subscribe(dataDailyReports => {
            console.log(dataDailyReports);
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
            // this.source = new LocalDataSource(this.dashboardDailyReportList)
            this.source = this.dashboardDailyReportList;
            this.getFBRecent2();
            // console.log(this.dashboardDailyReportList);

        });

  }

  // SET TABLE DATA FOR VARIATION
  setVariationTableData(source: any) {
    console.log('source', source);
    source.getAll().then((data: any[]) => {
      this.dtVariationOptions.data = data;
      console.log('Extracted Data:', data);
    }).catch((error: any) => {
      console.error('Error fetching data:', error);
    });
  
    // Destroy existing DataTable instance if it exists
    if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
      $('#DataTables_Table_0').DataTable().destroy();
    }
  
    // Update DataTable options
    // this.dtVariationOptions.data = source;
    console.log("this.dtoptions.data", this.dtVariationOptions.data)
    this.dtVariationOptions.columns = [ 
      {
        title: 'Actions',
        data: null,
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          // Inject dynamic values into the HTML string
          cell.innerHTML =`<a href="#/dashboard-variants/${rowData.id}"><i class="material-icons">preview</i></a>`;
        }
      },
      {
        title: 'Variations No.',
        data: 'variantsNumber', // Access the first element in the userAccounts array
      },
      {
        title: 'Variations Name',
        data: 'variationsName', // Direct property access
      },
      {
        title: 'Project Name',
        data: null,
        render : (row) =>{
          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
        }
      },
      {
        title: 'Due Date',
        data: null,
        render : (row) =>{
          return row.dueDate ? row.dueDate.toDate().toDateString(): '';
      }, // Direct property access
      },
      {
        title: 'Status',
        data: 'status', // Direct property access
      },
      {
        title: 'Created At',
        data: null,
        render : (row) =>{
          return row.createdAt ? row.createdAt.toDate().toString(): '';
      }, // Direct property access
      },

    ];
  
    // Trigger the DataTable initialization
    // this.dtTrigger.next();
  }
  

  // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************
  async getClientSelection(){
    // const toSearchId = await this.findIdFromEmail();
    console.log('toSearchId', this.clientId)
     this.data_api.getFBClientSelections(this.clientId).pipe().subscribe(dataDailyReports => {
         console.log(dataDailyReports);
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
        this.selectionSource = this.dashboardDailyReportList
         console.log('this.selectionSource', this.selectionSource)
        //  this.getFBRecent2();
         // console.log(this.dashboardDailyReportList);
     });
  }
  // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************


  setSelectionData(source:any){
    console.log('selectionsource', source);
    // Destroy existing DataTable instance if it exists
    if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
      $('#DataTables_Table_0').DataTable().destroy();
    }
  
    // Update DataTable options
    this.dtSelectionOptions.data = source;
    console.log("this.dtoptions.data", this.dtSelectionOptions.data)
    this.dtSelectionOptions.columns = [
      {
        title: 'Actions',
        data: null,
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          // Inject dynamic values into the HTML string
          cell.innerHTML =`<a target="_blank" href="#/dashboard-selection/${rowData.id}"><i class="material-icons">preview</i></a>`;
        }
      },
      {
        title: 'Selection No.',
        data: 'selectionNumber', // Access the first element in the userAccounts array
      },
      {
        title: 'Selection Name',
        data: 'selectionName', // Direct property access
      },
      {
        title: 'Project Name',
        data: null,
        render : (row) =>{
          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
        }
      },
      {
        title: 'Due Date',
        data: null,
        render : (row) =>{
          return row.dueDate ? row.dueDate.toDate().toDateString(): '';
      }, // Direct property access
      },
      {
        title: 'Status',
        data: 'status', // Direct property access
      },
      {
        title: 'Created At',
        data: null,
        render : (row) =>{
          return row.createdAt ? row.createdAt.toDate().toString(): '';
      }, // Direct property access
      },

    ];
  
  }
  // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************
  dashboardClientRFI:any[]
  async getClientRFI(){
    // const toSearchId = await this.findIdFromEmail();
    console.log('toSearchId', this.clientId)
     this.data_api.getFBClientRFIs(this.clientId).pipe().subscribe(dataDailyReports => {
         console.log(dataDailyReports);
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
         this.rfiSource = this.dashboardClientRFI
         console.log('this.source', this.rfiSource)
        //  this.getFBRecent2();
         // console.log(this.dashboardDailyReportList);
     });

  }


  // SET RFI TABLE DATA

  setRfiTableData(source:any){
    console.log('rfi', source);
    // Destroy existing DataTable instance if it exists
    if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
      $('#DataTables_Table_0').DataTable().destroy();
    }
  
    // Update DataTable options
    this.dtRfiOptions.data = source;
    console.log("this.dtoptions.data", this.dtRfiOptions.data)
    this.dtRfiOptions.columns = [
      {
        title: 'Actions',
        data: null,
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          // Inject dynamic values into the HTML string
          cell.innerHTML =`<a target="_blank" href="#/dashboard-rfi/${rowData.id}"><i class="material-icons">preview</i></a>`;
        }
      },
      {
        title: 'RFI No.',
        data: 'rfiNumber', // Access the first element in the userAccounts array
      },
      {
        title: 'RFI Name',
        data: 'rfiName', // Direct property access
      },
      {
        title: 'Project Name',
        data: null,
        render : (row) =>{
          return this.projectNames.find(o => o.id === row.projectId)?.projectName;
        }
      },
      {
        title: 'Due Date',
        data: null,
        render : (row) =>{
          return row.dueDate ? row.dueDate.toDate().toDateString(): '';
      }, // Direct property access
      },
      {
        title: 'Status',
        data: 'status', // Direct property access
      },
      {
        title: 'Created At',
        data: null,
        render : (row) =>{
          return row.createdAt ? row.createdAt.toDate().toString(): '';
      }, // Direct property access
      },

    ];
  
  }
    // ****************************************************+++++++++++++++++++++++++++++++++++++++++++++++++++*********************************************
  
  dashboardDailyReportList2:any = []
  dashboardDailyReportList3:any = []
  projectNamesRecSel = []
  projectNamesRecRfi = []
  getFBRecent2(){
     // FOR VARIATION 
     if(this.projectNamesRecVar){

      this.projectNamesRecVar.forEach(async projectId =>{ 
          console.log(projectId);

          await this.data_api.getFBClientVariationsProject(projectId).pipe().subscribe(dataDailyReports2 => {
              console.log(dataDailyReports2);
      
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

              this.source = new LocalDataSource(uniqueColors)
              this.setVariationTableData(this.source)
              console.log('this.source', this.source)
          });
      })

    }

    // FOR SELECTION 
    if(this.projectNamesRecSel){

      this.projectNamesRecSel.forEach(async projectId =>{ 
          console.log(projectId);

          await this.data_api.getFBClientSelectionsProject(projectId).pipe().subscribe(dataDailyReports2 => {
              console.log(dataDailyReports2);
      
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

              this.selectionSource = uniqueColors
              // this.setSelectionData(this.selectionSorce);
              this.setSelectionData(this.selectionSource);
          });
      })

    }

    // FOR RFI

    if(this.projectNamesRecRfi){

      this.projectNamesRecSel.forEach(async projectId =>{ 
          console.log(projectId);

          await this.data_api.getFBClientRfisProject(projectId).pipe().subscribe(dataDailyReports2 => {
              console.log(dataDailyReports2);
      
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

              this.rfiSource = uniqueColors
              this.setRfiTableData(this.rfiSource)
              // this.setRfiTableData(this.rfiSource)
              console.log('this.rfi', this.selectionSource)
          });
      })

    }
  
    // console.log(this.dashboardDailyReportList);
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



getFBProjects() {
     
  this.data_api.getFBRecentProjects().subscribe(data => {
    console.log(data);
    let projectList = [];
    this.projectNames = [];
      if(data){
        console.log('data', data)
        data.forEach(data2 =>{ 
          projectList.push(data2);

          if(data2.recipientVariation){
            if(data2.recipientVariation.includes( this.clientId)){
                this.projectNamesRecVar.push(data2.id);
            }
            if(data2.recipientSelection.includes( this.clientId)){
              this.projectNamesRecSel.push(data2.id);
          } 
          if(data2.recipientRFI.includes( this.clientId)){
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

        console.log(this.projectNames);
        console.log(this.projectNamesRecVar);

      }

      this.getFBRecent();

  });

}

  // public getProjects(){
  //     // this.spinnerService.show();
  //     let currentUser = JSON.parse((localStorage.getItem('currentUser')));
  //     this.curUserID = currentUser.user_id;

  //     this.data_api.getProjectsClient(this.curUserID).subscribe((data) => {
  //       console.log(data);
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
            console.log(this.reportList);

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
      console.log(this.filterWeeklyReports.value);

      this.data_api.getClientWeeklyReportsQuery(this.curUserID, this.filterWeeklyReports.value).subscribe((data) => {
        console.log(data);
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
      console.log(event);
      this.selectedRows = [];
      event.selected.forEach(element => {
          if(element.has_image == 'true'){
            this.selectedRows.push(element)
          }
      });
      console.log(this.selectedRows);
    }
  
    public deleteImages(){
      this.spinnerService.show();
      console.log(this.selectedRows);

      this.data_api.deleteWeeklyReportsImages(this.selectedRows).subscribe((data) => {
          console.log(data);

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

    // BACK BUTTON
    goBack(){
      this.router.navigate(['client-view']);
    }

}
