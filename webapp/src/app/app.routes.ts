import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { ExoChallengeComponent } from './pages/exo-challenge/exo-challenge.component';
import { AboutComponent } from './pages/about/about.component';
import { GamemodeComponent } from './components/gamemode/gamemode.component';
import { MysteryItemComponent } from './pages/mystery-item/mystery-item.component';
import { BeforeLeavingGamemodeGuard } from './_guards/candeactivate.guard';
import { SingleItemComponent } from './pages/single-item/single-item.component';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback.component';
import { SelectMembershipComponent } from './pages/select-membership/select-membership.component';
import { AuthErrorComponent } from './components/auth-error/auth-error.component';
import { AccountSettingsComponent } from './pages/account-settings/account-settings.component';

export const routes: Routes = [
  { path: 'about', component: AboutComponent },

  {
    path: 'gamemode',
    children: [
      { path: '', component: GamemodeComponent },
      {
        path: 'exo-challenge',
        title: $localize`Exo-Challenge - Destiny 2 Guessr`,
        component: ExoChallengeComponent,
        canDeactivate: [BeforeLeavingGamemodeGuard],
      },
      {
        path: 'mystery-item',
        title: $localize`Objet Mystère - Destiny 2 Guessr`,
        component: MysteryItemComponent,
        canDeactivate: [BeforeLeavingGamemodeGuard],
      },
    ],
  },

  {
    path: 'collections',
    children: [
      { path: '', component: CollectionsComponent },
      { path: ':id/:name', component: SingleItemComponent },
    ],
  },
  {
    path: 'account-settings',
    component: AccountSettingsComponent,
  },

  {
    path: 'auth-callback',
    component: AuthCallbackComponent,
  },

  { path: 'auth-error', component: AuthErrorComponent },

  { path: 'select-membership', component: SelectMembershipComponent },

  { path: '404', component: NotfoundComponent },
  { path: '', title: 'Destiny 2 Guessr', component: HomeComponent },
  { path: '**', redirectTo: '' },
];
