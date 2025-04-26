import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject} from '@angular/core';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../../services/format-datepicker';
import { DatasourceService } from '../../services/datasource.service';
import { PdfImage } from '../../services/pdf-image';
import { PreviewImage } from '../../services/preview-image';
import { Observable, Observer } from "rxjs";
import swal from 'sweetalert2';
// import * as Chartist from 'chartist';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { LocalDataSource } from 'ng2-smart-table';
import { Input } from '@angular/core';
//import * as $$ from 'jQuery';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthenticationService } from '../../shared/authentication.service';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
import { MatChipInputEvent} from '@angular/material/chips';
import {ActivatedRoute, Params, Router} from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {ENTER, COMMA} from '@angular/cdk/keycodes';
// import {NgxImageCompressService} from 'ngx-image-compress';
import {countries} from '../../services/country-data-store'
import { RoleChecker } from '../../services/role-checker.service';
import imageCompression from 'browser-image-compression';
import { ReplaySubject, Subject } from 'rxjs';
import { first ,take, takeUntil, startWith } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import * as moment from 'moment';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { SelectionsProjectDeleteDialog, SelectionsProjectRenderComponent } from './selectionsproject-render.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ProjectDataService } from 'src/app/services/project-selector.service';
import { changeTableLimit, getTableLimit } from 'src/app/utils/shared-function';

declare const $: any;

@Component({
  selector: 'app-selectionsproject',
  templateUrl: './selectionsproject.component.html',
  styleUrls : ['./selectionsproject.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    DatePipe
  ]
})
export class SelectionsProjectComponent implements OnInit {
  
  editForm: FormGroup;
  public search_control_project: FormControl = new FormControl();
    Data:any
    // source: LocalDataSource = new LocalDataSource;
    source: any
    public passID: any;
    
    public selected: any

    projectData;

    filterSelectionsForm: FormGroup;

    searchChoices = [
      {value: 'status', viewValue: 'Status'},
      {value: 'due_date', viewValue: 'Due Date'},
    ]

    varStatus = [
      {value: 'Approved', viewValue: 'Approved'},
      {value: 'Draft', viewValue: 'Draft'},
      {value: 'Rejected', viewValue: 'Rejected'},
      {value: 'Submitted to Admin', viewValue: 'Submitted to Admin'},
      {value: 'Submitted to Client', viewValue: 'Submitted to Client'},
      {value: 'Undecided', viewValue: 'Undecided'},
    ]

    // public selectionSettings = {
    //     actions: { 
    //       delete: false,
    //       add: false,
    //       edit: false,
    //       //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
    //     },
    //     pager: {
    //       display: false,
    //     },
    //     attr: {
    //       class: 'table table-bordered'
    //     },
    //     hideSubHeader: true,
    //     mode: 'external',
    //     columns: {
    //       customactions: {
    //         width: '100px',
    //         title: 'Action',
    //         type : 'custom',
    //         filter: false,
    //         sort: false,
    //         valuePrepareFunction: (cell, row) => {   
    //           console.log('row', row);
                         
    //           return this.passID.id;
    //         },            
    //         renderComponent: SelectionsProjectRenderComponent
    //         // valuePrepareFunction: (cell,row) => {
    //         //   return `<a href="#/daily-report/project/${row.projectId}?date=${this.formatDate2(row.todaysDate.toDate())}"><i class="material-icons">preview</i></a>
    //         //   <a target="_blank" href="${row.pdfLink}"><i class="material-icons">picture_as_pdf</i></a>
    //         //   `;
    //         // }
    //       },
    //       // customactions: {
    //       //   title: 'Action',
    //       //   width: '100px',
    //       //   type : 'html',
    //       //   filter: false,
    //       //   valuePrepareFunction: (cell,row) => {
    //       //     if(row.status == 'Approved'){
    //       //       return `<a class="color-approved"  href="#/variations/project/${this.passID.id}/edit/${row.id}"><i class="material-icons">edit_square</i></a>
    //       //               <a target="_blank" href="${row.pdfLink}"><i class="material-icons">download</i></a>
    //       //               <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>`;
    //       //     }else{
    //       //       return `<a href="#/variations/project/${this.passID.id}/edit/${row.id}"><i class="material-icons">edit</i></a>
    //       //               <a target="_blank" href="${row.pdfLink}"><i class="material-icons">download</i></a>
    //       //               <a [routerLink]="[]" (click)="openDeleteDialog()"><i class="material-icons">delete</i></a>`;
    //       //     }
              
    //       //   }
    //       // },
    //       selection_num: {
    //         title: 'Selection Number',
    //         sort: false,
    //         valuePrepareFunction: (cell,row) => {              
    //             return row.selectionNumber;
    //         }
    //       },            
    //       selection_name: {
    //         title: 'Selection Name',
    //         sort: false,
    //         valuePrepareFunction: (cell,row) => {
    //             return row.selectionName;
    //         }
    //       },
    //       total: {
    //         title: 'Total',
    //         sort: false,
    //         valuePrepareFunction: (cell,row) => {
    //             return this.getTotal(row.selectionGroupArray);
    //         }
    //       },
    //       due_date: {
    //         title: 'Due Date',
    //         sort: false,
    //         valuePrepareFunction: (cell,row) => {
    //             return row.dueDate ? row.dueDate.toDate().toDateString() : '';
    //         }
    //       },
    //       status: {
    //         title: 'Status',
    //         sort: false,
    //         valuePrepareFunction: (cell,row) => {
    //             return row.status;
    //         }
    //       },
    //       created_date: {
    //         title: 'Created Date',
    //         sort: false,
    //         valuePrepareFunction: (cell,row) => {
    //             return row.createdAt ? row.createdAt.toDate().toDateString() : '';
    //         }
    //       },
          
    //       // default_hours: {
    //       //   title: 'Default Hours',
    //       //   valuePrepareFunction: (cell,row) => {
    //       //       return row.default_hours;
    //       //   }
    //       // },
    //     }
    //   };

      accountFirebase;

        //Data object for listing items
        tableData: any[] = [];

        //Save first document in snapshot of items received
        firstInResponse: any = [];

        //Save last document in snapshot of items received
        lastInResponse: any = [];

        //Keep the array of first document of previous pages
        prev_strt_at: any = [];

        //Maintain the count of clicks on Next Prev button
        pagination_clicked_count = 0;

        //Disable next and prev buttons
        disable_next: boolean = false;
        disable_prev: boolean = false;

        public selectionSearchStatus = [];
        public selectionSearchDueDate = [];

        public listmode = 'default';

        adminData;

        colorBtnDefault;
        dtOptions: any= {
          data: [],
          columns: [],
          destroy: true,
          pageLength : 10
        };
        dtTrigger: Subject<any> = new Subject();
        currentUser:any

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private data_api: DatasourceService,
        private spinnerService: NgxSpinnerService,
        public authService: AuthenticationService,
        private formBuilder: FormBuilder,
        public pdfImage: PdfImage,
        private previewImage: PreviewImage,
        public datepipe: DatePipe,
        private rolechecker: RoleChecker,
        public dialog: MatDialog,
        private afs: AngularFirestore,
        private afStorage: AngularFireStorage,
        public projectDataService: ProjectDataService,
        // private imageCompress: NgxImageCompressService
        ) { }

    ngOnInit() {
      let currentUser = JSON.parse((localStorage.getItem('currentUser')));
      this.currentUser = currentUser;
      this.editForm = this.formBuilder.group({
        projectId: ['', Validators.required],
      });
      this.getData();
      this.loadProjects();
    }

      ngAfterViewInit(): void {
    $('#DataTables_Table_0').on('length.dt', (e, settings, len) => {
      console.log('len', len)
      // this.changeTableLimit(len)
      changeTableLimit(this.data_api, this.currentUser.email, len,this.spinnerService, 'selection')
    });
  }

    getData(){
      this.getAdminSettings();
      this.passID = {
          id: this.route.snapshot.params['id'],
      };        
      this.route.params

      .subscribe(
          (params: Params) => {
              this.passID.id = params['id'];                
          }
      );

      this.accountFirebase = this.data_api.getCurrentProject();

      // if (localStorage.getItem('currentUser')) {
      //     this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
      // }

      // this.addFestForm = this.formBuilder.group({
      //     tradeCompanyName: ['', Validators.required],
      //     trade: [''],
      //     tradeName: [''],
      //     tradeEmail: [''],
      //     tradePhone: [''],
      //     tradedefaultCostcode: [''],
      //     staffFormArray: this.formBuilder.array([ this.createStaffForm() ]),
      // });
      //   this.getFBTrade();
       this.getSelections();
       this.getProject();

       this.filterSelectionsForm = this.formBuilder.group({
          status: [''],
          dueDate: [''],
          nameFilter : ['']
      });
      this.sendData()
    }


      // ON SELECT PROJECT
  loadProjects(){
     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
   
     this.projectDataService.getProjects(currentUser);
     
     this.projectDataService.filter_list_projects
     .pipe(take(1)) // take only the first emission
     .subscribe(projects => {
       const found = projects.find(p => p.id === this.passID?.id);
       if (found) {
         this.editForm.patchValue({ projectId: found.id });
         console.log('✅ Project ID patched to form:', found.id);
       } else {
         console.warn('⚠️ No matching project found for ID:', this.passID?.id);
       }
     });

     // search logic
     this.search_control_project.valueChanges
       .pipe(takeUntil(this.projectDataService._onDestroy))
       .subscribe(search => {
         this.projectDataService.applyProjectFilter(search);
       });
 }

     // PROJECT SELECT
  projectSelect(event:any){
    console.log('event', event)
    this.router.navigate(['/selections/project/'+event.value]);
    setTimeout(()=>{
      this.getData();
    },300)
  }

    sendData(){
      this.Data = {
        collectionName : 'selections',
        id: this.passID.id
      }
    }

    onSearchResults(results: any[]) {
      console.log('results', results)
      if(results!=null){
      this.source = new LocalDataSource(results);
      } else {
        this.getSelections();
      }
      // this.userSource = new LocalDataSource(results)
      // this.results = results; // Set the results received from the search component
    } 

    getAdminSettings(){
      this.data_api.getFBAdminSettings().subscribe((data) => {
          this.adminData = data;
          this.colorBtnDefault = data.colourEnabledButton ? data.colourEnabledButton : '';
      }); 
    }

    onButtonEnter(hoverName: HTMLElement) {
      
      hoverName.style.backgroundColor = this.adminData.colourHoveredButton ?  this.adminData.colourHoveredButton: '';
      
    }

    onButtonOut(hoverName: HTMLElement) {
        hoverName.style.backgroundColor = this.adminData.colourEnabledButton ?  this.adminData.colourEnabledButton: '';
  }

    // public getSelections(){
    //   this.data_api.getFBVariations(this.passID.id).subscribe(data => {
    //       console.log(data);
    //       //this.source = data;
    //       this.source.load(data);
    //   });

    // }
    getTotal(selectionGroupArray){
      let total = 0;
      for (let group of selectionGroupArray) { 
        total = total + parseFloat(group.groupTotal)
      }
      return total;
    }

    getProject(){
      this.data_api.getFBProject(this.passID.id).pipe(first()).subscribe(data => {
          this.projectData = data;
      });
    }

    filterSelections(){

      if( this.filterSelectionsForm.value.status){
        this.listmode = 'filter-status';
        this.getSelectionsFilterStatus();
      }else if( this.filterSelectionsForm.value.dueDate){
        this.listmode = 'filter-duedate';
        this.getSelectionsFilterDueDate();
      }
      
    }
    //Filter Status
    getSelectionsFilterStatus(){

          this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
          .where("projectId", '==', this.passID.id)
          .where("status", '==', this.filterSelectionsForm.value.status)
          .orderBy("selectionNumber", 'desc')
          .limit(10)
          ).snapshotChanges()
          .subscribe(response => {
              if (!response.length) {
              
                this.source = new LocalDataSource();
                return false;
              }

              this.firstInResponse = response[0].payload.doc;
              this.lastInResponse = response[response.length - 1].payload.doc;

              this.tableData = [];
              for (let item of response) {
                const itemData = item.payload.doc.data();
                itemData.id = item.payload.doc.id;
                this.tableData.push(itemData);
                //this.tableData.push(item.payload.doc.data());
              }

              this.source = new LocalDataSource(this.tableData)
              //Initialize values
              this.prev_strt_at = [];
              this.pagination_clicked_count = 0;
              this.disable_next = false;
              this.disable_prev = false;

              //Push first item to use for Previous action
              this.push_prev_startAt(this.firstInResponse);
              }, error => {
              });

      }

      //Add document
      push_prev_startAtFilterStatus(prev_first_doc) {
        this.prev_strt_at.push(prev_first_doc);
      }

      //Remove not required document 
      pop_prev_startAtFilterStatus(prev_first_doc) {
        this.prev_strt_at.forEach(element => {
          if (prev_first_doc.data().id == element.data().id) {
            element = null;
          }
        });
      }

      //Return the Doc rem where previous page will startAt
      get_prev_startAtFilterStatus() {
        if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
          this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
        return this.prev_strt_at[this.pagination_clicked_count - 1];
      }

      nextPageFilterStatus() {
        this.disable_next = true;
        this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
          .limit(10)
          .where("projectId", '==', this.passID.id)
          .where("status", '==', this.filterSelectionsForm.value.status)
          .orderBy("variantsNumber", 'desc')
          .startAfter(this.lastInResponse)
        ).get()
          .subscribe(response => {

            if (!response.docs.length) {
              this.disable_next = true;
              return;
            }

            this.firstInResponse = response.docs[0];

            this.lastInResponse = response.docs[response.docs.length - 1];
            this.tableData = [];
            for (let item of response.docs) {
              const itemData = item.data();
              itemData.id = item.id;
              this.tableData.push(itemData);
              // this.tableData.push(item.data());
            }
            this.source = new LocalDataSource(this.tableData)

            this.pagination_clicked_count++;

            this.push_prev_startAt(this.firstInResponse);

            this.disable_next = false;
          }, error => {
            this.disable_next = false;
          });
      }

      //Show previous set 
      prevPageFilterStatus() {
        this.disable_prev = true;
        this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
          .where("projectId", '==', this.passID.id)
          .where("status", '==', this.filterSelectionsForm.value.status)
          .orderBy("variantsNumber", 'desc')
          .startAt(this.get_prev_startAt())
          .endBefore(this.firstInResponse)
          .limit(10)
        ).get()
          .subscribe(response => {
            this.firstInResponse = response.docs[0];
            this.lastInResponse = response.docs[response.docs.length - 1];
            
            this.tableData = [];
            for (let item of response.docs) {
              const itemData = item.data();
                itemData.id = item.id;
                this.tableData.push(itemData);
              //this.tableData.push(item.data());
            }
            this.source = new LocalDataSource(this.tableData)
            //Maintaing page no.
            this.pagination_clicked_count--;

            //Pop not required value in array
            this.pop_prev_startAt(this.firstInResponse);

            //Enable buttons again
            this.disable_prev = false;
            this.disable_next = false;
          }, error => {
            this.disable_prev = false;
          });
    }


    //Filter Due Date
    getSelectionsFilterDueDate(){

        var startDate = new Date(this.filterSelectionsForm.value.dueDate) ;
        var endDate = new Date(this.filterSelectionsForm.value.dueDate);
        endDate.setDate(startDate.getDate() + 1);
        this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
        .where("projectId", '==', this.passID.id)
        .where("dueDate", '>=', startDate)
        .where("dueDate", '<', endDate)
        // .orderBy("selectionNumber", 'desc')
        .limit(10)
        ).snapshotChanges()
        .subscribe(response => {
            if (!response.length) {
              this.source = new LocalDataSource();
              return false;
            }
            this.firstInResponse = response[0].payload.doc;
            this.lastInResponse = response[response.length - 1].payload.doc;

            this.tableData = [];
            for (let item of response) {
              const itemData = item.payload.doc.data();
              itemData.id = item.payload.doc.id;
              this.tableData.push(itemData);
              //this.tableData.push(item.payload.doc.data());
            }

            this.source = new LocalDataSource(this.tableData)
            //Initialize values
            this.prev_strt_at = [];
            this.pagination_clicked_count = 0;
            this.disable_next = false;
            this.disable_prev = false;

            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse);
            }, error => {
            });

    }

    //Add document
    push_prev_startAtFilterDueDate(prev_first_doc) {
      this.prev_strt_at.push(prev_first_doc);
    }

    //Remove not required document 
    pop_prev_startAtFilterDueDate(prev_first_doc) {
      this.prev_strt_at.forEach(element => {
        if (prev_first_doc.data().id == element.data().id) {
          element = null; 
        }
      });
    }

    //Return the Doc rem where previous page will startAt
    get_prev_startAtFilterDueDate() {
      if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
        this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
      return this.prev_strt_at[this.pagination_clicked_count - 1];
    }

    nextPageFilterDueDate() {

      var startDate = new Date(this.filterSelectionsForm.value.dueDate) ;
      var endDate = new Date(this.filterSelectionsForm.value.dueDate);
      endDate.setDate(startDate.getDate() + 1);

      this.disable_next = true;
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
        .limit(10)
        .where("projectId", '==', this.passID.id)
        .where("dueDate", '>=', startDate)
        .where("dueDate", '<', endDate)
        .orderBy("variantsNumber", 'desc')
        .startAfter(this.lastInResponse)
      ).get()
        .subscribe(response => {

          if (!response.docs.length) {
            this.disable_next = true;
            return;
          }

          this.firstInResponse = response.docs[0];

          this.lastInResponse = response.docs[response.docs.length - 1];
          this.tableData = [];
          for (let item of response.docs) {
            const itemData = item.data();
            itemData.id = item.id;
            this.tableData.push(itemData);
            // this.tableData.push(item.data());
          }
          this.source = new LocalDataSource(this.tableData);
          this.pagination_clicked_count++;

          this.push_prev_startAt(this.firstInResponse);

          this.disable_next = false;
        }, error => {
          this.disable_next = false;
        });
    }

    //Show previous set 
    prevPageFilterDueDate() {

      var startDate = new Date(this.filterSelectionsForm.value.dueDate) ;
      var endDate = new Date(this.filterSelectionsForm.value.dueDate);
      endDate.setDate(startDate.getDate() + 1);

      this.disable_prev = true;
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
        .where("projectId", '==', this.passID.id)
        .where("dueDate", '>=', startDate)
        .where("dueDate", '<', endDate)
        .orderBy("variantsNumber", 'desc')
        .startAt(this.get_prev_startAt())
        .endBefore(this.firstInResponse)
        .limit(10)
      ).get()
        .subscribe(response => {
          this.firstInResponse = response.docs[0];
          this.lastInResponse = response.docs[response.docs.length - 1];
          
          this.tableData = [];
          for (let item of response.docs) {
            const itemData = item.data();
              itemData.id = item.id;
              this.tableData.push(itemData);
            //this.tableData.push(item.data());
          }
          this.source = new LocalDataSource(this.tableData)
          //Maintaing page no.
          this.pagination_clicked_count--;

          //Pop not required value in array
          this.pop_prev_startAt(this.firstInResponse);

          //Enable buttons again
          this.disable_prev = false;
          this.disable_next = false;
        }, error => {
          this.disable_prev = false;
        });
  }

    // Default 

    getSelections(){
      this.spinnerService.show();
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
      .where("projectId", '==', this.passID.id)
      .orderBy("selectionNumber", 'desc')
      // .limit(10)
      ).snapshotChanges()
      .subscribe(response => {
        console.log('response', response);
        
          // if (!response.length) {
          //   this.disable_next = true;  
          //   return false;
          // }

          // this.firstInResponse = response[0].payload.doc;
          // this.lastInResponse = response[response.length - 1].payload.doc;
          // console.log('this.firstREponse', this.firstInResponse);
          

          this.tableData = [];
          for (let item of response) {
            const itemData = item.payload.doc.data();
            itemData.id = item.payload.doc.id;
            this.tableData.push(itemData);
            console.log('table data', this.tableData);
            //this.tableData.push(item.payload.doc.data());
          }

          // this.source = new LocalDataSource(this.tableData)
          this.source = this.tableData
          console.log('this.source',this.source)
          //Initialize values
          this.prev_strt_at = [];
          this.pagination_clicked_count = 0;
          this.disable_next = false;
          this.disable_prev = false;

          //Push first item to use for Previous action
          this.push_prev_startAt(this.firstInResponse);
          this.setTableData(this.source)
          this.spinnerService.hide();
          }, error => {
            console.log('error', error);
            this.spinnerService.hide();
            
          });

  }
  
   // SET TABLE DATA FOR DATATABLE JS
   setTableData(source:any){
    if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
      $('#DataTables_Table_0').DataTable().destroy();
    }        
    this.dtOptions.data = source
    console.log("this.datoptions.data", this.dtOptions.data)
    this.dtOptions.columns  = [
      {
        title: 'Actions',
        data: null,
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          // Inject dynamic values into the HTML string
          cell.innerHTML = `
          <a style="color: #000000; cursor:pointer;" href="#/selections/project/${this.passID.id}/edit/${rowData.id}"><i class="material-icons" title="Edit">edit</i></a>
            </a>
            <a style="color: #000000; cursor:pointer;" target="_blank" href="${rowData.pdfLink}">
              <i class="material-icons" title="Download">download</i>
            </a>
            <a class="delete-btn" style="color: #000000; cursor:pointer;">
              <i class="material-icons" title="Delete">delete</i>
            </a>
          `;
      
          // Attach event listener for delete button
          cell.querySelector('.delete-btn')?.addEventListener('click', () => {
            this.openDeleteDialog(rowData); // Pass rowData to handle deletion
          });
        },
      },
      { title: 'Selection No.', data: 'selectionNumber',
       },
      { title: 'Selection Name',data: 'selectionName',
      },
      { title: 'Total', data: null,
        render: (data)=>{
          return this.getTotal(data.selectionGroupArray).toFixed(2);;
        }
       },
      { title: 'Due Date', data: null,
        render: (data) =>{
          console.log('data',data)
          return data.dueDate ? data?.dueDate?.toDate().toDateString() : '';
        }
       },
      { title: 'Status', data: 'status' },
      { title: 'Created Date', data: null,
        render : (data)=>{
          return data.createdAt ? data.createdAt.toDate().toDateString() : '';
        }
       },
    ]
    this.dtTrigger.next();

    
    getTableLimit(this.data_api,this.currentUser.email, 'selection').then(res =>{
          if(res){
          this.dtOptions.pageLength = res;
          this.dtTrigger.next();
          }
    })
}

openDeleteDialog(rowData): void {

      const dialogRef = this.dialog.open(SelectionsProjectDeleteDialog, {
          width: '400px',
          data: rowData
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
    
          if(result){

                if(result.fest_confirm=='DELETE'){ 

                    // this.spinnerService.show();   
                    let TBDFiles = [];

                    TBDFiles.push(result.pdfLink);

                    for (let group of result.selectionGroupArray) { 
                      for (let item of group.itemArray) {
                          if(item.itemImage){
                            TBDFiles.push(item.itemImage);
                          }
                      }
                      for (let file of group.files) {
                        TBDFiles.push(file);
                      }
                    }


                    console.log(TBDFiles);
                    // return;
                    // result.pdfLink
                    // result.variationGroupArray.0.files
                    // result.variationGroupArray.0.itemArray.0.itemImage

                    for (let TBDFile of TBDFiles) { 
                      console.log(this.afStorage.storage.refFromURL(TBDFile));

                        this.afStorage.storage.refFromURL(TBDFile)
                        .delete()
                        .catch((error) => console.log(error));

                    }

                    console.log(result.id);
                    
                    this.data_api.deleteFBSelection(result.id).then(() => {
                      this.spinnerService.hide();  
                      // this.addLog();
                      $.notify({
                        icon: 'notifications',
                        message: 'Selection Deleted'
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
                      }, 500);  

                    });
        
                }else{
                  rowData["fest_confirm"] = "";
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

          }
      });
   }


  loading: boolean = false;
  // GET ALL SELECTIONS
  getAllSelections(){
    this.loading = true;
    setTimeout(()=>{
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
        .where("projectId", '==', this.passID.id)
        .orderBy("selectionNumber", 'desc')
        ).snapshotChanges()
        .subscribe(response => {
          console.log('response', response);
          
            if (!response.length) {
              return false;
            }
  
            this.firstInResponse = response[0].payload.doc;
            this.lastInResponse = response[response.length - 1].payload.doc;
            console.log('this.firstREponse', this.firstInResponse);
            
  
            this.tableData = [];
            for (let item of response) {
              const itemData = item.payload.doc.data();
              itemData.id = item.payload.doc.id;
              this.tableData.push(itemData);
            }
  
            this.source = new LocalDataSource(this.tableData)
            this.loading = false;
            this.disable_next = true;
          })
    }, 2000)
  }

  //Add document
  push_prev_startAt(prev_first_doc) {
    this.prev_strt_at.push(prev_first_doc);
  }

  //Remove not required document 
  pop_prev_startAt(prev_first_doc) {
    this.prev_strt_at.forEach(element => {
      if (prev_first_doc.data().id == element.data().id) {
        element = null;
      }
    });
  }

  //Return the Doc rem where previous page will startAt
  get_prev_startAt() {
    if (this.prev_strt_at.length > (this.pagination_clicked_count + 1))
      this.prev_strt_at.splice(this.prev_strt_at.length - 2, this.prev_strt_at.length - 1);
    return this.prev_strt_at[this.pagination_clicked_count - 1];
  }

  nextPage() {
    this.disable_next = true;
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
      .limit(10)
      .where("projectId", '==', this.passID.id)
      .orderBy("selectionNumber", 'desc')
      .startAfter(this.lastInResponse)
    ).get()
      .subscribe(response => {
        console.log('response', response);
        

        if (!response.docs.length) {
          this.disable_next = true;
          return;
        }

        this.firstInResponse = response.docs[0];

        this.lastInResponse = response.docs[response.docs.length - 1];
        this.tableData = [];
        for (let item of response.docs) {
          const itemData = item.data();
          itemData.id = item.id;
          this.tableData.push(itemData);
          // this.tableData.push(item.data());
        }
        this.source = new LocalDataSource(this.tableData)
        this.pagination_clicked_count++;

        this.push_prev_startAt(this.firstInResponse);

        this.disable_next = false;
      }, error => {
        this.disable_next = false;
      });
  }

  //Show previous set 
  prevPage() {
    this.disable_prev = true;
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/selections', ref => ref
      .where("projectId", '==', this.passID.id)
      .orderBy("selectionNumber", 'desc')
      .startAt(this.get_prev_startAt())
      .endBefore(this.firstInResponse)
      .limit(10)
    ).get()
      .subscribe(response => {
        this.firstInResponse = response.docs[0];
        this.lastInResponse = response.docs[response.docs.length - 1];
        
        this.tableData = [];
        for (let item of response.docs) {
          const itemData = item.data();
            itemData.id = item.id;
            this.tableData.push(itemData);
          //this.tableData.push(item.data());
        }
        this.source = new LocalDataSource(this.tableData)
        //Maintaing page no.
        this.pagination_clicked_count--;

        //Pop not required value in array
        this.pop_prev_startAt(this.firstInResponse);

        //Enable buttons again
        this.disable_prev = false;
        this.disable_next = false;
      }, error => {
        this.disable_prev = false;
      });
  }

  public reset(){
    this.filterSelectionsForm.get('nameFilter')?.setValue('');
    this.listmode = 'default';
    this.filterSelectionsForm.patchValue({
      status: '',
      dueDate: '',
    });
    this.getSelections();
  }
}
