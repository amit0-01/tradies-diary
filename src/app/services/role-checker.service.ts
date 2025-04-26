import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';

@Injectable({
    providedIn: 'root'
  })

export class RoleChecker{

    constructor(private router: Router, public authService: AuthenticationService) {}

    userDetails = JSON.parse(localStorage.getItem('currentUser'));

    // log(msg: any){ 
    //     console.log(msg); 
    // }

    check(level: any){
        if(level == 1){
            //crew only
        }else if(level == 2){
            //client
            if(this.userDetails.user_role !='project_supervisor'){
                this.router.navigate(['/dashboard-worker']);
            }
        }else if(level == 3){
            //client
            if(this.userDetails.user_role !='project_owner'){
                this.router.navigate(['/dashboard-supervisor']);
            }
        }else if(level == 4){
            //admin only
            if((this.userDetails.user_role !='admin') && (this.userDetails.user_role !='app_admin') && (this.userDetails.user_role !='administrator')){


                
                if(this.userDetails.user_role =='project_owner'){
                   this.router.navigate(['/dashboard-client']);
                }else if(this.userDetails.user_role =='project_supervisor'){
                    this.router.navigate(['/dashboard-supervisor']);
                }else if(this.userDetails.user_role =='project_worker'){
                    this.router.navigate(['/dashboard-worker']);
                }else{
                    // this.authService.logout();
                }

            }
        }
    }

    returnRole(){
        return this.userDetails.user_role;
    }
}