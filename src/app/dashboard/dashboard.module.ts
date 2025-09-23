import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { RoleComponent } from './role/role.component';
import { StateComponent } from './state/state.component';
import { RangeComponent } from './range/range.component';
import { DistrictComponent } from './district/district.component';
import { UserComponent } from './user/user.component';
import { ModulesComponent } from './modules/modules.component';
import { TopicsComponent } from './topics/topics.component';
import { SubtopicsComponent } from './subtopics/subtopics.component';
import { QuestionsComponent } from './questions/questions.component';
import { ReportComponent } from './report/report.component';
import { CommunicationsComponent } from './communications/communications.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
     NgbModule,
    DashboardRoutingModule,
    DashboardComponent,
    HomeComponent,
    UsersComponent,
    SettingsComponent,
    ProfileComponent,
    ReactiveFormsModule, // ✅ Required for formGroup, formControlName, etc.
    

  ],
  declarations: [
    RoleComponent,
    // PermissionsComponent,
    //  MenusComponent,
    // SubmenusComponent,
    StateComponent,
    RangeComponent,
    DistrictComponent,
    UserComponent,
    // ModulesComponent,
    TopicsComponent,
   SubtopicsComponent,
    QuestionsComponent,
    ReportComponent,
    CommunicationsComponent   
  ]
})
export class DashboardModule { }