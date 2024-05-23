import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { SingleCollectibleComponent } from './pages/single-collectible/single-collectible.component';
import { ExoChallengeComponent } from './pages/exo-challenge/exo-challenge.component';

export const routes: Routes = [
    {path: '', component:HomeComponent},
    {path: '404', component:NotfoundComponent},
    {path: 'collections', component:CollectionsComponent},
    {path: "collections/:id", component:SingleCollectibleComponent},
    {path: "exo-challenge", component:ExoChallengeComponent},
    {path: '**', redirectTo: "/404"},
    
];
