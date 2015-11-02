module meshAdminUi {

    class UserListController {
        private groups: IUserGroup[];
        private users: IUser[];

        constructor(private $q: ng.IQService,
                    private $timeout: ng.ITimeoutService,
                    private notifyService: NotifyService,
                    private dataService: DataService) {
            $q.all([
                dataService.getGroups(),
                dataService.getUsers()
            ])
                .then((dataArray: any[]) => {
                    this.groups = dataArray[0].data;
                    this.users = dataArray[1].data;
                });
        }

        public validateGroup(group, user: IUser) {
            // TODO: user.groups will be a noderef rather than a string.
            var userAlreadyInGroup = user.groups.map(group => group).indexOf(group.name) > -1;

            if (userAlreadyInGroup || !group.name) {
                this.notifyService.toast(`User already in group "${group.name}"`);
                this.$timeout(() => user.groups = user.groups.filter(group => typeof group !== 'undefined'));
            } else {
                return group;
            }
        }

        public userDisplayName(user: IUser): string {
            if (user.firstname && user.lastname) {
                return user.firstname + ' ' + user.lastname;
            } else {
                return user.username;
            }
        }

        public displayChipName(chip: any) {
            return (chip && chip.name) ? chip.name : chip;
        }

        /**
         * Search for thing.
         */
        public filterBy(collection, query) {
            return query ? collection.filter(this.createFilterFor(query)) : [];
        }

        /**
         * Create filter function for a query string
         */
        private createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return item => item.name.toLowerCase().indexOf(lowercaseQuery) === 0;
        }
    }

    angular.module('meshAdminUi.admin')
          .controller('UserListController', UserListController);

}