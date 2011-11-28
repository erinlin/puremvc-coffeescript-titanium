(function() {
  var DemoProxy, MainMediator, MainWindow, StartupCommand, trace;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Titanium.UI.setBackgroundColor('#000');

  Ti.include("puremvc-coffee-1.0.js");

  trace = function(s) {
    return Ti.API.info(s);
  };

  trace("Hello coffeescript with puremvc.");

  MainWindow = function() {
    var label, win;
    win = Ti.UI.createWindow({
      title: 'Tab 1',
      backgroundColor: '#fff'
    });
    label = Ti.UI.createLabel({
      color: '#999',
      text: 'Hello Coffeescript & Puremvc!!',
      font: {
        fontSize: '20dp',
        fontFamily: 'Helvetica Neue'
      },
      textAlign: 'center',
      width: 'auto'
    });
    win.add(label);
    return win;
  };

  MainMediator = (function() {

    __extends(MainMediator, Puremvc.Mediator);

    function MainMediator() {
      MainMediator.__super__.constructor.apply(this, arguments);
    }

    MainMediator.prototype.listNotificationInterests = function() {
      return ["Hello"];
    };

    MainMediator.prototype.handleNotification = function(note) {
      return trace('MainMediator got "Hello": ' + note);
    };

    MainMediator.prototype.onRegister = function() {
      trace('Mediator onRegister.:' + this.getMediatorName());
      return this.getViewComponent().open();
    };

    return MainMediator;

  })();

  StartupCommand = (function() {

    __extends(StartupCommand, Puremvc.SimpleCommand);

    function StartupCommand() {
      StartupCommand.__super__.constructor.apply(this, arguments);
    }

    StartupCommand.prototype.execute = function(note) {
      trace('startupCommand executed!!!');
      this.facade.registerMediator(new MainMediator('MainMediator', new MainWindow()));
      return this.sendNotification("Hello");
    };

    return StartupCommand;

  })();

  DemoProxy = (function() {

    __extends(DemoProxy, Puremvc.Proxy);

    function DemoProxy() {
      DemoProxy.__super__.constructor.apply(this, arguments);
    }

    DemoProxy.prototype.onRegister = function() {
      return trace('Proxy onRegister.:' + this.getProxyName());
    };

    return DemoProxy;

  })();

  setTimeout(function() {
    Puremvc.facade.registerCommand('startup', StartupCommand);
    Puremvc.facade.registerProxy(new DemoProxy('DemoProxy'));
    return Puremvc.facade.sendNotification('startup');
  }, 200);

}).call(this);
