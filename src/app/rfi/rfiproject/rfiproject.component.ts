import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalDataSource } from 'ng2-smart-table';
import { first, take, takeUntil } from 'rxjs/operators';
import { DatasourceService } from 'src/app/services/datasource.service';
import { PdfImage } from 'src/app/services/pdf-image';
import { PreviewImage } from 'src/app/services/preview-image';
import { RoleChecker } from 'src/app/services/role-checker.service';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { VariationsProjectRenderComponent } from 'src/app/variations/variationsproject/variationsproject-render.component';
import { RFIProjectDeleteDialog, RFIProjectRenderComponent } from './rfieditcomponent/rfiproject-render.component';
import { Subject } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import swal from 'sweetalert2';
import { ProjectDataService } from 'src/app/services/project-selector.service';
import { changeTableLimit, getTableLimit } from 'src/app/utils/shared-function';

declare const $: any;


@Component({
  selector: 'app-rfiproject',
  templateUrl: './rfiproject.component.html',
  styleUrls: ['./rfiproject.component.css']
})
export class RFIPROJECTComponent {
  editForm: FormGroup;
  public search_control_project: FormControl = new FormControl();

  Data:any 
  // source: LocalDataSource = new LocalDataSource;
  source:any
  public passID: any;
  
  public selected: any

  projectData;

  selectionForm: FormGroup;

  filterVariationsForm: FormGroup;

  dtOptions: any = {
    data :[],
    columns: [],
    destroy: true
  };
  dtTrigger: Subject<any> = new Subject();


  

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

  // public settings = {
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
  //           return this.passID.id;
  //         },
  //         renderComponent: RFIProjectRenderComponent
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
  //       variation_num: {
  //         title: 'RFI Number',
  //         sort: false,
  //         valuePrepareFunction: (cell,row) => {
  //           console.log('row',row);
            
  //             return row.rfiNumber;
  //         }
  //       },
  //       variation_name: {
  //         title: 'RFI Name',
  //         sort: false,
  //         valuePrepareFunction: (cell,row) => {
  //             return row.rfiName;
  //         }
  //       },
  //       // total: {
  //       //   title: 'Total',
  //       //   sort: false,
  //       //   valuePrepareFunction: (cell,row) => {
  //       //       return this.getTotal(row.rfiGroupArray);
  //       //   }
  //       // },
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

      public variationSearchStatus = [];
      public variationSearchDueDate = [];

      public listmode = 'default';

      adminData;

      colorBtnDefault;
      currentUser

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
        changeTableLimit(this.data_api, this.currentUser.email, len,this.spinnerService,'rfi')
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
       this.getRFI();
       this.getProject();

       this.filterVariationsForm = this.formBuilder.group({
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
    this.router.navigate(['/rfi/project/' + event.value]);
    setTimeout(()=>{
      this.getData();
    },300)
  }

  sendData(){
    this.Data = {
      collectionName : 'rfis',
      id: this.passID.id
    }
  }

  onSearchResults(results: any[]) {
    console.log('results', results)
    if(results!=null){
    this.source = new LocalDataSource(results);
    } else{
      this.getRFI();
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

  // public getRFI(){
  //   this.data_api.getFBVariations(this.passID.id).subscribe(data => {
  //       //this.source = data;
  //       this.source.load(data);
  //   });

  // }
  getTotal(variationGroupArray){
    let total = 0;
    for (let group of variationGroupArray) { 
      total = total + parseFloat(group.groupTotal)
    }
    return total;
  }

  getProject(){
    this.data_api.getFBProject(this.passID.id).pipe(first()).subscribe(data => {
        
        this.projectData = data;
    });
  }

  filterVariations(){

    if( this.filterVariationsForm.value.status){
      this.listmode = 'filter-status';
      this.getRFIFilterStatus();
    }else if( this.filterVariationsForm.value.dueDate){
      this.listmode = 'filter-duedate';
      this.getRFIFilterDueDate();
    
    }
    
  }

  

  //Filter Status
  getRFIFilterStatus(){

        this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
        .where("projectId", '==', this.passID.id)
        .where("status", '==', this.filterVariationsForm.value.status)
        // .orderBy("variantsNumber", 'desc')
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
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
        .limit(10)
        .where("projectId", '==', this.passID.id)
        .where("status", '==', this.filterVariationsForm.value.status)
        .orderBy("rfiNumber", 'desc')
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
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
        .where("projectId", '==', this.passID.id)
        .where("status", '==', this.filterVariationsForm.value.status)
        // .orderBy("variantsNumber", 'desc')
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
  getRFIFilterDueDate(){

      var startDate = new Date(this.filterVariationsForm.value.dueDate) ;
      var endDate = new Date(this.filterVariationsForm.value.dueDate);
      endDate.setDate(startDate.getDate() + 1);
      this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
      .where("projectId", '==', this.passID.id)
      .where("dueDate", '>=', startDate)
      .where("dueDate", '<', endDate)
      // .orderBy("rfiNumber", 'desc')
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

    var startDate = new Date(this.filterVariationsForm.value.dueDate) ;
    var endDate = new Date(this.filterVariationsForm.value.dueDate);
    endDate.setDate(startDate.getDate() + 1);

    this.disable_next = true;
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations', ref => ref
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

    var startDate = new Date(this.filterVariationsForm.value.dueDate) ;
    var endDate = new Date(this.filterVariationsForm.value.dueDate);
    endDate.setDate(startDate.getDate() + 1);

    this.disable_prev = true;
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/variations', ref => ref
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

  getRFI(){
    this.spinnerService.show();
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
    .where("projectId", '==', this.passID.id)
    .orderBy("rfiNumber", 'desc')
    // .limit(10)
    ).snapshotChanges()
    .subscribe(response => {

      
        // if (!response.length) {
        //   this.disable_next = true;
        //   return false;
        // }
    

        // this.firstInResponse = response[0].payload.doc;
        // this.lastInResponse = response[response.length - 1].payload.doc;

        this.tableData = [];
        for (let item of response) {
          const itemData = item.payload.doc.data();
          itemData.id = item.payload.doc.id;
          this.tableData.push(itemData);
          // console.log('this.tableData', this.tableData);
          
          //this.tableData.push(item.payload.doc.data());
        }

        // this.source = new LocalDataSource(this.tableData)
        this.source = this.tableData
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
          console.log('errror', error);
          this.spinnerService.hide();
        });

}

 // SET TABLE DATA FOR DATATABLE JS
 setTableData(source:any){
  if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
    $('#DataTables_Table_0').DataTable().destroy();
  }        
  this.dtOptions.data = source
  this.dtOptions.columns  = [
    {
      title: 'Actions',
      data: null,
      createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
        cell.innerHTML = `
          <a style="color: #000000; cursor:pointer;" href="#/rfi/project/${this.passID.id}/edit/${rowData.id}"><i class="material-icons" title="Edit">edit</i></a>
          <a style="color: #000000; cursor:pointer;" target="_blank" href="${rowData.pdfLink}">
            <i class="material-icons" title="Download">download</i>
          </a>
          <a class="delete-btn" style="color: #000000; cursor:pointer;">
            <i class="material-icons" title="Delete">delete</i>
          </a>
        `;
    
        // Attach event listener for delete button
        cell.querySelector('.delete-btn')?.addEventListener('click', () => {
          this.openDeleteDialog(rowData); 
        });
      },
    },
    { title: 'RFI No.', data: 'rfiNumber',
     },
    { title: 'RFI Name',data: 'rfiName',
    },
    // { title: 'Total', data: null,
    //   render: (data)=>{
    //     return this.getTotal(data.rfiGroupArray);
    //   }
    //  },
    { title: 'Due Date', data: null,
      render: (data) =>{
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

   getTableLimit(this.data_api,this.currentUser.email,'rfi').then(res =>{
            if(res){
            this.dtOptions.pageLength = res;
            this.dtTrigger.next();
            }
      })
}

// DELETE DIALOG

 openDeleteDialog(rowData:any): void {

      const dialogRef = this.dialog.open(RFIProjectDeleteDialog, {
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

                    for (let group of result.rfiGroupArray) { 
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
                    
                    this.data_api.deleteFBRFI(result.id).then(() => {
                      this.spinnerService.hide();  
                      // this.addLog();
                      $.notify({
                        icon: 'notifications',
                        message: 'Rfi Deleted'
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
// GET ALL VARIATIONS

getAllRFI(){
  this.loading = true;
  setTimeout(()=>{
    this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
      .where("projectId", '==', this.passID.id)
      .orderBy("rfiNumber", 'desc')
      ).snapshotChanges()
      .subscribe(response => {
        
          if (!response.length) {
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
          this.loading = false;
          this.disable_next = true;
        })
  })
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
  this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
    .limit(10)
    .where("projectId", '==', this.passID.id)
    .orderBy("rfiNumber", 'desc')
    .startAfter(this.lastInResponse)
  ).get()
    .subscribe(response => {
     console.log('response',response);
     
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
  this.afs.collection('/accounts').doc(this.accountFirebase).collection('/rfis', ref => ref
    .where("projectId", '==', this.passID.id)
    .orderBy("rfiNumber", 'desc')
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
  this.filterVariationsForm.get('nameFilter')?.setValue('');
  this.listmode = 'default';
  this.filterVariationsForm.patchValue({
    status: '',
    dueDate: '',
  });
  this.getRFI();
}
}
