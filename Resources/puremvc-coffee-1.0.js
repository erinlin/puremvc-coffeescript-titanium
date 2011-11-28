
/*
# PureMVC CoffeeScript edition for Titanium by Erin Lin <erinylin@gmail.com>
# 
# PureMVC - Copyright(c) 2006-2011 Futurescale, Inc., Some rights reserved.
# Your reuse is governed by the Creative Commons Attribution 3.0 License
*/

var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

(function(global) {
  /*
      Facade
  */
  var Controller, Facade, MacroCommand, Mediator, Model, Notification, Notifier, Observer, Proxy, SimpleCommand, View;
  Facade = (function() {
    var instance;

    instance = null;

    Facade.prototype.view = null;

    Facade.prototype.model = null;

    Facade.prototype.controller = null;

    function Facade(args) {
      if (instance) throw Error(Facade.SINGLETON_MSG);
      this.initializeFacade();
    }

    Facade.prototype.initializeFacade = function() {
      this.initializeModel();
      this.initializeController();
      return this.initializeView();
    };

    Facade.prototype.initializeModel = function() {
      var _ref;
      return (_ref = this.model) != null ? _ref : this.model = Model.getInstance();
    };

    Facade.prototype.initializeController = function() {
      var _ref;
      return (_ref = this.controller) != null ? _ref : this.controller = Controller.getInstance();
    };

    Facade.prototype.initializeView = function() {
      var _ref;
      return (_ref = this.view) != null ? _ref : this.view = View.getInstance();
    };

    Facade.prototype.registerCommand = function(name, commandClassRef) {
      return this.controller.registerCommand(name, commandClassRef);
    };

    Facade.prototype.removeCommand = function(name) {
      return this.controller.removeCommand(name);
    };

    Facade.prototype.hasCommand = function(name) {
      return this.controller.hasCommand(name);
    };

    Facade.prototype.retrieveProxy = function(proxyName) {
      return this.model.retrieveProxy(proxyName);
    };

    Facade.prototype.removeProxy = function(proxyName) {
      return this.model.removeProxy(proxyName);
    };

    Facade.prototype.hasProxy = function(proxyName) {
      return this.model.hasProxy(proxyName);
    };

    Facade.prototype.registerProxy = function(proxy) {
      return this.model.registerProxy(proxy);
    };

    Facade.prototype.retrieveMediator = function(mediatorName) {
      return this.view.retrieveMediator(mediatorName);
    };

    Facade.prototype.removeMediator = function(mediatorName) {
      return this.view.removeMediator(mediatorName);
    };

    Facade.prototype.hasMediator = function(mediatorName) {
      return this.view.hasMediator(mediatorName);
    };

    Facade.prototype.registerMediator = function(mediatorName) {
      return this.view.registerMediator(mediatorName);
    };

    Facade.prototype.sendNotification = function(name, body, type) {
      return this.notifyObservers(new Notification(name, body, type));
    };

    Facade.prototype.notifyObservers = function(note) {
      return this.view.notifyObservers(note);
    };

    Facade.getInstance = function() {
      return instance != null ? instance : instance = new Facade();
    };

    Facade.SINGLETON_MSG = "Facade Singleton already constructed!";

    return Facade;

  })();
  /*
        Controller
  */
  Controller = (function() {
    var instance;

    instance = null;

    Controller.prototype.view = null;

    Controller.prototype.commandMap = null;

    function Controller() {
      if (instance) throw Error(Controller.SINGLETON_MSG);
      this.commandMap = {};
      this.initializeController();
    }

    Controller.prototype.initializeController = function() {
      return this.view = View.getInstance();
    };

    Controller.prototype.executeCommand = function(note) {
      var command, commandClassRef;
      commandClassRef = this.commandMap[note.getName()];
      if (commandClassRef) command = new commandClassRef();
      if (command.execute) return command.execute(note);
    };

    Controller.prototype.registerCommand = function(name, commandClassRef) {
      this.view.registerObserver(name, this.commandMap[name] || new Observer(this.executeCommand, this));
      return this.commandMap[name] = commandClassRef;
    };

    Controller.prototype.hasCommand = function(name) {
      return this.commandMap[name] != null;
    };

    Controller.prototype.removeCommand = function(name) {
      if (this.hasCommand(name)) return this.view.removeObserver(name, this);
    };

    Controller.SINGLETON_MSG = "Controller Singleton already constructed!";

    Controller.getInstance = function() {
      return instance != null ? instance : instance = new Controller();
    };

    return Controller;

  })();
  /*
    Proxy
  */
  Model = (function() {
    var instance;

    instance = null;

    Model.prototype.proxyMap = null;

    function Model() {
      if (instance) throw Model.SINGLETON_MSG;
      this.proxyMap = {};
      this.initializeModel();
    }

    Model.prototype.registerProxy = function(proxy) {
      this.proxyMap[proxy.getProxyName()] = proxy;
      return proxy.onRegister();
    };

    Model.prototype.retrieveProxy = function(proxyName) {
      return this.proxyMap[proxyName] || null;
    };

    Model.prototype.hasProxy = function(proxyName) {
      return this.proxyMap[proxyName] != null;
    };

    Model.prototype.removeProxy = function(proxyName) {
      var proxy;
      proxy = this.proxyMap[proxyName];
      if (!proxy) return null;
      delete this.proxyMap[proxyName];
      proxy.onRemove();
      return proxy;
    };

    Model.prototype.initializeModel = function() {};

    Model.SINGLETON_MSG = "Model Singleton already constructed!";

    Model.getInstance = function() {
      return instance != null ? instance : instance = new Model();
    };

    return Model;

  })();
  /*
    View
  */
  View = (function() {
    var instance;

    instance = null;

    View.prototype.mediatorMap = null;

    View.prototype.observerMap = null;

    function View() {
      if (instance) throw View.SINGLETON_MSG;
      this.mediatorMap = {};
      this.observerMap = {};
      this.initializeView();
    }

    View.prototype.initializeView = function() {};

    View.prototype.registerObserver = function(name, observer) {
      var _base, _ref;
      if ((_ref = (_base = this.observerMap)[name]) == null) _base[name] = [];
      return this.observerMap[name].push(observer);
    };

    View.prototype.notifyObservers = function(note) {
      var observer, observerRef, observers, _i, _len;
      observerRef = this.observerMap[note.getName()];
      if (observerRef) {
        observers = observerRef.slice(0);
        for (_i = 0, _len = observers.length; _i < _len; _i++) {
          observer = observers[_i];
          observer.notifyObserver(note);
        }
      }
      return null;
    };

    View.prototype.removeObserver = function(name, notifyContext) {
      var i, observer, observers, result, _len;
      observers = this.observerMap[name];
      result = [];
      for (i = 0, _len = observers.length; i < _len; i++) {
        observer = observers[i];
        if (observer.compareNotifyContext(notifyContext)) {
          observers.splice(i, 1);
          break;
        }
      }
      if (observers.length < 1) return delete this.observerMap[name];
    };

    View.prototype.registerMediator = function(mediator) {
      var interests, name, observer, v, _i, _len;
      name = mediator.getMediatorName();
      if (this.mediatorMap[name]) return null;
      this.mediatorMap[name] = mediator;
      interests = mediator.listNotificationInterests();
      if (interests.length > 0) {
        observer = new Observer(mediator.handleNotification, mediator);
        for (_i = 0, _len = interests.length; _i < _len; _i++) {
          v = interests[_i];
          this.registerObserver(v, observer);
        }
      }
      return mediator.onRegister();
    };

    View.prototype.retrieveMediator = function(mediatorName) {
      return this.mediatorMap[mediatorName] || null;
    };

    View.prototype.hasMediator = function(mediatorName) {
      return this.mediatorMap[mediatorName] != null;
    };

    View.prototype.removeMediator = function(mediatorName) {
      var mediator, v, _i, _len, _ref;
      mediator = this.mediatorMap[mediatorName];
      if (!mediator) return null;
      _ref = mediator.listNotificationInterests();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        this.removeObserver(v, mediator);
      }
      delete this.mediatorMap[mediatorName];
      mediator.onRemove();
      return mediator;
    };

    View.SINGLETON_MSG = "View Singleton already constructed!";

    View.getInstance = function() {
      return instance != null ? instance : instance = new View();
    };

    return View;

  })();
  /*
    Notification
  */
  Notification = (function() {

    function Notification(name, body, type) {
      this.name = name;
      this.body = body;
      this.type = type;
    }

    Notification.prototype.getName = function() {
      return this.name;
    };

    Notification.prototype.setBody = function(body) {
      this.body = body;
    };

    Notification.prototype.getBody = function() {
      return this.body;
    };

    Notification.prototype.setType = function(type) {
      this.type = type;
    };

    Notification.prototype.getType = function() {
      return this.type;
    };

    Notification.prototype.toString = function() {
      return "Notification Name: " + this.name + "      \nBody: " + (this.body || null) + "      \nType: " + (this.type || null);
    };

    return Notification;

  })();
  /*
    Notifier
  */
  Notifier = (function() {

    Notifier.prototype.facade = null;

    function Notifier() {
      this.facade = Facade.getInstance();
    }

    Notifier.prototype.sendNotification = function(name, body, type) {
      return this.facade.sendNotification(name, body, type);
    };

    return Notifier;

  })();
  /*
    Observer
  */
  Observer = (function() {

    function Observer(notifyMethod, notifyContext) {
      this.setNotifyMethod(notifyMethod);
      this.setNotifyContext(notifyContext);
    }

    Observer.prototype.setNotifyMethod = function(notify) {
      this.notify = notify;
    };

    Observer.prototype.getNotifyMethod = function() {
      return this.notify;
    };

    Observer.prototype.setNotifyContext = function(context) {
      this.context = context;
    };

    Observer.prototype.getNotifyContext = function() {
      return this.context;
    };

    Observer.prototype.notifyObserver = function(note) {
      return this.getNotifyMethod().call(this.getNotifyContext(), note);
    };

    Observer.prototype.compareNotifyContext = function(obj) {
      return obj === this.getNotifyContext();
    };

    return Observer;

  })();
  /*
    MacroCommand
  */
  MacroCommand = (function() {

    __extends(MacroCommand, Notifier);

    MacroCommand.prototype.subCommands = null;

    function MacroCommand() {
      MacroCommand.__super__.constructor.call(this);
      this.subCommands = [];
      this.initializeMacroCommand();
    }

    MacroCommand.prototype.initializeMacroCommand = function() {};

    MacroCommand.prototype.addSubCommands = function(commandClassRef) {
      return subCommands.push(commandClassRef);
    };

    MacroCommand.prototype.execute = function(note) {
      var commandClassRef, _i, _len;
      for (_i = 0, _len = subCommands.length; _i < _len; _i++) {
        commandClassRef = subCommands[_i];
        new commandClassRef().execute(note);
      }
      return null;
    };

    return MacroCommand;

  })();
  /*
    SimpleCommand
  */
  SimpleCommand = (function() {

    __extends(SimpleCommand, Notifier);

    function SimpleCommand() {
      SimpleCommand.__super__.constructor.apply(this, arguments);
    }

    SimpleCommand.prototype.execute = function(note) {};

    return SimpleCommand;

  })();
  /*
    Mediator
  */
  Mediator = (function() {

    __extends(Mediator, Notifier);

    Mediator.prototype.NAME = 'Mediator';

    function Mediator(mediatorName, viewComponent) {
      this.mediatorName = mediatorName != null ? mediatorName : this.NAME;
      this.viewComponent = viewComponent;
      Mediator.__super__.constructor.call(this);
    }

    Mediator.prototype.listNotificationInterests = function() {
      return [];
    };

    Mediator.prototype.handleNotification = function(note) {};

    Mediator.prototype.onRegister = function() {};

    Mediator.prototype.onRemove = function() {};

    Mediator.prototype.getMediatorName = function() {
      return this.mediatorName;
    };

    Mediator.prototype.getViewComponent = function() {
      return this.viewComponent;
    };

    Mediator.prototype.setViewComponent = function(viewComponent) {
      this.viewComponent = viewComponent;
    };

    return Mediator;

  })();
  Proxy = (function() {

    __extends(Proxy, Notifier);

    Proxy.prototype.NAME = 'Prxoy';

    function Proxy(proxyName, data) {
      this.proxyName = proxyName != null ? proxyName : this.NAME;
      this.data = data;
      Proxy.__super__.constructor.call(this);
    }

    Proxy.prototype.getProxyName = function() {
      return this.proxyName;
    };

    Proxy.prototype.setData = function(data) {
      this.data = data;
    };

    Proxy.prototype.getData = function() {
      return this.data;
    };

    Proxy.prototype.onRegister = function() {};

    Proxy.prototype.onRemove = function() {};

    return Proxy;

  })();
  return global.Puremvc = {
    facade: Facade.getInstance(),
    Mediator: Mediator,
    SimpleCommand: SimpleCommand,
    MacroCommand: MacroCommand,
    Notification: Notification,
    Proxy: Proxy,
    Notifier: Notifier
  };
})(this);
