import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/shared/authentication.service';
import { DatasourceService} from '../../services/datasource.service';
import {ActivatedRoute, Params, Router, ParamMap} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { take } from 'rxjs/operators';

declare var $: any;

@Component({
    selector: 'app-login-cmp',
    templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit, OnDestroy {
    test: Date = new Date();
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    public logoURL;
    isSignedIn = false
    userRole;
    userDetails;

    constructor(
        private element: ElementRef, 
        public authService: AuthenticationService,
        private data_api: DatasourceService,
        private router: Router,
        private spinnerService: NgxSpinnerService,
        ) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }
    

    ngOnInit() {

       this.data_api.getFBUsers().subscribe((data) => {
        console.log(data, 'data')
       })

        if(localStorage.getItem('user')!== null)
        this.isSignedIn= true
        else
        this.isSignedIn = false

        this.getLogo();
        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }
    getLogo(){
        this.data_api.getFBAdminSettings().subscribe((data) => {
            console.log(data);
            this.logoURL = data.logo;
        }); 
    }
    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function() {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
    forgotPassword(){
        this.router.navigate(['/pages/forgot-password']);
    }
    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('login-page');
      body.classList.remove('off-canvas-sidebar');
    }

    async onSignup(email:string,password:string){
        await this.authService.signup(email,password)
        // if(this.authService.isLoggedIn)
        this.isSignedIn = true
    }
    // onSignin(email:string,password:string){
    //     this.spinnerService.show();

    //     this.authService.signin(email,password)
    //     .then(resp => {
    //         this.spinnerService.hide();
    //         $.notify({
    //             icon: 'notifications',
    //             message: 'Welcome to <b> Dashboard</b>.'
    //         }, {
    //             type: 'success',
    //             timer: 1000,
    //             placement: {
    //                 from: 'top',
    //                 align: 'center'
    //             },
    //             template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
    //                 '<button mat-button type="button" aria-hidden="true" class="close" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
    //                 '<i class="material-icons" data-notify="icon">notifications</i> ' +
    //                 '<span data-notify="title">{1}</span> ' +
    //                 '<span data-notify="message">{2}</span>' +
    //                 '<div class="progress" data-notify="progressbar">' +
    //                 '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
    //                 '</div>' +
    //                 '<a href="{3}" target="{4}" data-notify="url"></a>' +
    //             '</div>'
    //         });

    //         this.doClaimsNavigation();

    //     })
    //     .catch(error => {
    //         this.spinnerService.hide();
    //         const errorCode = error.code;
    
    //         if (errorCode === 'auth/wrong-password') {
    //           alert('Wrong password!');
    //         }
    //         else if (errorCode === 'auth/user-not-found') {
    //             alert('User with given username does not exist!');
    //         } else {
    //             alert(`Error: ${errorCode}.`);
    //         }
    //     });
     
    // }

    doClaimsNavigation() {

      

        if (localStorage.getItem('currentUser')) {
            // console.log(JSON.parse(localStorage.getItem('currentUser')));
            this.userDetails = JSON.parse(localStorage.getItem('currentUser'));
            this.userRole = this.userDetails.userRole;
            // console.log(this.userRole);
            if (this.userRole == 'app_admin') {
                this.router.navigate(['/dashboard']);
              }else if(this.userRole == 'project_supervisor') {
                this.router.navigate(['/dashboard-supervisor']);
              }else if(this.userRole == 'project_owner') {
                this.router.navigate(['/dashboard-client']);
              }else if(this.userRole == 'project_worker') {
                this.router.navigate(['/dashboard-worker']);
              }
              else {
                this.router.navigate(['/pages/login']);
              }
        }
    }
    //     this.authService.userRoleSubject
    //       .pipe(take(1)) 
    //       .subscribe(
    //         userRole => {
    //             console.log(userRole);
    //           if (userRole == 'app_admin') {
    //             this.router.navigate(['/dashboard']);
    //           }else if(userRole == 'project_supervisor') {
    //             this.router.navigate(['/dashboard-supervisor']);
    //           }else if(userRole == 'project_owner') {
    //             this.router.navigate(['/dashboard-client']);
    //           }else if(userRole == 'project_worker') {
    //             this.router.navigate(['/dashboard-worker']);
    //           }
    //           else {
    //             this.router.navigate(['/pages/login']);
    //           }
    //         }
    //       )
    //   }

}
