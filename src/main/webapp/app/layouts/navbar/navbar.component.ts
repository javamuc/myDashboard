import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import SharedModule from 'app/shared/shared.module';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { LANGUAGES } from 'app/config/language.constants';
import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { EntityNavbarItems } from 'app/entities/entity-navbar-items';
import { environment } from 'environments/environment';
import ActiveMenuDirective from './active-menu.directive';
import NavbarItem from './navbar-item.model';
import { HomeService, HomeComponent } from '../../home/home.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QuickIdeaComponent } from '../../shared/idea/quick-idea.component';

@Component({
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    RouterModule,
    SharedModule,
    HasAnyAuthorityDirective,
    ActiveMenuDirective,
    NgbDropdownModule,
    FontAwesomeModule,
    QuickIdeaComponent,
  ],
  standalone: true,
})
export default class NavbarComponent implements OnInit {
  inProduction?: boolean;
  isNavbarCollapsed = signal(true);
  languages = LANGUAGES;
  openAPIEnabled?: boolean;
  version = '';
  account = inject(AccountService).trackCurrentAccount();
  entitiesNavbarItems: NavbarItem[] = [];
  activeComponent = signal<HomeComponent>('dashboard');

  private readonly loginService = inject(LoginService);
  private readonly translateService = inject(TranslateService);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeService);

  constructor() {
    const { VERSION } = environment;
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.openAPIEnabled = profileInfo.openAPIEnabled;
    });

    // Subscribe to active component changes
    this.homeService.getActiveComponent().subscribe(component => {
      this.activeComponent.set(component);
    });
  }

  isActive(component: HomeComponent): boolean {
    return this.activeComponent() === component;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only trigger if no input/textarea is focused
    const isInputFocused = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
    // And both command and shift are not pressed
    if (!isInputFocused && !event.metaKey && !event.shiftKey) {
      if (event.key === '1') {
        event.preventDefault();
        this.switchToHome();
      } else if (event.key === '2') {
        event.preventDefault();
        this.switchToBoard();
      } else if (event.key === '3') {
        event.preventDefault();
        this.switchToNotes();
      } else if (event.key === '4') {
        event.preventDefault();
        this.switchToHabits();
      }
    }
  }

  switchToHome(): void {
    this.homeService.setActiveComponent('dashboard');
  }

  switchToTasks(): void {
    this.homeService.setActiveComponent('task');
  }

  switchToBoard(): void {
    this.homeService.setActiveComponent('board');
  }

  switchToNotes(): void {
    this.homeService.setActiveComponent('notes');
  }

  switchToHabits(): void {
    this.homeService.setActiveComponent('habit');
  }

  changeLanguage(languageKey: string): void {
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed.update(isNavbarCollapsed => !isNavbarCollapsed);
  }
}
