import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Inject} from '@angular/core';
import { DatasourceService} from '../services/datasource.service';
import { LocalDataSource } from 'ng2-smart-table';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
// import {ButtonRenderComponent} from './pricebutton-render.component';
import {ProjectApprovalDialog, ProjectApprovalRenderComponent} from './projectapprovalbutton-render.component';
import swal from 'sweetalert2';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ConfirmedValidator  } from '../services/confirm-password.validator';
import { RoleChecker } from '../services/role-checker.service';
import * as moment from 'moment';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import { changeTableLimit, getTableLimit } from '../utils/shared-function';

declare const $: any;


@Component({
  selector: 'app-projectapproval',
  templateUrl: './projectapproval.component.html',
  providers: [],
  styles : [
    `:host ::ng-deep .material-icons {
    font-size: 13px;
    color: black;
    cursor: pointer;
  }`]
})
export class ProjectApprovalComponent implements OnInit {

    projectApprovalSource: any;

    dtOptions: any = {
        data: [],
        columns: [],
        destroy: true
      };
    dtTrigger: Subject<any> = new Subject();

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

    accountFirebase;

    adminData;

    colorBtnDefault;
    currentUser
    moduleName = 'projectApproval'
    // public settings = {
    //     actions: { 
    //       delete: false,
    //       add: false,
    //       edit: false,
    //       //custom: [{ name: 'ourCustomAction', title: '<i [routerLink]="["/edit", card.id]" class="material-icons">edit</i>' }],
    //     },
    //     attr: {
    //       class: 'table table-bordered'
    //     },
    //     pager : {
    //       display : false,
    //     },
    //     hideSubHeader: true,
    //     mode: 'external',
    //     columns: {
    //       customactions: {
    //         title: 'Action',
    //         type : 'custom',
    //         width: '100px',
    //         valuePrepareFunction: (cell, row) => row,
    //           renderComponent: ProjectApprovalRenderComponent
    //         // valuePrepareFunction: (cell,row) => {
    //         //   return `<a href="#/flights/edit/${row.id}"><i class="material-icons">edit</i></a>`;
    //         // }
    //       },
    //       ClientName: {
    //         title: 'Client Name',
    //         width: '250px',
    //         valuePrepareFunction: (cell,row) => {
    //           return row.clientName;
    //         }
    //       },
    //       // Company: {
    //       //   title: 'Company/Individual',
    //       //   width: '250px',
    //       //   valuePrepareFunction: (cell,row) => {
    //       //     return this.getCompInd(row.company,row.individual);
    //       //   }
    //       // },
    //       SiteName: {
    //         title: 'Site Name',
    //         width: '300px',
    //         valuePrepareFunction: (cell,row) => {
    //           return row.siteName;
    //         }
    //       },
    //       Urgency: {
    //         title: 'Urgency',
    //         width: '300px',
    //         valuePrepareFunction: (cell,row) => {
    //           return row.urgency;
    //         }
    //       },
    //       SiteAddress: {
    //         title: 'Site Address',
    //         valuePrepareFunction: (cell,row) => {
    //           return row.siteAddress;
    //         }
    //       },
    //     }
    //   };

    constructor(
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        private rolechecker: RoleChecker,
        private afs: AngularFirestore
        ) { }

    public ngOnInit() {
      let currentUser = JSON.parse((localStorage.getItem('currentUser')));
      this.currentUser = currentUser;
      this.getAdminSettings();
      this.accountFirebase = this.data_api.getCurrentProject();
      this.getAllProjectRequest();
    }


        ngAfterViewInit(): void {
          $('#DataTables_Table_0').on('length.dt', (e, settings, len) => {
            console.log('len', len)
            // this.changeTableLimit(len)
            changeTableLimit(this.data_api, this.currentUser.email, len,this.spinnerService,this.moduleName)
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
    
    getCompInd(compVal,indVal){
        if(compVal == true){
          return 'Company';
        }else if(indVal == true){
          return 'Individual';
        }else{
          return;
        }
    }

    public getAllProjectRequest(){

        this.spinnerService.show();

        this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projectRequests', ref => ref
        .orderBy('clientName', 'asc')
        .where("approve", '==', false)
        // .limit(10)
        ).snapshotChanges()
        .subscribe(response => {
            this.spinnerService.hide();
            if (!response.length) {
              console.log("No Data Available");
              return false;
            }
            console.log(response);
  
            this.firstInResponse = response[0].payload.doc;
            this.lastInResponse = response[response.length - 1].payload.doc;
  
            this.tableData = [];
            for (let item of response) {
              let tempdata = {
                id: item.payload.doc.id,
                ...item.payload.doc.data()
              }
              this.tableData.push(tempdata);
            }
            console.log( this.tableData);
            // this.projectApprovalSource = new LocalDataSource(this.tableData)
            this.projectApprovalSource = this.tableData;
  
            //Initialize values
            this.prev_strt_at = [];
            this.pagination_clicked_count = 0;
            this.disable_next = false;
            this.disable_prev = false;
  
            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse);
            this.setTableData()
            }, error => {
              console.log(error);
            });
      }

  // SET TABLE DATA 

 
  setTableData(){
      if ($.fn.dataTable.isDataTable('#DataTables_Table_0')) {
      $('#DataTables_Table_0').DataTable().destroy();
    }        
    this.dtOptions.data = this.projectApprovalSource;
    this.dtOptions.columns  = [
      {
        title: 'Actions',
        data: null,
        createdCell: (cell: HTMLElement, cellData: any, rowData: any) => {
          cell.innerHTML = `
             <a class="preview" [routerLink]="[]" title="Edit"><i class="material-icons">preview</i></a>
          `;

          cell.querySelector('.preview')?.addEventListener('click', () => this.openDialog(rowData));
        },
      },
      { title: 'Client Name', data: 'clientName',
       },
      { title: 'Site Name',
        data: 'siteName'
      },
      { title: 'Urgency', data: 'urgency' },
      { title: 'Site Address', data: 'siteAddress' },
    ]
    this.dtTrigger.next();

    getTableLimit(this.data_api,this.currentUser.email,this.moduleName).then(res =>{
        if(res){
        this.dtOptions.pageLength = res;
        this.dtTrigger.next();
        }
  })
}

// OPEN DIALOG
  openDialog(rowData:any): void {
        console.log(rowData);
        const dialogRef = this.dialog.open(ProjectApprovalDialog, {
            width: '400px',
            data: rowData
        });

        dialogRef.afterClosed().subscribe(result => {
          
          // if(result == 'success'){   
          //     setTimeout(function(){
          //       window.location.reload();
          //     }, 1000);  
          // }
        });
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

  // nextPage() {
  //   this.disable_next = true;
  //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projectRequests', ref => ref
  //     .orderBy('clientName', 'asc')
  //     .where("approve", '==', false)
  //     .limit(10)
  //     // .orderBy('todaysDate', 'desc')
  //     .startAfter(this.lastInResponse)
  //   ).get()
  //     .subscribe(response => {

  //       if (!response.docs.length) {
  //         this.disable_next = true;
  //         return;
  //       }

  //       this.firstInResponse = response.docs[0];

  //       this.lastInResponse = response.docs[response.docs.length - 1];
  //       this.tableData = [];
  //       for (let item of response.docs) {
  //         let tempdata = {
  //           id: item.id,
  //           ...item.data()
  //         }
  //         this.tableData.push(tempdata);
  //         // this.tableData.push(item.data());
  //       }
  //       this.projectApprovalSource = new LocalDataSource(this.tableData)

  //       this.pagination_clicked_count++;

  //       this.push_prev_startAt(this.firstInResponse);

  //       this.disable_next = false;
  //     }, error => {
  //       this.disable_next = false;
  //     });
  // }

  //Show previous set 
//   prevPage() {
//     this.disable_prev = true;
//     this.afs.collection('/accounts').doc(this.accountFirebase).collection('/projectRequests', ref => ref
//       .orderBy('clientName', 'asc')
//       .where("approve", '==', false)
//       .startAt(this.get_prev_startAt())
//       .endBefore(this.firstInResponse)
//       .limit(10)
//     ).get()
//       .subscribe(response => {
//         this.firstInResponse = response.docs[0];
//         this.lastInResponse = response.docs[response.docs.length - 1];
        
//         this.tableData = [];
//         for (let item of response.docs) {
//           let tempdata = {
//             id: item.id,
//             ...item.data()
//           }
//           this.tableData.push(tempdata);
//           // this.tableData.push(item.data());
//         }
//         this.projectApprovalSource = new LocalDataSource(this.tableData)
//         //Maintaing page no.
//         this.pagination_clicked_count--;

//         //Pop not required value in array
//         this.pop_prev_startAt(this.firstInResponse);

//         //Enable buttons again
//         this.disable_prev = false;
//         this.disable_next = false;
//       }, error => {
//         this.disable_prev = false;
//       });
//   }
}