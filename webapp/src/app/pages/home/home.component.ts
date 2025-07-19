import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UtilsService } from '../../_services/utils.service';
import { AuthService } from '../../_services/auth.service';
import { ShortMembership } from '../../_classes/membership';

@Component({
    selector: 'app-home',
    imports: [RouterModule, CommonModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(public utilsService: UtilsService) {
    this.utilsService.sidebarLayout.next(false);
  }
  ngOnInit(): void {}
}
