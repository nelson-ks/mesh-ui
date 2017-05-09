import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { IBreadcrumbRouterLink } from 'gentics-ui-core';

/**
 * A breadcrumbs component which reads the route config and any route that has a `data.breadcrumb` property will
 * be displayed in the breadcrumb trail.
 *
 * The `breadcrumb` property can be a string or a function. If a function, it will be passed the route's `data`
 * object (which will include all resolved keys) and any route params, and should return a string.
 */
@Component({
    selector: 'admin-breadcrumbs',
    templateUrl: './admin-breadcrumbs.component.html',
    styleUrls: ['./admin-breadcrumbs.scss']
})
export class AdminBreadcrumbsComponent implements OnInit, OnDestroy {
    breadcrumbs: IBreadcrumbRouterLink[];
    subscription: Subscription;

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.subscription = this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe(() => {
                this.breadcrumbs = [];
                let currentRoute: ActivatedRoute | null = this.route.root;
                let routeDef: any[] = [];
                do {
                    let childRoutes = currentRoute.children;
                    currentRoute = null;
                    childRoutes.forEach((route: ActivatedRoute) => {
                        if (route.outlet === PRIMARY_OUTLET) {
                            let routeSnapshot = route.snapshot;
                            routeDef = routeSnapshot.url.map(segment => segment.path);
                            let breadcrumb = route.routeConfig && route.routeConfig.data && route.routeConfig.data['breadcrumb'];
                            if (breadcrumb) {
                                let text = typeof breadcrumb === 'function' ? breadcrumb(routeSnapshot.data, routeSnapshot.params) : breadcrumb;
                                this.breadcrumbs.push({ text, route: routeDef });
                            }
                            currentRoute = route;
                        }
                    });
                } while (currentRoute);
            });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
