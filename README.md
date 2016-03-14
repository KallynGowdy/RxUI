# RxUI
A Cross-Framework [MVVM](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) framework that utilizes [RxJS](https://github.com/ReactiveX/RxJS) to build declarative, composable, and testable User Interfaces in JavaScript.

Inspired by [ReactiveUI](https://github.com/reactiveui/ReactiveUI) ([website](http://www.reactiveui.net/))

| `master`  | `all` |
| ------------- | ------------- |
| [![wercker status](https://app.wercker.com/status/a2727fbb1085baff0a49e73761a9b7a6/s/master "wercker status")](https://app.wercker.com/project/bykey/a2727fbb1085baff0a49e73761a9b7a6) | [![wercker status](https://app.wercker.com/status/a2727fbb1085baff0a49e73761a9b7a6/s "wercker status")](https://app.wercker.com/project/bykey/a2727fbb1085baff0a49e73761a9b7a6)  |
| [![wercker status](https://app.wercker.com/status/a2727fbb1085baff0a49e73761a9b7a6/m/master "wercker status")](https://app.wercker.com/project/bykey/a2727fbb1085baff0a49e73761a9b7a6) | [![wercker status](https://app.wercker.com/status/a2727fbb1085baff0a49e73761a9b7a6/m "wercker status")](https://app.wercker.com/project/bykey/a2727fbb1085baff0a49e73761a9b7a6)  |


## Installation

```
npm install rxui --save
```

## Usage

### TypeScript (Recommended)

```TypeScript
import {ReactiveObject} from "rxui/reactive-object";
import {ReactiveCommand} from "rxui/reactive-command";
import {Observable} from "rxjs/Observable";

// Example from ReactiveUI Documentation (http://docs.reactiveui.net/en/user-guide/commands/an-example.html)
class LoginViewModel extends ReactiveObject {
    
    public loginCommand: ReactiveCommand<boolean>;
    public resetCommand: ReactiveCommand<boolean>;
    
    constructor() {
        // This is a strongly-typed observable
        // that notifies observers whether the user can login.
        var canLogin = this.whenAnyValue(
            vm => vm.userName,
            vm => vm.password,
            (userName, password) => userName && password
        );
        
        // Creates a command from a function that returns a promise.
        // This command is also strongly-typed, so observed values
        // will see the same results that are returned from this.loginAsync().
        this.loginCommand = ReactiveCommand.createFromTask(
            (a) => this.loginAsync(),
            canLogin
        );
        
        // Creates a synchronous command that just clears the userName and
        // password fields when executed. 
        this.resetCommand = ReactiveCommand.create(() => {
            this.userName = "";
            this.password = "";
        });
    }
    
    loginAsync(): Promise<boolean> {
        // Cool login logic   
    }
    
    // Helper getters and setters that provide us
    // with good type-inference from TypeScript's compiler
    public get userName(): string {
        return this.get("userName");
    }
    
    public set userName(val: string) {
        return this.set("userName", val);
    }
    
    public get password(): string {
        this.get("password");
    }
    
    public set password(val: string) {
        return this.set("password", val);
    }
}
```

### ES5

Comming Soon!

## Examples

Check out the [examples](/examples) folder for a set of demos spanning Angular, Ember, and React, sharing the same core logic between all of them.

## Contributing

If you encounter any issues, [please submit them](https://github.com/KallynGowdy/RxUI/issues). This framework is still very new and very incomplete, so there are bound to be issues :)

Additionally, I've been the only one working on this project, so it can be difficult for me to discover all of the bugs myself.

Finally, if you have suggestions for improvements, I would love to hear them! 
But I would love to review pull requests for your wonderful ideas even more.

Now, before you go and spend a couple hours on a [Pull Request](https://github.com/KallynGowdy/RxUI/pulls), make sure that you create a new issue and get a greenlight so that your
time isn't potentially wasted due to it not being the best fit. 