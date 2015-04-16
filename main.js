'use strict';

function App(config, domInterface) {
  this.config         =  config;
  this.state          =  this.config.state;
  this.element        =  undefined;
  this.vtree          =  undefined;
  this.parentElement  =  undefined;
  this.dispatching    =  0;
  this.vd = domInterface ||
  {
    create: function() {},
    diff:   function() {},
    patch:  function() {}
  };
}
App.prototype.run = function(parentElement) {
  parentElement.app   =  this;
  this.parentElement  =  parentElement;
  this.vtree          =  this.config.view.call(this.parentElement, 'run');
  this.element        =  this.vd.create( this.vtree );
  if (this.element) this.parentElement.appendChild( this.element );

  for (var i in this.config.router) {
    this.parentElement.addEventListener(i, this.config.router[i]);
  }
  return this;
};
App.prototype.dispatch = function(eventType, event) {
  this.dispatching++;
  this.config.model[eventType].call(this.parentElement, event);
  this.dispatching--;
  if (this.dispatching === 0) this.render();
};
App.prototype.render = function() {
  var newVtree = this.config.view.call(this.parentElement);
  var diff     = this.vd.diff(this.vtree, newVtree);
  this.vtree   = newVtree;
  var that     = this;
  if (diff) requestAnimationFrame(function update() {
    that.element = that.vd.patch(that.element, diff);
  });
};
