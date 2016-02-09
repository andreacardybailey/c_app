/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */



/**
 * (1) Core middleware
 *
 * Middleware included with `app.use` is run first, before the router
 */


/**
 * (2) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 * For convenience, you can also connect routes directly to views or external URLs.
 *
 */

module.exports.routes = {

  // By default, your root route (aka home page) points to a view
  // located at `views/home/index.ejs`
  // 
  // (This would also work if you had a file at: `/views/home.ejs`)
  '/': {
    controller: 'MainController',
    action : 'home'
  },
  '/search': {
    controller: 'MainController',
    action : 'search'
  },  
  'get /login'         : 'MainController.login',
  'post /auth/login'   : 'AuthController.login',
  'get /test/promote/:id/:revision' : 'SampleTestController.promote',
  'get /test/share/:id' : 'SampleTestController.share',
  'post /test/share/:id' : 'SampleTestController.share',
  'get /test/preview/:id' : 'SampleTestController.preview',
  
  'get /user/edit/:id' : 'UserController.edit',
  'get /user/profile' : 'UserController.profile',
  'get /user/new'      : 'UserController.new',
  'get /user/list'     : 'UserController.list',
  
  'get /technician/edit/:id' : 'TechnicianController.edit',
  'get /technician/new'      : 'TechnicianController.new',
  'get /technician/list'     : 'TechnicianController.list',
  
  'get /test/new'      : 'SampleTestController.new',
  'get /test/list'     : 'SampleTestController.list',
  'get /test/edit/:id' : 'SampleTestController.edit',  
  
  'get /supplier/new'      : 'SupplierController.new',
  'get /supplier/list'     : 'SupplierController.list',
  'get /supplier/edit/:id' : 'SupplierController.edit',
  
  'get /suppliercontact/new'      : 'SupplierContactController.new',
  'get /suppliercontact/list'     : 'SupplierContactController.list',
  'get /suppliercontact/edit/:id' : 'SupplierContactController.edit',
  
  'get /request/new'       : 'SupplierTestController.new',
  'get /request/edit/:id'  : 'SupplierTestController.edit',
  'get /request/list'      : 'SupplierTestController.list',
  
  'get /sample/new'       : 'SampleController.new',
  'get /sample/edit/:id'  : 'SampleController.edit',
  'get /sample/list'      : 'SampleController.list',
  
  'get /strain/new'       : 'StrainController.new',
  'get /strain/edit/:id'  : 'StrainController.edit',
  'get /strain/list'      : 'StrainController.list',
  
  'get /strainorigin/new'       : 'StrainOriginController.new',
  'get /strainorigin/edit/:id'  : 'StrainOriginController.edit',
  'get /strainorigin/list'      : 'StrainOriginController.list',
  
  'get /sampleorigin/new'       : 'SampleOriginController.new',
  'get /sampleorigin/edit/:id'  : 'SampleOriginController.edit',
  'get /sampleorigin/list'      : 'SampleOriginController.list',
  
  'get /accesspoint/new'       : 'AccessPointController.new',
  'get /accesspoint/edit/:id'  : 'AccessPointController.edit',
  'get /accesspoint/list'      : 'AccessPointController.list',
  
  'get /schema/new'        : 'Schema.new',
  'get /schema/edit/:id'   : 'Schema.edit',
  'get /schema/list'       : 'Schema.list',
  
  'get /facility/new'        : 'Facility.new',
  'get /facility/edit/:id'   : 'Facility.edit',
  'get /facility/list'       : 'Facility.list',

   /*
  'get /schematype/new'        : 'SchemaType.new',
  'get /schematype/edit/:id'   : 'SchemaType.edit',
  'get /schematype/list'       : 'SchemaType.list',

  'get /schemasubtype/new'        : 'SchemaSubtype.new',
  'get /schemasubtype/edit/:id'   : 'SchemaSubtype.edit',
  'get /schemasubtype/list'       : 'SchemaSubtype.list',
  
  'get /testprocess/new'        : 'TestProcess.new',
  'get /testprocess/edit/:id'   : 'TestProcess.edit',
  'get /testprocess/list'       : 'TestProcess.list',
  */
  
  'post /upload/:name' : 'UploadController.create',

  /*
  // But what if you want your home page to display
  // a signup form located at `views/user/signup.ejs`?
  '/': {
    view: 'user/signup'
  }


  // Let's say you're building an email client, like Gmail
  // You might want your home route to serve an interface using custom logic.
  // In this scenario, you have a custom controller `MessageController`
  // with an `inbox` action.
  '/': 'MessageController.inbox'


  // Alternatively, you can use the more verbose syntax:
  '/': {
    controller: 'MessageController',
    action: 'inbox'
  }


  // If you decided to call your action `index` instead of `inbox`,
  // since the `index` action is the default, you can shortcut even further to:
  '/': 'MessageController'


  // Up until now, we haven't specified a specific HTTP method/verb
  // The routes above will apply to ALL verbs!
  // If you want to set up a route only for one in particular
  // (GET, POST, PUT, DELETE, etc.), just specify the verb before the path.
  // For example, if you have a `UserController` with a `signup` action,
  // and somewhere else, you're serving a signup form looks like: 
  //
  //		<form action="/signup">
  //			<input name="username" type="text"/>
  //			<input name="password" type="password"/>
  //			<input type="submit"/>
  //		</form>

  // You would want to define the following route to handle your form:
  'post /signup': 'UserController.signup'


  // What about the ever-popular "vanity URLs" aka URL slugs?
  // (you might remember doing this with `mod_rewrite` in Apache)
  //
  // This is where you want to set up root-relative dynamic routes like:
  // http://yourwebsite.com/twinkletoez
  //
  // NOTE:
  // You'll still want to allow requests through to the static assets,
  // so we need to set up this route to ignore URLs that have a trailing ".":
  // (e.g. your javascript, CSS, and image files)
  'get /*(^.*)': 'UserController.profile'

  */
};



/** 
 * (3) Action blueprints
 * These routes can be disabled by setting (in `config/controllers.js`):
 * `module.exports.controllers.blueprints.actions = false`
 *
 * All of your controllers ' actions are automatically bound to a route.  For example:
 *   + If you have a controller, `FooController`:
 *     + its action `bar` is accessible at `/foo/bar`
 *     + its action `index` is accessible at `/foo/index`, and also `/foo`
 */


/**
 * (4) Shortcut CRUD blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js)
 *			`module.exports.controllers.blueprints.shortcuts = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`,
 * you can access CRUD operations for that model at:
 *		/foo/find/:id?	->	search lampshades using specified criteria or with id=:id
 *
 *		/foo/create		->	create a lampshade using specified values
 *
 *		/foo/update/:id	->	update the lampshade with id=:id
 *
 *		/foo/destroy/:id	->	delete lampshade with id=:id
 *
 */

/**
 * (5) REST blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js)
 *		`module.exports.controllers.blueprints.rest = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`,
 * you can access CRUD operations for that model at:
 *
 *		get /foo/:id?	->	search lampshades using specified criteria or with id=:id
 *
 *		post /foo		-> create a lampshade using specified values
 *
 *		put /foo/:id	->	update the lampshade with id=:id
 *
 *		delete /foo/:id	->	delete lampshade with id=:id
 *
 */

/**
 * (6) Static assets
 *
 * Flat files in your `assets` directory- (these are sometimes referred to as 'public')
 * If you have an image file at `/assets/images/foo.jpg`, it will be made available
 * automatically via the route:  `/images/foo.jpg`
 *
 */



/**
 * (7) 404 (not found) handler
 *
 * Finally, if nothing else matched, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 */
 
