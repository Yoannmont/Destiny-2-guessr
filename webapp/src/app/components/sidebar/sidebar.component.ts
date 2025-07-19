import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UtilsService } from '../../_services/utils.service';
import { AuthService } from '../../_services/auth.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    imports: [RouterModule, CommonModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(
    public utilsService: UtilsService,
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService
      .logout()
      .pipe(
        finalize(() => {
          this.authService.removeAccessToken();
          this.authService.removeAccount();
          this.router.navigate(['/']);
        })
      )
      .subscribe(() => {
        console.log('>>> Successfully logged out');
      });
  }
}
