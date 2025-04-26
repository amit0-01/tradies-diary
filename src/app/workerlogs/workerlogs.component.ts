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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import swal from 'sweetalert2';
import {WorkerLogsDeleteDialog, WorkerLogsRenderComponent} from './workerlogsbutton-render.component';
import {WorkerLogsImageDialog, WorkerLogsImageRenderComponent} from './workerlogsimagebutton-render.component';
import { ExportToCsv } from 'export-to-csv';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';
import { RoleChecker } from '../services/role-checker.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

declare const $: any;

@Component({
  selector: 'app-workerlogs',
  templateUrl: './workerlogs.component.html',
  styles : [
    `
    :host ::ng-deep .material-icons {
        font-size: 13px;
        color: black;
      }`
  ]
})

export class WorkerLogsComponent implements OnInit {

    options = {
      data: [],
      columns: [],
      destroy: true 
    }
    dtTrigger : Subject<any> = new Subject();

    source: LocalDataSource = new LocalDataSource;

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

    public userDetails;

    public projectNames = [];

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
      //         title: 'Action',
      //         width: '100px',
      //         type : 'custom',
      //         filter: false,
      //         sort: false,
      //         valuePrepareFunction: (cell, row) => row,
              // renderComponent: WorkerLogsRenderComponent
      //       //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
      //         // }
      //       },
      //       project_name: {
      //         width: '300px',
      //         title: 'Project Name',
      //         valuePrepareFunction: (cell,row) => {
      //           return this.projectNames.find(o => o.id === row.projectId)?.projectName ?? 'Project is deleted or not found';
      //         }
      //       },
      //       date: {
      //         title: 'Date',
      //         width: '200px',
      //         valuePrepareFunction: (cell,row) => {
      //           return row.selectedDate.toDate().toDateString();
      //         }
      //       },
      //       notes: {
      //         title: 'Notes',
      //         valuePrepareFunction: (cell,row) => {
      //             return row.accomplishments;
      //         }
      //       },
      //       start: {
      //         title: 'Start',
      //         width: '8%',
      //         valuePrepareFunction: (cell,row) => {
      //             return row.start;
      //         }
      //       },
      //       break: {
      //         title: 'Break',
      //         width: '8%',
      //         valuePrepareFunction: (cell,row) => {
      //             return row.break;
      //         }
      //       },
      //       finish: {
      //         title: 'Finish',
      //         width: '8%',
      //         valuePrepareFunction: (cell,row) => {
      //             return row.finish;
      //         }
      //       },
      //       entry_status: {
      //         title: 'Status',
      //         width: '10%',
      //         valuePrepareFunction: (cell,row) => {
      //             return row.entryStatus + ' ' + (row.modifiedBy ? "(modified by "+row.modifiedBy+")" : "") + ' ' + (row.modifiedDate ? "(updated last "+row.modifiedDate.toDate().toDateString()+")" : "");
      //         }
      //       },
      //       image: {
      //         title: 'Image',
      //         type : 'custom',
      //         width: '200px',
      //         valuePrepareFunction: (cell,row)  => row,
                  // renderComponent: WorkerLogsImageRenderComponent,
      //             onComponentInitFunction :(instance) => {
      //                 instance.save.subscribe(row => {
      //                   console.log(row);
      //                 });
      //             }
      //       },
      //     }
      //   };

      
    constructor(
        private data_api: DatasourceService,
        private formBuilder: FormBuilder,
        private spinnerService: NgxSpinnerService,
        public dialog: MatDialog,
        private ngxCsvParser: NgxCsvParser,
        private rolechecker: RoleChecker,
        private afs: AngularFirestore,
        private router : Router
        ) { }
    
      public ngOnInit() {

        if (localStorage.getItem('currentUser')) {
            this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
        }

        this.accountFirebase = this.data_api.getCurrentProject();

        this.getFBProjects();
        this.getFBWorkerLogs();
      }


      getFBProjects(): void {
          this.data_api.getFBProjects().subscribe(data => {
            console.log(data);

            data.forEach(data =>{ 
                this.projectNames.push(data)
            })

          });
      }

      getFBWorkerLogs(){

        this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
        .where("workerID", '==', this.userDetails.user_id)
        .orderBy('selectedDate', 'desc')
        // .limit(10)
        ).snapshotChanges()
        .subscribe(response => {
            if (!response.length) {
              this.setTableData(this.tableData);
              return false;
            }
            console.log(response);
  
            this.firstInResponse = response[0].payload.doc;
            this.lastInResponse = response[response.length - 1].payload.doc;
  
            this.tableData = [];
            for (let item of response) {
              const itemData = item.payload.doc.data();
              itemData.id = item.payload.doc.id;
              this.tableData.push(itemData);
            }
      
            // this.source = new LocalDataSource(this.tableData)
            this.setTableData(this.tableData);
            console.log(this.source);
            //Initialize values
            this.prev_strt_at = [];
            this.pagination_clicked_count = 0;
            this.disable_next = false;
            this.disable_prev = false;
  
            //Push first item to use for Previous action
            this.push_prev_startAt(this.firstInResponse);
            }, error => {
                console.log(error);
            });
      }

      setTableData(data:any){
        if ($.fn.DataTable.isDataTable('#workerLogsTable')) {
          $('#workerLogsTable').DataTable().destroy();
        }
        this.options.data = data;
        this.options.columns =[
          {
            data: null,
            title: 'Action',
            width: '100px',
            orderable: false,
            searchable: false,
            createdCell: (cell: any, cellData: any, rowData: any) => {
              cell.innerHTML = `
                <a href="javascript:void(0);" class="edit"><i class="material-icons" title="Edit">edit</i></a>
                <a href="javascript:void(0);" class="delete"><i class="material-icons" title="Delete">delete</i></a>
              `;
          
              // Attach event listeners for edit and delete actions
              cell.querySelector('.edit')?.addEventListener('click', () => {
                console.log("Edit clicked:", rowData);
                this.updateWorkerLog(rowData);
              });
          
              cell.querySelector('.delete')?.addEventListener('click', () => {
                console.log("Delete clicked:", rowData);
                this.openDeleteDialog(rowData);
              });
            },
          },          
          
            {
              data: 'projectId',
              title: 'Project Name',
              width: '300px',
              orderable: false,
              render: (data: any, type: any, row: any) => {
                return this.projectNames.find(o => o.id === row?.projectId)?.projectName 
                  ?? 'Project is deleted or not found';
              },
            },
            {
              title: 'Date',
              width: '200px',
              render: (data: any, type, row) => {
                return row.selectedDate.toDate().toDateString();
    },
            },
            {
              data: 'accomplishments',
              title: 'Notes',
            },
            {
              data: 'start',
              title: 'Start',
              width: '8%',
            },
            {
              data: 'break',
              title: 'Break',
              width: '8%',
            },
            {
              data: 'finish',
              title: 'Finish',
              width: '8%',
            },
            {
              data: 'entryStatus',
              title: 'Status',
              width: '10%',
              render: (data: any, type: any, row: any) => {
              return row.entryStatus + ' ' + (row.modifiedBy ? "(modified by "+row.modifiedBy+")" : "") + ' ' + (row.modifiedDate ? "(updated last "+row.modifiedDate.toDate().toDateString()+")" : "");

              },
            },
            {
              data: null,
              title: 'Image',
              width: '200px',
              orderable: false,
              searchable: false,
              createdCell: (cell: any, cellData: any, rowData: any) => {
                console.log('rowdata', rowData)
                cell.innerHTML = rowData.imageUpload
                  ? `<button style="min-width:100px!important; padding: 5px 10px !Important;" *ngIf="imageUpload" mat-button class="btn dcb-btn view-images"
                  >View Images</button> `
                  : 'No Image';
            
                cell.querySelector('.view-images')?.addEventListener('click', () => {
                  console.log("Opening Image Dialog for:", rowData);
                  this.openImageDialog(rowData);
                });
              },
            }
            
          ],      
        setTimeout(() => this.dtTrigger.next(), 0);

      }


      openImageDialog(rowData: any): void {
        console.log("Opening Image Dialog:", rowData.imageUpload);
      
        const dialogRef = this.dialog.open(WorkerLogsImageDialog, {
          // width: '100%',
          data: rowData.imageUpload
      });
      
        dialogRef.afterClosed().subscribe(result => {
          console.log("Dialog Closed. Result:", result);
        });
      }
      

      // UPDATE WORKER LOGS
      updateWorkerLog(rowData: any) {
        console.log("Updating Worker Log:", rowData);
        let project_id = rowData.projectId;

      
        let selectedDate = rowData.selectedDate.toDate();
        let selecteddd = String(selectedDate.getDate()).padStart(2, '0');
        let selectedmm = String(selectedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let selectedyyyy = selectedDate.getFullYear();
        let sel_date = selectedyyyy+"-"+selectedmm+"-"+selecteddd;
      
        this.router.navigateByUrl('/dashboard-worker?project_id='+project_id+'&sel_date='+sel_date).then(() => {
          window.location.reload();
        });
      }
      
      // DELETE WORKER LOGS
      openDeleteDialog(data: string) {
        const dialogRef = this.dialog.open(WorkerLogsDeleteDialog, {
          width: '400px',
          data: data
        });
      
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log("Deleting Worker Log for ID:", result);
            this.spinnerService.show();
      
            this.data_api.deleteFBTimesheet(result).then(() => {
              this.spinnerService.hide();
              $.notify({
                icon: 'notifications',
                message: 'Entry Deleted'
              }, {
                type: 'success',
                timer: 1000,
                placement: { from: 'top', align: 'center' },
                template: `
                  <div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">
                    <button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">
                      <i class="material-icons">close</i>
                    </button>
                    <i class="material-icons" data-notify="icon">notifications</i>
                    <span data-notify="title">{1}</span>
                    <span data-notify="message">{2}</span>
                  </div>`
              });
              window.location.reload();
            });
          }
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
        //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
        //     .where("workerID", '==', this.userDetails.user_id)
        //     .limit(10)
        //     .orderBy('selectedDate', 'desc')
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
        //           const itemData = item.data();
        //           itemData.id = item.id;
        //           this.tableData.push(itemData);
        //       }
        //       this.source = new LocalDataSource(this.tableData)
      
        //       console.log(this.source);
      
        //       this.pagination_clicked_count++;
      
        //       this.push_prev_startAt(this.firstInResponse);
      
        //       this.disable_next = false;
        //     }, error => {
        //       this.disable_next = false;
        //     });
        // }
      
        //Show previous set 
        // prevPage() {
        //   this.disable_prev = true;
        //   this.afs.collection('/accounts').doc(this.accountFirebase).collection('/timesheet', ref => ref
        //     .where("workerID", '==', this.userDetails.user_id)
        //     .orderBy('selectedDate', 'desc')
        //     .startAt(this.get_prev_startAt())
        //     .endBefore(this.firstInResponse)
        //     .limit(10)
        //   ).get()
        //     .subscribe(response => {
        //       this.firstInResponse = response.docs[0];
        //       this.lastInResponse = response.docs[response.docs.length - 1];
              
        //       this.tableData = [];
        //       for (let item of response.docs) {
        //           const itemData = item.data();
        //           itemData.id = item.id;
        //           this.tableData.push(itemData);
        //       }
        //       this.source = new LocalDataSource(this.tableData)
        //       //Maintaing page no.
        //       this.pagination_clicked_count--;
      
        //       //Pop not required value in array
        //       this.pop_prev_startAt(this.firstInResponse);
      
        //       //Enable buttons again
        //       this.disable_prev = false;
        //       this.disable_next = false;
        //     }, error => {
        //       this.disable_prev = false;
        //     });
        // }
        
}