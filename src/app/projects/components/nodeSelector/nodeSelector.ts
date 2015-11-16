module meshAdminUi {

    export interface INodeSelectOptions {
        allow?: string[];
        title?: string;
        multiSelect?: boolean;
        displayMode?: string;
        containersOnly?: boolean;
    }

    /**
     * The nodeSelector service is used to configure and display a node selector modal dialog.
     */
    export class NodeSelector{

        constructor(private $mdDialog: ng.material.IDialogService) {
        }

        /**
         * Opens the node selector dialog. Accepts an `options` object where the following
         * options may be configured:
         *
         * - allow: array, allowed schema types to filter by.
         * - title: string, title of the dialog box.
         * - multiSelect: bool, whether more than one node may be selected.
         * - displayMode: string, either 'list' or 'grid'
         */
        public open(options?: INodeSelectOptions) {

            options = options || {};

            function nodeSelectDialogController($mdDialog: ng.material.IDialogService) {
                var dialog = this;
                dialog.select = select;
                dialog.cancel = cancel;
                dialog.selectedNodes = [];

                function select() {
                    $mdDialog.hide(dialog.selectedNodes);
                }

                function cancel() {
                    $mdDialog.cancel();
                }
            }

            return this.$mdDialog.show({
                templateUrl: 'projects/components/nodeSelector/nodeSelectorDialog.html',
                controller: nodeSelectDialogController,
                controllerAs: 'dialog',
                locals: {
                    allow: options.allow || [],
                    containersOnly: options.containersOnly || false,
                    title: options.title || 'Select Node',
                    multiSelect: options.multiSelect || false,
                    displayMode: options.displayMode || 'list'
                },
                bindToController: true
            });
        }
    }

    class NodeSelectorController {

        private selectedNodesHash;
        private currentProject: IProject;
        private currentNode: INode;
        private selectedNodes: INode[];
        private multiSelect: boolean;
        private allowedSchemas: string[];
        private containersOnly: boolean;
        private nodes;
        private breadcrumbs: any[];
        private filterNodes;
        private q: string;

        constructor(private dataService: DataService,
                    mu: MeshUtils,
                    private contextService: ContextService) {

            this.selectedNodesHash = {};
            this.currentProject = contextService.getProject();
            this.currentNode = contextService.getCurrentNode();
            this.selectedNodes = this.selectedNodes instanceof Array ? this.selectedNodes : [];

            dataService.getNode(this.currentProject.name, this.currentProject.rootNodeUuid)
                .then(node => this.currentNode = node)
                .then(() => this.populateContents());

            this.filterNodes = (node: INode) => {
                return mu.nodeFilterFn(node, this.q);
            }
        }


        public toggleSelect(node: INode, event: Event) {
            if (this.isAllowedSchema(node)) {
                if (this.isSelected(node)) {
                    this.deselectNode(node);
                } else {
                    this.selectNode(node);
                }
            } else {
                this.openNode(node, event);
            }
        }

        public selectNode(node) {
            if (!this.multiSelect) {
                this.selectedNodesHash = {};
                this.selectedNodes = [];
            }
            this.selectedNodesHash[node.uuid] = node;
            this.selectedNodes.push(node);
        }

        public deselectNode(node) {
            delete this.selectedNodesHash[node.uuid];
            this.selectedNodes = this.selectedNodes.filter(function (n) {
                return n.uuid !== node.uuid;
            });
        }

        public isSelected(node) {
            if (node && node.uuid) {
                return !!this.selectedNodesHash[node.uuid];
            } else {
                return false;
            }
        }

        public openNode(node: INode, event: Event) {
            if (node.container !== false) {
                event.stopPropagation();
                this.dataService.getNode(this.currentProject.name, node.uuid)
                    .then(node => {
                        this.currentNode = node;
                        this.populateContents();
                    });
            }
        }

        private populateContents() {
            this.dataService.getChildNodes(this.currentProject.name, this.currentNode.uuid)
                .then(response => {
                    this.nodes = response.data.filter(node => this.isAllowedSchemaOrFolder(node));
                    return this.dataService.getBreadcrumb(this.currentProject, this.currentNode);
                })
                .then(breadcrumbs => {

                    let breadcrumbLabels = breadcrumbs.map(node => {
                        return {
                            name: node.fields[node.displayField],
                            uuid: node.uuid
                        };
                    });

                    breadcrumbLabels.push({
                        name: this.currentProject.name,
                        uuid: this.currentProject.rootNodeUuid
                    });

                    this.breadcrumbs = breadcrumbLabels.reverse();
                });
        }

        public isAllowedSchema(node: INode) {
            if (0 < this.allowedSchemas.length) {
                return -1 < this.allowedSchemas.indexOf(node.schema.name);
            } else {
                return true;
            }
        }

        private isAllowedSchemaOrFolder(node: INode) {
            if (!this.isAllowedSchema(node) && !node.container) {
                return false;
            }
            if (this.containersOnly) {
                return !!node.container;
            }
            return true;
        }
    }

    function nodeSelectorDirective() {

        return {
            restrict: 'E',
            templateUrl: 'projects/components/nodeSelector/nodeSelector.html',
            controller: 'nodeSelectorController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                selectedNodes: '=',
                allowedSchemas: '=',
                multiSelect: '=',
                displayMode: '=',
                containersOnly: '='
            }
        };
    }

    angular.module('meshAdminUi.projects')
           .service('nodeSelector', NodeSelector)
           .controller('nodeSelectorController', NodeSelectorController)
           .directive('nodeSelector', nodeSelectorDirective);


}