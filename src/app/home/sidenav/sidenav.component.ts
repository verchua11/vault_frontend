import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

declare var $;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  selectedNav: string;

  constructor(private renderer: Renderer2, private router: Router) {}

  ngOnInit(): void {}

  sidenavOverlayClicked() {
    // this.StateService.sidenavStateUpdated(false);
  }

  navItemClicked(navItem) {
    if ($(navItem).attr('class').indexOf('subnavi-open') !== -1)
      this.renderer.removeClass(navItem, 'subnavi-open');
    else this.renderer.addClass(navItem, 'subnavi-open');
  }

  navigateTo(route: string) {
    this.selectedNav = route;
    this.router.navigateByUrl(`/agile/${route}`);
  }
}
