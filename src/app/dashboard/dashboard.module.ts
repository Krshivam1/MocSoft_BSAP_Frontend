import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { HomepageComponent } from '../homepage/homepage.component';
import { ReportComponent } from '../report/report.component';
import { CommunicationsComponent } from '../communications/communications.component';
import { CrimeModusComponent } from '../crime-modus/crime-modus.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    DashboardComponent,
    HomeComponent,
    UsersComponent,
    SettingsComponent,
    ProfileComponent,
    HomepageComponent,
    ReportComponent,
    CommunicationsComponent,
    CrimeModusComponent
  ],
  declarations: []
})
export class DashboardModule { }