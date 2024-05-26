import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { CollectionsComponent } from './pages/collections/collections.component';
import { SingleCollectibleComponent } from './pages/single-collectible/single-collectible.component';
import { ExoChallengeComponent } from './pages/exo-challenge/exo-challenge.component';
import { AboutComponent } from './pages/about/about.component';
import { GamemodeComponent } from './components/gamemode/gamemode.component';
import { MysteryWeaponComponent } from './pages/mystery-weapon/mystery-weapon.component';

export const routes: Routes = [
    {path: '', title:"Destiny 2 Guessr", component:HomeComponent},
    {path: '404', component:NotfoundComponent},
    {path: 'collections', component:CollectionsComponent},
    {path: "collections/:id", component:SingleCollectibleComponent},
    {path : "gamemode", component:GamemodeComponent},
    {path: "gamemode/exo-challenge", title: "Exo-Challenge - Destiny 2 Guessr", component:ExoChallengeComponent},
    {path:"gamemode/mystery-weapon", title : $localize`Arme Mystère - Destiny 2 Guessr`, component:MysteryWeaponComponent},
    {path:"about", component:AboutComponent},
    {path: '**', redirectTo: "/404"},
    
];
