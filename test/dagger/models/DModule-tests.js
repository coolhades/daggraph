import test from 'ava';
import assert from 'assert';
const DModule = require('./../../../src/dagger/models/DModule');

// Test data
const fileModulePath = process.cwd() + "/test/data/java_dagger_default/app/src/main/java/iammert/com/dagger_android_injection/di/AppModule.java";

test("GIVEN java module WHEN init THEN correct dependencies found", t => {

    // Given
    const expectedDependencies = ["Resources", "String", "String"];
    const daggerModule = new DModule("name");

    // When
    daggerModule.init(fileModulePath);

    // Then
    t.is(daggerModule.dependencies.length, expectedDependencies.length);
    daggerModule.dependencies.forEach(dep => assert(expectedDependencies.includes(dep.name)));
});

test("GIVEN java module WHEN init THEN named attribute saved", t => {
    
        // Given
        const expectedDependencies = ["Resources", "String", "String"];
        const daggerModule = new DModule("name");
        const fileModulePath = process.cwd() + "/test/data/java_dagger_default/app/src/main/java/iammert/com/dagger_android_injection/di/AppModule.java";
    
        // When
        daggerModule.init(fileModulePath);
    
        // Then
        t.is(daggerModule.dependencies[1].named, "String1 test");
        t.is(daggerModule.dependencies[2].named, "String2");
});