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
import {QuestionsRenderComponent} from './questionsbutton-render.component';
import { RoleChecker } from '../services/role-checker.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare const $: any;

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
})
export class QuestionsComponent implements OnInit {

  source: LocalDataSource = new LocalDataSource;
  public projectList;

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
        type : 'custom',
        width: '100px',
        filter: false,
        valuePrepareFunction: (cell, row) => row,
        renderComponent: QuestionsRenderComponent
      //   return `<a href="#/search/edit/${row.id}"><i class="material-icons">edit</i></a>`;
        // }
      },
      // id: {
      //   title: 'ID',
      //   valuePrepareFunction: (cell,row) => {
      //     return row.id;
      //   }
      // },
      question: {
        title: 'Custom Question',
        valuePrepareFunction: (cell,row) => {
            return row.question;
        }
      },
    }
  };

  constructor(
    private data_api: DatasourceService,
    private formBuilder: FormBuilder,
    private spinnerService: NgxSpinnerService,
    public dialog: MatDialog,
    private rolechecker: RoleChecker
    ) { }

  public ngOnInit() {
      // this.rolechecker.check(4)
      this.getQuestions();
  }

  public getQuestions(){
        this.spinnerService.show();

        this.data_api.getQuestions().subscribe((data) => {
            this.source.load(data);
            // this.projectList = data[0];
            this.spinnerService.hide();
            console.log(data);
        });
  }

  openAddDialog(): void {
      const dialogRef = this.dialog.open(QuestionsAddDialog, {
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

}




@Component({
  selector: 'questions-adddialog',
  templateUrl: 'questions-adddialog.html',
})

export class QuestionsAddDialog implements OnInit {

  addFestForm: FormGroup;

  public userDetails;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<QuestionsAddDialog>,
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
          log: 'Created New Custom Question',
          method: 'create',
          subject: 'question',
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

  public addNewQuestion() {

   
      if (this.addFestForm.invalid) {
        alert('invalid');
        return;
      }

      console.log(this.addFestForm.value);
      
      this.spinnerService.show();

      // let agentData = {
      //     "name": this.addFestForm.value.firstName,
      // };

      this.data_api.addQuestion(this.addFestForm.value)
      .subscribe(
        (result) => {

          

          if(result){

              swal.fire({
                  title: "New Custom Question Created!",
                  // text: "You clicked the button!",
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'btn btn-success',
                  },
                  icon: "success"
              })
             
              this.addLog(result);

              this.spinnerService.hide();
              // this.dialogRef.close('success');

          }else{

            swal.fire({
                title: "Error in Creating New Custom Question",
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
          this.spinnerService.hide();
      }
      
    );  
  }

  ngOnInit() {
    this.addFestForm = this.formBuilder.group({
      question: ['', Validators.required],
    }, {
    });
    if (localStorage.getItem('currentUser')) {
      this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
    }
  }
}