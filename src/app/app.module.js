/**
 * Root module for the app.
 */
angular.module('caiLunAdminUi', [

    // app sub-modules
    'caiLunAdminUi.common',
    'caiLunAdminUi.login',
    'caiLunAdminUi.projects',

    // third-party modules
    'ui.router',
    'ngAnimate',
    'ngMaterial',
    'angularUtils.directives.dirPagination',
    'angular-loading-bar'
]);