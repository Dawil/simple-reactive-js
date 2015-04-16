*name not final*

A simple js reactive framework for managing an app. Supports both `virtual-dom` like interfaces for patching elements *and* manual imperative manipulations of the dom. Inspired by [Bloop](http://jlongster.com/Removing-User-Interface-Complexity,-or-Why-React-is-Awesome) and ideas from [this article](http://futurice.com/blog/reactive-mvc-and-the-virtual-dom/). An emphasis has been placed on minimalism partly so that the resulting dependency is small and partly as an educational exercise.

Conceptual Model
================

Assuming you have a document that represents some state, you need a way to handle user actions. This framework supports the following method of handling user actions:

* use the DOM event to process the user action into useful information;
* use the useful information to modify the application state;
* use the modified state to rerender the views.

The framework handles connecting DOM events to your handlers/router, connecting your router to your models, potentially your models to your models, then your models to your views.

Usage
=====

See example.html. Note that two examples are shown, one which uses the `virtual-dom` library to make efficient patches to a dom structure and one which mutates the dom.

In some scenarios it may not be necessary to go as far as using a vdom to efficiently patch elements. However if your needs change after you've already written some code it's handy if you can reuse as much of it as possible. This feature is demonstrated in the demo by the `mkConfig` function which needs only a view to produce a full app.

API
===

The constructor `App` takes a configuration object with the following keys:

* `state`: A json object that represents your application state when the page app first loads.
* `view`: A function with the `this` value set to the above `state` value.
* `router`: An object where each key is an event that will be listened to on the application root element. The value that each key corresponds to is a function with the `this` value set to the application root element. The app is set as a property on the element as `this.app`. `dispatch()` takes a model name and an object that is sent to the model.
* `model`: An object where each key corresponds to a name that can be `dispatch`ed to by a router handler. The value is the function that is executed

It's second optional argument is a vdom interface with a `diff`, `patch` and `create` function that have the same interface as `virtual-dom`'s. In the demo you can see the `virtualDom` object is passed in unmodified.

Why
===

Some subjective opinions will assert that a uni-directional data flow model is simpler to understand. There are also some nice properties that fall forth from the restriction. Since you can write your views as functions from a JSON object to some html you can render them on the server just like you would with React views. This also makes loading saved state from `localStorage` almost trivial provided you aren't putting functions in your state.

Also the first working prototype of this framework was under 30 lines of code. There's real value in being able to understand the entirety of your code's execution path.

Problems
========

* The router is too basic
  * The router gives you the raw DOM event. You can make a decision about how you want to route DOM events into your models.
* How do I get encapsulation? I want to be able to
  * Create a shadowRoot.
* How do I get reuse?
  * Create a custom element.
* Why are all of the events listeners set on the root element?
  * Because of the nature of the rendering. Whether the framework uses `virtual-dom` or it sets the `innerHTML` value conceptually all of the DOM elements are being recreated. Thus their event listeners would need to be reset every time. In the above example I simply decorate elements with `data-` attributes and use that to identify which element caused the event to occur.
* You statically set all of the event listeners at the start. I want to be able to dynamically add and remove event listeners.
  * The functions that are passed to the router object are exactly the functions that are pinned on the root app element. You can at any point call `add/removeEventListener` yourself. However unless you have so many listeners that it's become a performance problem you won't need to do this. In the above example the event listener could be "turned off" simply be not adding the `data-ev-input` attribute to the `<input>` tag.

Possible Todos
==============

* It seems likely possible that the views could be structured in such a way that a dependency on subsections of the state can be set so that views are only recalculated if a model modifies state relevant to them.
* Currently `dispatch` assumes that models are synchronous. Having the model -> state -> view dependency made explicit as described above might make it simple to have asynchronous models. (You can currently put async code in your models it'll just trigger a rerender before anything has changed)
* Maybe allowing router keys to be space delimited events would be good useful.
