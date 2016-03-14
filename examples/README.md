# Examples

Examples for using RxUI with various front ends can be found in this folder.

Because of the detatched nature of RxUI, and the premise of View Models themselves, each of the example projects will use 
the exact same View Models, Services, and Domain Models. 
The rest of each application will be built using their respective front end framework.
Hopefully this will demonstrate the value in properly separating object roles in your applications. 

The example applications are modeled after the famous [TodoMVC](http://todomvc.com/).

## Structure

- `core` (In Progress)
    - Contains all of the framework-independent code. This includes services, view models, models, and any related tests.
- `angular`*
    - An Implementation of TodoMVC with [AngularJS 1.0](https://angularjs.org/).
- `angular2`*
    - An Implementation of TodoMVC with [Angular 2.0](https://angular.io/).
- `react`*
    - An Implementation of TodoMVC with [React](https://facebook.github.io/react/).
- `ember`*
    - An implementation of TodoMVC with [Ember.js](http://emberjs.com/).
    
_*Planned for Development_
    
All of the implementations will use the `core` project to drive the logic of the application. 
This way, it can be quite easy to guarentee the same behavior across all of the different implementations.