*name not final*

A simple js reactive framework for managing an app. Uses `virtual-dom` to update the DOM but may make that optional in the future. Inspired by [Bloop](http://jlongster.com/Removing-User-Interface-Complexity,-or-Why-React-is-Awesome) and ideas from [this article](http://futurice.com/blog/reactive-mvc-and-the-virtual-dom/). An emphasis has been placed on minimalism partly so that the resulting dependency is small and partly as an educational exercise.

Conceptual Model
================

Assuming you have a document that represents some state, you need a way to handle user actions. This framework supports the following method of handling user actions:

* use the DOM event to process the user action into useful information;
* use the useful information to modify the application state;
* use the modified state to rerender the views.

The framework handles connecting DOM events to your handlers/router, connecting your router to your models, potentially your models to your models, then your models to your views.

Usage
=====

An example app that takes Input events from the dom caused by a user entering into an `<input>` tag and renders a `<p>` tag with the contents.

```
<html>
  <head>
    <script src="/lib/virtualDom.js"></script>
    <script src="/lib/simple-reactive.js"></script>
    <script>
      var vd = virtualDom;
      document.addEventListener("DOMContentLoaded", function() {
        var app = new App({
          state: {
            name: 'World'
          },
          view: function() {
            return vd.h('div', [
              vd.h('label', {
                for: 'name',
                attributes: { 'data-ev-input' : 'name' }
              }, 'Name'),
              vd.h('input', {
                name: 'name',
                value: this.config.state.name,
              }),
              vd.h('p', 'Hello, ' + this.config.state.name)
            ]);
          },
          router: {
            input: function(e) {
              if (e.target.dataset.evClick === 'name') {
                this.app.dispatch('updateMsg', e.target.value);
              }
            }
          },
          model: {
            updateMsg: function(value) {
              this.config.state.name = value;
            }
          }
        }).run(window.viewport);
      });
    </script>
  <body>
    <div id=viewport></div>
  </body>
</html>
```

API
===

The constructor `App` takes a configuration object with the following keys:

* `state`: A json object that represents your application state when the page app first loads.
* `view`: A function with the `this` value set to the above `state` value.
* `router`: An object where each key is an event that will be listened to on the application root element. The value that each key corresponds to is a function with the `this` value set to the application root element. The app is set as a property on the element as `this.app`. `dispatch()` takes a model name and an object that is sent to the model.
* `model`: An object where each key corresponds to a name that can be `dispatch`ed to by a router handler. The value is the function that is executed


Why
===

Some subjective opinions will assert that a uni-directional data flow model is simpler to understand. There are also some nice properties that fall forth from the restriction. Since you can write your views as functions from a JSON object to some html you can render them on the server just like you would with React views. This also makes loading saved state from `localStorage` almost trivial provided you aren't putting functions in your state.

Also the first working prototype of this framework was under 30 lines of code. That is, the hello world example above is functionally with less that 30 simple lines of infrastructure. There's real value in being able to understand the entirety of your code's execution path.

Problems
========

* The router is too basic
  * The router gives you the raw DOM event. You can make a decision about how you want to route DOM events into your models.
* Why do the views and models have `this` set to the app object but routers have it set to the root dom element?
  * Early on a decision was made that loose coupling was important. This meant that the two simplest ways for the framework to make the app accessible from with the views and models was creating a closure over the app or calling `Function.prototype.bind` to do the same thing. However this would mean that the functions being added as event listeners did not share a reference with the functions written by the user. You might not care about that unless you wanted to call `element.removeEventListener`. Since the `this` object was set to the root dom element anyway it's pretty simple to make a single reference on the element to app.
* Ok, so why don't you make the `this` value for the models and the views the same as the router?
  * That might yet happen.

Possible Todos
==============

* It seems likely possible that the views could be structured in such a way that a dependency on subsections of the state can be set so that views are only recalculated if a model modifies state relevant to them.
* Currently `dispatch` assumes that models are synchronous. Having the model -> state -> view dependency made explicit as described above might make it simple to have asynchronous models. (You can currently put async code in your models it'll just trigger a rerender before anything has changed)
* Maybe allowing router keys to be space delimited events would be good enough for some.
* Being able to use raw js in the view may sometimes be adequate so the VDom dependency should be optional.
