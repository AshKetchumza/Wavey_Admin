var myApp = angular.module('myApp', ['ng-admin']);
myApp.config(['NgAdminConfigurationProvider', function (nga) {
    var admin = nga.application('Wavey Admin')
      .baseApiUrl('http://37.139.16.48:8080/api/'); // main API endpoint

//USER VIEWING/CREATION
      var users = nga.entity('users').identifier(nga.field('_id'));
      users.listView().fields([
      // use the name as the link to the detail view - the edition view
      nga.field('username'),
      nga.field('email')
  ])
  .filters([
      nga.field('q')
          .label('')
          .pinned(true)
          .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>'),
      nga.field('userId', 'reference')
          .targetEntity(users)
          .targetField(nga.field('username'))
          .label('User')
  ]);

  users.creationView().fields([
    nga.field('username')
        .attributes({ placeholder: 'No space allowed, 5 chars min' })
        .validation({ required: true, pattern: '[A-Za-z0-9\.\-_]{5,20}' }),
    nga.field('email')
        .validation({ required: true })
        .label('Email'),
    nga.field('password', 'password')
        .validation({ required: true })
        .label('Password'),
]);
users.editionView().fields(users.creationView().fields());
  admin.addEntity(users);

// MENU
    admin.menu(nga.menu()
    .addChild(nga.menu(users).icon('<span class="glyphicon glyphicon-user"></span>'))
);

    nga.configure(admin);
}]);

myApp.config(['RestangularProvider', function (RestangularProvider) {
    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {
        if (operation == "getList") {
            // custom pagination params
            if (params._page) {
                params._start = (params._page - 1) * params._perPage;
                params._end = params._page * params._perPage;
            }
            delete params._page;
            delete params._perPage;
            // custom sort params
            if (params._sortField) {
                params._sort = params._sortField;
                params._order = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }
            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }
        }
        return { params: params };
    });
}]);
