import {Observable} from "rxjs/Rx";
import {ReactiveObject} from "../src/reactive-object";
import {ReactiveCommand} from "../src/reactive-command";
import {PropertyChangedEventArgs} from "../src/events/property-changed-event-args";
import {expect} from "chai";
import {invokeCommand} from "../src/operator/invoke-command";
import {RxApp} from "../src/rx-app";

describe("invokeCommand()", () => {
    it("should not call executeAsync() on the given command when the command is not executable", () => {
        var callCount = 0;
        
        var obj = new ReactiveObject();
        
        var command = ReactiveCommand.createFromObservable(a => {
            callCount++;
            return Observable.of(true);
        }, obj.whenAnyValue<string>("prop").map(val => val === "value")); // only execute the command when "prop" has been changed to "value"
        
        obj.set("command", command);
        
        obj.invokeCommandWhen(obj.whenAnyValue<string>("prop"), command).subscribe();    
        
        obj.set("prop", "val");
        expect(callCount).to.equal(0);
        
        obj.set("prop", "value");
        expect(callCount).to.equal(1);
    });
    it("should call executeAsync() on the given command with the observed value as the argument", () => {
        var callCount = 0;
        var callParams = [];
        var command = ReactiveCommand.createFromObservable(a => {
            callCount++;
            callParams.push(a);
            return Observable.of(true);
        });
        
        var obj = new ReactiveObject();
        obj.invokeCommandWhen(obj.whenAnyValue<string>("prop"), command).subscribe();    
        
        obj.set("prop", "value");
        expect(callCount).to.equal(1);
        expect(callParams[0]).to.equal("value");
    });
    
    it("should not call executeAsync() on the current command when that command is not executable", () => {
        var callCount = 0;
        
        var obj = new ReactiveObject();
        
        var command = ReactiveCommand.createFromObservable(a => {
            callCount++;
            return Observable.of(true);
        }, obj.whenAnyValue("prop").map(val => val === "value")); // only execute the command when "prop" has been changed to "value"
        
        obj.set("command", command);
        
        obj.invokeCommandWhen(obj.whenAnyValue("prop"), "command").subscribe();    
        
        obj.set("prop", "val");
        expect(callCount).to.equal(0);
        
        obj.set("prop", "value");
        expect(callCount).to.equal(1);  
    });
    
    it("should call executeAsync() on the current command with the observed value as the argument", () => {
        var callCount = 0;
        var callParams = [];
        var command = ReactiveCommand.createFromObservable(a => {
            callCount++;
            callParams.push(a);
            return Observable.of(true);
        });
        
        var obj = new ReactiveObject();
        obj.set("command", command);        
        obj.invokeCommandWhen(obj.whenAnyValue<string>("prop"), "command").subscribe();    
        
        obj.set("prop", "value");
        expect(callCount).to.equal(1);
        expect(callParams[0]).to.equal("value");
    });
});