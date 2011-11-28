
Titanium.UI.setBackgroundColor '#000'

Ti.include "puremvc-coffee-1.0.js"

trace = (s)->
  Ti.API.info s

trace "Hello coffeescript with puremvc."

MainWindow = ->
  win = Ti.UI.createWindow
    title: 'Tab 1'
    backgroundColor: '#fff'
  
  label = Ti.UI.createLabel
    color: '#999'
    text: 'Hello Coffeescript & Puremvc!!'
    font: 
      fontSize: '20dp'
      fontFamily: 'Helvetica Neue'
    textAlign: 'center'
    width: 'auto'
  
  win.add label;
  win
  
class MainMediator extends Puremvc.Mediator
  listNotificationInterests: -> ["Hello"]
  
  handleNotification:(note)->
    trace 'MainMediator got "Hello": ' + note

  onRegister:->
    trace 'Mediator onRegister.:' + @getMediatorName()
    # get view component
    @getViewComponent().open()

class StartupCommand extends Puremvc.SimpleCommand
  execute:(note)->
    trace 'startupCommand executed!!!'
    @facade.registerMediator new MainMediator  'MainMediator', new MainWindow()
    # to MainMediator
    @sendNotification "Hello"
    
    
class DemoProxy extends Puremvc.Proxy
  onRegister:->
    trace 'Proxy onRegister.:' + @getProxyName()
    

setTimeout( ->
    Puremvc.facade.registerCommand 'startup', StartupCommand
    Puremvc.facade.registerProxy new DemoProxy 'DemoProxy'
    Puremvc.facade.sendNotification 'startup'  
  200)
