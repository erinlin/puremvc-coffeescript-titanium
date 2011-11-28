###
# PureMVC CoffeeScript edition for Titanium by Erin Lin <erinylin@gmail.com>
# 
# PureMVC - Copyright(c) 2006-2011 Futurescale, Inc., Some rights reserved.
# Your reuse is governed by the Creative Commons Attribution 3.0 License
###

((global)->
  ###
    Facade
  ###
  class Facade

    instance = null
    view : null
    model : null
    controller : null

    constructor: (args) ->
        throw Error(Facade.SINGLETON_MSG) if instance
        @initializeFacade()

    initializeFacade: ->
        @initializeModel()
        @initializeController()
        @initializeView()

    initializeModel: -> 
        @model ?= Model.getInstance() 

    initializeController: ->
        @controller ?= Controller.getInstance()  

    initializeView: ->
        @view ?= View.getInstance()

    registerCommand: (name, commandClassRef) ->
        @controller.registerCommand name, commandClassRef
  
    removeCommand: (name)->
        @controller.removeCommand name
  
    hasCommand: (name)->
        @controller.hasCommand name

    retrieveProxy:(proxyName)->
        @model.retrieveProxy proxyName

    removeProxy:(proxyName)->
        @model.removeProxy proxyName

    hasProxy:(proxyName)->
        @model.hasProxy proxyName

    registerProxy:(proxy)->
        @model.registerProxy proxy

    retrieveMediator:(mediatorName)->
        @view.retrieveMediator mediatorName

    removeMediator:(mediatorName)->
        @view.removeMediator mediatorName

    hasMediator:(mediatorName)->
        @view.hasMediator mediatorName

    registerMediator:(mediatorName)->
        @view.registerMediator mediatorName

    sendNotification:(name, body, type)->
        @notifyObservers new Notification name,body,type

    notifyObservers:(note)->
        @view.notifyObservers note

    @getInstance = ->
        instance ?= new Facade()

    @SINGLETON_MSG = "Facade Singleton already constructed!"

  ###
      Controller
  ###
  class Controller
    instance = null
    view: null
    commandMap: null
    constructor: ->
        throw Error(Controller.SINGLETON_MSG) if instance
        @commandMap = {}
        @initializeController()

    initializeController: ->
        @view = View.getInstance()

    executeCommand: (note) ->
        commandClassRef = @commandMap[note.getName()]
        if commandClassRef 
            command = new commandClassRef()
        command.execute note if command.execute

    registerCommand: (name, commandClassRef) ->
        @view.registerObserver name,  @commandMap[name] or new Observer @executeCommand, this
        @commandMap[name] = commandClassRef

    hasCommand: (name) ->
        @commandMap[name]?

    removeCommand: (name) ->
      if @hasCommand(name) then @view.removeObserver name, this

    @SINGLETON_MSG = "Controller Singleton already constructed!"

    @getInstance = ->
        instance ?= new Controller()
      
  ###
  Proxy
  ###

  class Model
    instance = null
    proxyMap : null
    constructor: ->
      throw Model.SINGLETON_MSG if instance
      @proxyMap = {}
      @initializeModel()
  
    registerProxy: (proxy)->
      @proxyMap[proxy.getProxyName()] = proxy
      proxy.onRegister()
    
    retrieveProxy: (proxyName)->
      @proxyMap[proxyName] or null
  
    hasProxy: (proxyName)->
      @proxyMap[proxyName]?
  
    removeProxy: (proxyName)->
      proxy = @proxyMap[proxyName]
      return null unless proxy
      delete @proxyMap[proxyName]
      proxy.onRemove()
      proxy
    
    initializeModel: ->
    
    @SINGLETON_MSG : "Model Singleton already constructed!"
  
    @getInstance : ->
      instance ?= new Model()
    
  ###
  View
  ###
  class View
    instance = null
    mediatorMap : null
    observerMap : null
  
    constructor: ->
      throw View.SINGLETON_MSG if instance
      @mediatorMap = {}
      @observerMap = {}
      @initializeView()

    initializeView: ->
    
    registerObserver: (name, observer)->
      @observerMap[name] ?= []
      @observerMap[name].push observer
      #trace "registerObserver:"+ @observerMap
  
    notifyObservers: (note)->
      observerRef =  @observerMap[note.getName()]
      if observerRef 
        observers = observerRef[0...]
        observer.notifyObserver note for observer in observers
      null
  
    removeObserver:(name, notifyContext)->
      observers = @observerMap[name]
      result = []
      for observer, i in observers
        if observer.compareNotifyContext notifyContext
          observers.splice i, 1
          break
      delete @observerMap[name] if observers.length < 1
    
    registerMediator :(mediator)->
      name = mediator.getMediatorName()
      return null if @mediatorMap[name]
      @mediatorMap[name] = mediator
      interests = mediator.listNotificationInterests()
      if interests.length > 0 
        observer = new Observer mediator.handleNotification, mediator
        @registerObserver v, observer for v in interests
      mediator.onRegister()
    
    retrieveMediator:(mediatorName)->
      @mediatorMap[mediatorName] or null
    
    hasMediator:(mediatorName)->
      @mediatorMap[mediatorName]?
  
    removeMediator:(mediatorName)->
      mediator = @mediatorMap[mediatorName]
      return null if not mediator
      @removeObserver v, mediator for v in mediator.listNotificationInterests()
      delete @mediatorMap[mediatorName]
      mediator.onRemove()
      mediator
  
    @SINGLETON_MSG: "View Singleton already constructed!"
  
    @getInstance: ->
       instance ?= new View()
     
  ###
  Notification
  ###
  class Notification
    constructor: (@name, @body, @type) ->
  
    getName : -> @name
  
    setBody: (@body) ->

    getBody: -> @body  

    setType: (@type) ->

    getType: -> @type
  
    toString:->
      "Notification Name: #{@name}
      \nBody: #{@body or null}
      \nType: #{@type or null}"
    
  ###
  Notifier
  ###
  class Notifier
    facade : null
    constructor: ->
      @facade = Facade.getInstance()
  
    sendNotification: (name, body, type)->
      @facade.sendNotification name, body, type
    
  ###
  Observer
  ###
  class Observer
    constructor:(notifyMethod, notifyContext)->
      @setNotifyMethod notifyMethod
      @setNotifyContext notifyContext
  
    setNotifyMethod:(@notify)->
      
    getNotifyMethod: -> @notify

    setNotifyContext:(@context)->
      
    getNotifyContext: -> @context
  
    notifyObserver: (note)->
      @getNotifyMethod().call @getNotifyContext(), note
  
    compareNotifyContext:(obj)->
     obj is @getNotifyContext()

  ###
  MacroCommand
  ###
  class MacroCommand extends Notifier
    subCommands : null
    constructor: ->
      super()
      @subCommands = []
      @initializeMacroCommand();
  
    initializeMacroCommand:->
  
    addSubCommands :(commandClassRef)->
      subCommands.push commandClassRef
  
    execute:(note)->
      new commandClassRef().execute note for commandClassRef in subCommands
      null

  ###
  SimpleCommand
  ###
  class SimpleCommand extends Notifier
    execute:(note)->
    
  ###
  Mediator
  ###
  class Mediator extends Notifier
    NAME : 'Mediator'
    constructor: (@mediatorName = @NAME , @viewComponent) ->
      super()
    
    listNotificationInterests: -> []
    handleNotification:(note)->
    onRegister:->
    onRemove:->
  
    getMediatorName:-> @mediatorName
  
    getViewComponent: -> @viewComponent
    
    setViewComponent:(@viewComponent)->
    
  class Proxy extends Notifier
    NAME: 'Prxoy'
    constructor:(@proxyName=@NAME, @data)-> super()
  
    getProxyName:-> @proxyName
  
    setData:(@data)->
    getData: -> @data
  
    onRegister:->
    onRemove:->
    
  global.Puremvc =
    facade: Facade.getInstance()
    Mediator: Mediator
    SimpleCommand : SimpleCommand
    MacroCommand : MacroCommand
    Notification : Notification
    Proxy : Proxy
    Notifier : Notifier
  
) this