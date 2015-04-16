'use strict';

function App(config) {
  this.config = config;
  this.element = undefined;
  this.vtree = undefined;
  this.dispatching = 0;
}
App.prototype.render = function(eventType) {
  var newVtree = this.config.view.call(this, eventType);
  var diff = vd.diff(this.vtree, newVtree);
  this.vtree = newVtree;
  var that = this;
  requestAnimationFrame(function update() {
    that.element = vd.patch(that.element, diff);
  });
};
App.prototype.run = function(parentElement) {
  this.vtree = this.config.view.call(this, 'run');
  this.element = vd.create( this.vtree );
  parentElement.appendChild(  this.element );
  parentElement.app = this;

  for (var i in this.config.router) {
    parentElement.addEventListener(i, this.config.router[i]);
  }
};
App.prototype.dispatch = function(eventType, event) {
  this.dispatching++;
  this.config.model[eventType].call(this,event);
  this.dispatching--;
  if (this.dispatching === 0) this.render(eventType);
};
