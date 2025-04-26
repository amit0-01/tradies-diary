import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, Inject} from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { AuthenticationService } from '../shared/authentication.service';
import { Router} from '@angular/router';
import { DatasourceService} from '../services/datasource.service';
// import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { take } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare const $: any;

//Metadata
export interface RouteInfo {
    path: string;
    title: string;
    type: string;
    icontype: string;
    collapse?: string;
    children?: ChildrenItems[];
    securitylvl: any;
}

export interface ChildrenItems {
    path: string;
    title: string;
    ab: string;
    type?: string;
}

//Menu Items
export const ROUTES: RouteInfo[] = [
    {
        path: '/dashboard',
        title: 'Dashboard',
        type: 'link',
        icontype: 'dashboard',
        securitylvl: 5,
    },{
        path: '/dashboard-supervisor',
        title: 'Dashboard Supervisor',
        type: 'link',
        icontype: 'dashboard',
        securitylvl: 3,
    },{
        path: '/dashboard-client',
        title: 'Dashboard Client',
        type: 'link',
        icontype: 'dashboard',
        securitylvl: 2,
    },{
        path: '/dashboard-worker',
        title: 'Dashboard Worker',
        type: 'link',
        icontype: 'dashboard',
        securitylvl: 1,
    },{
        path: '/',
        title: 'View Reports',
        type: 'sub',
        icontype: 'find_in_page',
        securitylvl: 5,
        collapse: 'view-report',
        children: [
            // {path: 'options', title: 'Diary Options', ab:'DO'},  
            {path: 'dashboard-daily', title: 'Daily Report', ab:'DR'},
            {path: 'dashboard-weekly', title: 'Weekly Report', ab:'WR'},
        ]
    },{
        path: '/',
        title: 'View Reports',
        type: 'sub',
        icontype: 'find_in_page',
        securitylvl: 3,
        collapse: 'view-report',
        children: [
            // {path: 'options', title: 'Diary Options', ab:'DO'},  
            {path: 'dashboard-daily-supervisor', title: 'Daily Report', ab:'DR'},
            {path: 'dashboard-weekly-supervisor', title: 'Weekly Report', ab:'WR'},
        ]
    },
  //   {
  //     path: '/',
  //     title: 'View Reports',
  //     type: 'sub',
  //     icontype: 'find_in_page',
  //     securitylvl: 2,
  //     collapse: 'view-report',
  //     children: [
  //         // {path: 'options', title: 'Diary Options', ab:'DO'},  
  //         {path: 'dashboard-daily-supervisor', title: 'Daily Report', ab:'DR'},
  //         {path: 'dashboard-weekly-supervisor', title: 'Weekly Report', ab:'WR'},
  //     ]
  // }
  ,{
        path: '/',
        title: 'Create Reports',
        type: 'sub',
        icontype: 'note_add',
        securitylvl: 4,
        collapse: 'create-report',
        children: [
            // {path: 'options', title: 'Diary Options', ab:'DO'},  
            {path: 'daily-report', title: 'Daily Report', ab:'DR'},
            {path: 'weekly-report', title: 'Weekly Report', ab:'WR'},
        ]
      },{
        path: '/worker-logs',
        title: 'Worker Logs',
        type: 'link',
        icontype: 'dashboard',
        securitylvl: 1,
  
    },{
        path: '/projects',
        title: 'Projects',
        type: 'link',
        icontype: 'assignment_turned_in',
        securitylvl: 5,
    },
    {
        path: '/variations',
        title: 'Variations',
        type: 'link',
        icontype: 'note_alt',
        securitylvl: 5,
    },
    {
      path: '/selections',
      title: 'Selections',
      type: 'link',
      icontype: 'note_alt',
      securitylvl: 5,
  },
  {
    path: '/rfi',
    title: 'RFI',
    type: 'link',
    icontype: 'note_alt',
    securitylvl: 5,
},
    {
        path: '/',
        title: 'Global List',
        type: 'sub',
        icontype: 'grading',
        securitylvl: 4,
        collapse: 'global-list',
        children: [
            // {path: 'supervisors', title: 'Supervisors', ab:'SU'},    
            // {path: 'trade-staff', title: 'Trades Staff', ab:'TS'},
            // {path: 'trade-categories', title: 'Trades Categories', ab:'TC'},
            // {path: 'employees', title: 'Employees', ab:'Em'},
            {path: 'visitors', title: 'Visitors', ab:'VI'},
            {path: 'suppliers', title: 'Suppliers', ab:'SU'},
            {path: 'product-categories', title: 'Product Categories', ab:'PC'},
            {path: 'stages', title: 'Stages', ab:'ST'},
            {path: 'costcentres', title: 'Cost Centres', ab:'CC'},
            {path: 'tools', title: 'Tools', ab:'TO'},
            {path: 'products', title: 'Products', ab:'PR'},
            {path: 'reasons', title: 'Reasons', ab:'RE'},
            {path: 'trades', title: 'Trades', ab:'TR'},
            {path: 'uom', title: 'UOM', ab:'UO'},
            {path: 'vargroupnames', title: 'Var Group Names', ab:'VG'},
        ]
    // },{
    //     path: '/archive',
    //     title: 'Archive',
    //     type: 'link',
    //     icontype: 'archive',
    //     securitylvl: 5,
    // },{
    //     path: '/custom-questions',
    //     title: 'Custom Questions',
    //     type: 'link',
    //     icontype: 'question_answer',
    //     securitylvl: 4,
    },{
      path: '/',
      title: 'Project Request',
      type: 'sub',
      icontype: 'contact_page',
      securitylvl: 5,
      collapse: 'proj',
      children: [
          {path: 'project-request', title: 'Request Projects', ab:'RP'},
          {path: 'project-approval', title: 'Approve Projects', ab:'AR'},
      ]
    },{
        path: '/',
        title: 'Settings',
        type: 'sub',
        icontype: 'settings',
        securitylvl: 5,
        collapse: 'settings',
        children: [
            // {path: 'options', title: 'Diary Options', ab:'DO'},  
            
            {path: 'settings-admin', title: 'Admin Settings', ab:'AS'},
            {path: 'settings-variations', title: 'Variation Settings', ab:'VS'},
            {path : 'settings-selections', title : 'Selection Settings', ab : 'SS'},
            {path : 'settings-rfi', title: 'Rfi settings', ab: 'RS'},
            {path: 'manage-users', title: 'Manage Users', ab:'MU'}, 
            {path: 'export-employees', title: 'Employees Timesheet', ab:'ES'},
            {path: 'export-trades', title: 'Trades Timesheet', ab:'ET'},
            {path: 'user-logs', title: 'User Logs', ab:'UL'},
            // {path: 'project-request', title: 'Request Projects', ab:'RP'},
            // {path: 'project-approval', title: 'Approve Projects', ab:'AR'},
        ]

    // },{
    //     path: '/update-password',
    //     title: 'Update Password',
    //     type: 'link',
    //     icontype: 'security',
    //     securitylvl: 3,
    },
    {
      path: '/client-view',
      title: 'Clients',
      type: 'link',
      icontype: 'visibility',
      securitylvl: 5,
  }
];
@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    ps: any;
    public userDetails;
    public userRole;
    public curCompany;
    public companyName;
    public avatarName;
    public logoURL;

    adminData;

    colorHlightDefault;
    colorHoverDefault;

    constructor(
        public authService: AuthenticationService,
        private router: Router,
        private data_api: DatasourceService,
        public dialog: MatDialog,
        ) {
          // this.userRole = 'app_admin';
          // this.authService.userRoleSubject
          // .pipe(take(1)) // completes the observable after 1 take ==> to not run this after user logs out... because the subject will be updated again
          // .subscribe(
          //   userRole => {

          //       this.userRole = userRole;
          //       //console.log(this.userRole);
          //   }
          // )
    }

    isMobileMenu() {
        // if ($(window).width() > 991) {
        //     return false;
        // }
        // return true;
    };

    ngOnInit() {

        this.getAdminSettings();

        this.menuItems = ROUTES.filter(menuItem => menuItem);
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            this.ps = new PerfectScrollbar(elemSidebar);
        }

        if (localStorage.getItem('currentUser')) {
          //console.log(JSON.parse(localStorage.getItem('currentUser')));
          this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
          this.userRole = this.userDetails.userRole;
            // this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
            this.avatarName =  'https://ui-avatars.com/api/?background=0771DE&color=fff&name='+this.userDetails.name;
         }

        // this.authService.userRoleSubject
        //   .pipe(take(1)) // completes the observable after 1 take ==> to not run this after user logs out... because the subject will be updated again
        //   .subscribe(
        //     userRole => {
        //       if (userRole) {
        //         this.userRole = userRole;
        //       }
        //       else {
        //         this.router.navigate(['/pages/login']);
        //       }
        //     }
        //   )

    }
    getAdminSettings(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            //console.log(data);
            this.adminData = data;
            this.colorHlightDefault = data.colourHighlight ? data.colourHighlight : '';
            this.colorHoverDefault = data.colourHover ? data.colourHover : '';

            if(data){
                this.logoURL = data.logo;
            }
            
        }); 
    }

    onButtonEnter2(hoverName: HTMLElement) {
      // hoverName.setAttribute('data-color', hoverName.style.color);
      hoverName.style.color = this.colorHoverDefault ?  this.colorHoverDefault : '';
    }
  
    onButtonOut2(hoverName: HTMLElement) {
      hoverName.style.color = hoverName.getAttribute('data-color');
    }

    updatePS(): void  {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            this.ps.update();
        }
    }
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }

    openFeedbackDialog(): void {
        const dialogRef = this.dialog.open(FeedbackDialog, {
            width: '400px',
            // data: this.renderValue
        });
  
        dialogRef.afterClosed().subscribe(result => {
            //console.log(result);
            if(result == 'success'){   
                setTimeout(function(){
                  window.location.reload();
                }, 1000);  
            }
        });
    }

}

@Component({
    selector: 'feedback-dialog',
    templateUrl: 'feedback-dialog.html',
  })
  
  export class FeedbackDialog implements OnInit {
  
    addFestForm: FormGroup;
    files:string  []  =  [];

    constructor(
      private formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<FeedbackDialog>,
      private data_api: DatasourceService,
      private spinnerService: NgxSpinnerService,
      @Inject(MAT_DIALOG_DATA) public data) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
    get g(){
      return this.addFestForm.controls;
    }
    
    public submitFeedback() {
  
     
        if (this.addFestForm.invalid) {
          alert('invalid');
          return;
        }
  
        //console.log(this.addFestForm.value);
    
        this.spinnerService.show();
  
        // let agentData = {
        //     "name": this.addFestForm.value.firstName,
        // };
  
        this.data_api.submitFeedback(this.addFestForm.value)
        .subscribe(
          (result) => {
            if(result){

                //console.log(result);
                this.submitFeedbackImage(result);
                swal.fire({
                    title: "Client Feedback Submitted!",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "success"
                })
  
                this.spinnerService.hide();
  
                this.dialogRef.close('success');
  
            }else{
  
              swal.fire({
                  title: "Error in Submitting Client Feedback",
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
            //console.log(error)
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
  
    public onSelectedFileMultiple(event) {
        if (event.target.files.length > 0) {
          for (let i = 0; i < event.target.files.length; i++) {
            let file = event.target.files[i]
            this.files.push(file)
            // this.addFestForm.get('multiplefile').setValue(this.files[i]);
            //console.log(this.files)
          }
        }
      }

    public submitFeedbackImage(updateID) {
  
        //console.log(this.files);
    
        this.spinnerService.show();
  
        // let agentData = {
        //     "name": this.addFestForm.value.firstName,
        // };
        const formData = new FormData();

        // this.files.forEach(file => {
        //     formData.append('imagePath[]', file, file.name);
        // })

        for  (var i =  0; i <  this.files.length; i++)  {  
            formData.append("file[]",  this.files[i]);
        } 

        this.data_api.submitFeedbackImage(formData,updateID)
        .subscribe(
          (result) => {
            if(result){

                //console.log(result);
  
                swal.fire({
                    title: "Client Feedback Submitted!",
                    // text: "You clicked the button!",
                    buttonsStyling: false,
                    customClass: {
                      confirmButton: 'btn btn-success',
                    },
                    icon: "success"
                })
  
                this.spinnerService.hide();
  
                this.dialogRef.close('success');
  
            }else{
  
              swal.fire({
                  title: "Error in Submitting Client Feedback",
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
            //console.log(error)
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
      // this.addFestForm = this.formBuilder.group({
      //   subject: ['', Validators.required],
      //   comments: ['', Validators.required],
      //   client: ['', Validators.required],
      //   email: ['', Validators.required],
      //   website: ['', Validators.required],
      //   role: ['', Validators.required],
      //   multiplefile: [''],
      // }, {
      // });

      // let userDetails = JSON.parse(localStorage.getItem('currentUser'));
      // userDetails.user_role = 'administrator';
      
      // var full = window.location.host
      // //window.location.host is subdomain.domain.com
      // var parts = full.split('.')
      // var sub = parts[0]

      // this.addFestForm.patchValue({
      //   client: userDetails.user_display_name,
      //   email: userDetails.user_email,
      //   role: userDetails.user_role,
      //   website: sub+'.tradiesdiary.com'
      // });

      
    }
  }