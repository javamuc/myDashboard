import { Component, ElementRef, HostListener, OnInit, Renderer2, RendererFactory2, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AsyncPipe } from '@angular/common';
import { SidebarService } from '../sidebar/sidebar.service';
import { TaskComponent } from '../../shared/task/task.component';
import { Task } from '../../shared/task/task.model';
import { BoardService } from '../../shared/board/board.service';

import { AccountService } from 'app/core/auth/account.service';
import { AppPageTitleStrategy } from 'app/app-page-title-strategy';
import { NoteEditorComponent } from 'app/notes/note-editor/note-editor.component';
import FooterComponent from '../footer/footer.component';
import PageRibbonComponent from '../profiles/page-ribbon.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'jhi-main',
  templateUrl: './main.component.html',
  providers: [AppPageTitleStrategy],
  imports: [RouterOutlet, FooterComponent, PageRibbonComponent, SidebarComponent, AsyncPipe, TaskComponent, NoteEditorComponent],
  standalone: true,
})
export default class MainComponent implements OnInit {
  private readonly renderer: Renderer2;

  private readonly router = inject(Router);
  private readonly appPageTitleStrategy = inject(AppPageTitleStrategy);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);
  private readonly rootRenderer = inject(RendererFactory2);
  private readonly sidebarService = inject(SidebarService);
  private readonly boardService = inject(BoardService);

  constructor(private elementRef: ElementRef) {
    this.renderer = this.rootRenderer.createRenderer(document.querySelector('html'), null);
  }

  ngOnInit(): void {
    // try to log in automatically
    this.accountService.identity().subscribe();

    this.translateService.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
      this.appPageTitleStrategy.updateTitle(this.router.routerState.snapshot);
      dayjs.locale(langChangeEvent.lang);
      this.renderer.setAttribute(document.querySelector('html'), 'lang', langChangeEvent.lang);
    });
  }

  protected isOpen(): Observable<boolean> {
    return this.sidebarService.getIsOpen();
  }

  protected activeComponent(): Observable<'task' | 'note' | null> {
    return this.sidebarService.getActiveComponent();
  }

  protected onSidebarClose(): void {
    this.sidebarService.setIsOpen(false);
    this.sidebarService.setActiveComponent(null);
  }
}
