import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { AdminGuard } from './shared/admin.guard';

export const AppRoutes: Routes = [
    { 
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full' }, 
    // {
    //   path: '',
    //   component: AdminLayoutComponent,
    //   canActivate: [AdminGuard],
    // //   data: {
    // //     role: 'app_admin'
    // //   },
    //   children: [
        {
            path: 'dashboard',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardnew/dashboard.module').then(m => m.DashboardNewModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
              }
        }, {
            path: 'dashboard-client',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardclient/dashboardclient.module').then(m => m.DashboardClientModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_owner'
                }
        }, {
            path: 'dashboard-variants',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardvariants/dashboardvariants.module').then(m => m.DashboardVariantsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_owner, app_admin'
                }
        },
        {
            path: 'dashboard-selection',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardselections/dashboardselections.module').then(m => m.DashboardselectionsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_owner, app_admin'
                }
        }, 
        {
            path: 'dashboard-rfi',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardrfi/dashboardrfi.module').then(m => m.DashboardrfiModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_owner, app_admin'
                }
        },{
            path: 'dashboard-worker',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardworker/dashboardworker.module').then(m => m.DashboardWorkerModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_worker'
                }
        }, {
            path: 'dashboard-supervisor',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardsupervisor/dashboardsupervisor.module').then(m => m.DashboardSupervisorModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_supervisor'
                }
        }, {
            path: 'dashboard-daily',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboarddaily/dashboard.module').then(m => m.DashboardDailyModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
                }
        }, {
            path: 'dashboard-daily-supervisor',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboarddailysupervisor/dashboard.module').then(m => m.DashboardDailySupervisorModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_supervisor,project_owner'
                }
        }, {
            path: 'dashboard-weekly',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardweekly/dashboard.module').then(m => m.DashboardWeeklyModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
                }
        }, {
            path: 'dashboard-weekly-supervisor',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dashboardweeklysupervisor/dashboard.module').then(m => m.DashboardWeeklySupervisorModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_supervisor,project_owner'
                }
        }, {
            path: 'daily-report',
            component: AdminLayoutComponent,
            loadChildren: () => import('./dailyreport/dailyreport.module').then(m => m.DailyReportModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor,project_owner'
                }
        }, {
            path: 'weekly-report',
            component: AdminLayoutComponent,
            loadChildren: () => import('./weeklyreport/weeklyreport.module').then(m => m.WeeklyReportModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor, project_owner'
                }
        }, {
            path: 'projects',
            component: AdminLayoutComponent,
            loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'trades',
            component: AdminLayoutComponent,
            loadChildren: () => import('./trades/trades.module').then(m => m.TradesModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        // }, {
        //     path: 'trade-staff',
        //     loadChildren: () => import('./tradestaff/tradestaff.module').then(m => m.TradeStaffModule)
        }, {
            path: 'trade-categories',
            component: AdminLayoutComponent,
            loadChildren: () => import('./tradecategories/tradecategories.module').then(m => m.TradeCategoriesModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        // }, {
        //     path: 'employees',
        //     loadChildren: () => import('./employees/employees.module').then(m => m.EmployeesModule)
        }, {
            path: 'visitors',
            component: AdminLayoutComponent,
            loadChildren: () => import('./visitors/visitors.module').then(m => m.VisitorsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'uom',
            component: AdminLayoutComponent,
            loadChildren: () => import('./uom/uom.module').then(m => m.UomModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'suppliers',
            component: AdminLayoutComponent,
            loadChildren: () => import('./suppliers/suppliers.module').then(m => m.SuppliersModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'product-categories',
            component: AdminLayoutComponent,
            loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'stages',
            component: AdminLayoutComponent,
            loadChildren: () => import('./stages/stages.module').then(m => m.StagesModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'costcentres',
            component: AdminLayoutComponent,
            loadChildren: () => import('./costcentres/costcentres.module').then(m => m.CostcentresModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'tools',
            component: AdminLayoutComponent,
            loadChildren: () => import('./tools/tools.module').then(m => m.ToolsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'reasons',
            component: AdminLayoutComponent,
            loadChildren: () => import('./reasons/reasons.module').then(m => m.ReasonsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'vargroupnames',
            component: AdminLayoutComponent,
            loadChildren: () => import('./vargroupnames/vargroupnames.module').then(m => m.VarGroupNamesModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'products',
            component: AdminLayoutComponent,
            loadChildren: () => import('./products/products.module').then(m => m.ProductsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor'
            }
        }, {
            path: 'settings-admin',
            component: AdminLayoutComponent,
            loadChildren: () => import('./settingsadmin/settingsadmin.module').then(m => m.SettingsAdminModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'settings-variations',
            component: AdminLayoutComponent,
            loadChildren: () => import('./settingsvariations/settingsvariations.module').then(m => m.SettingsVariationsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'settings-selections',
            component: AdminLayoutComponent,
            loadChildren: () => import('./settingsselections/settingsselections.module').then(m => m.SettingsselectionsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }
        , {
            path: 'settings-rfi',
            component: AdminLayoutComponent,
            loadChildren: () => import('./settings-rfi/settings-rfi.module').then(m => m.SettingsRfiModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'manage-users',
            component: AdminLayoutComponent,
            loadChildren: () => import('./users/users.module').then(m => m.UsersModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'custom-questions',
            component: AdminLayoutComponent,
            loadChildren: () => import('./questions/questions.module').then(m => m.QuestionsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'update-password',
            component: AdminLayoutComponent,
            loadChildren: () => import('./updatepassword/updatepassword.module').then(m => m.UpdatePasswordModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin,project_supervisor,project_owner,project_worker'
            }
        }, {
            path: 'archive',
            component: AdminLayoutComponent,
            loadChildren: () => import('./archive/archive.module').then(m => m.ArchiveModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'report-weekly',
            component: AdminLayoutComponent,
            loadChildren: () => import('./reportweekly/reportweekly.module').then(m => m.ReportWeeklyModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'report-daily',
            component: AdminLayoutComponent,
            loadChildren: () => import('./reportdaily/reportdaily.module').then(m => m.ReportDailyModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'user-logs',
            component: AdminLayoutComponent,
            loadChildren: () => import('./logs/logs.module').then(m => m.LogsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'export-employees',
            component: AdminLayoutComponent,
            loadChildren: () => import('./export/export.module').then(m => m.ExportModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'export-trades',
            component: AdminLayoutComponent,
            loadChildren: () => import('./exportTrades/export-trades.module').then(m => m.ExportTradesModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'options',
            component: AdminLayoutComponent,
            loadChildren: () => import('./options/options.module').then(m => m.OptionsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'project-request',
            component: AdminLayoutComponent,
            loadChildren: () => import('./projectrequest/projectrequest.module').then(m => m.ProjectRequestModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'project-approval',
            component: AdminLayoutComponent,
            loadChildren: () => import('./projectapproval/projectapproval.module').then(m => m.ProjectApprovalModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'worker-logs',
            component: AdminLayoutComponent,
            loadChildren: () => import('./workerlogs/workerlogs.module').then(m => m.WorkerLogsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'project_worker'
            }
        }, {
            path: 'variations',
            component: AdminLayoutComponent,
            loadChildren: () => import('./variations/variations.module').then(m => m.VariationsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'selections',
            component: AdminLayoutComponent,
            loadChildren: () => import('./selections/selections.module').then(m => m.SelectionsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'rfi',
            component: AdminLayoutComponent,
            loadChildren: () => import('./rfi/rfi.module').then(m => m.RFIModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'schedule',
            component: AdminLayoutComponent,
            loadChildren: () => import('./schedule/schedule.module').then(m => m.ScheduleModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }, {
            path: 'changelogs',
            component: AdminLayoutComponent,
            loadChildren: () => import('./changelogs/changelogs.module').then(m => m.ChangelogsModule),
            canActivate: [AdminGuard],
            data: {
                role: 'app_admin'
            }
        }
    ,{
      path: '',
      component: AuthLayoutComponent,
      children: [{
        path: 'pages', 
        loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
      }]
    },
    {
        path: 'client-view',
        component: AdminLayoutComponent,
        loadChildren: () => import('./dasboard-admin-see-as-client-view/dasboard-admin-see-as-client-view.module').then(m => m.DasboardAdminSeeAsClientViewModule),
        canActivate: [AdminGuard],
        data: {
            role: 'app_admin'
            }
    },
];
