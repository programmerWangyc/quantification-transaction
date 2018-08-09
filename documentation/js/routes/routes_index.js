var ROUTES_INDEX = {"name":"<root>","kind":"module","className":"AppModule","children":[{"name":"appRoutes","filename":"src/app/app.routing.module.ts","module":"AppRoutingModule","children":[{"path":"home","component":"HomeComponent"},{"path":"square","loadChildren":"./square/square.module#SquareModule"},{"path":"fact","loadChildren":"./fact/fact.module#FactModule","children":[{"kind":"module","children":[{"name":"routs","filename":"src/app/fact/fact.routing.module.ts","module":"FactRoutingModule","children":[{"path":"","component":"ContainerComponent"}],"kind":"module"}],"module":"FactModule"}]},{"path":"community","loadChildren":"./community/community.module#CommunityModule","children":[{"kind":"module","children":[{"name":"routs","filename":"src/app/community/community.routing.module.ts","module":"CommunityRoutingModule","children":[{"path":"","component":"ContainerComponent"}],"kind":"module"}],"module":"CommunityModule"}]},{"path":"doc","loadChildren":"./document/document.module#DocumentModule","children":[{"kind":"module","children":[{"name":"routs","filename":"src/app/document/document.routing.module.ts","module":"DocumentRoutingModule","children":[{"path":"","component":"ContainerComponent"}],"kind":"module"}],"module":"DocumentModule"}]},{"path":"management","loadChildren":"./management/management.module#ManagementModule","canLoad":[],"children":[{"kind":"module","children":[{"name":"routs","filename":"src/app/management/management.routing.module.ts","module":"ManagementRoutingModule","children":[{"path":"","component":"ContainerComponent"}],"kind":"module"}],"module":"ManagementModule"}]},{"path":"auth","loadChildren":"./auth/auth.module#AuthModule","children":[{"kind":"module","children":[],"module":"AuthModule"}]},{"path":"dashboard","loadChildren":"./dashboard/dashboard.module#DashboardModule","children":[{"kind":"module","children":[],"module":"DashboardModule"}]},{"path":"","redirectTo":"/home","pathMatch":"full"},{"path":"**","component":"HomeComponent"}],"kind":"module"}]}
