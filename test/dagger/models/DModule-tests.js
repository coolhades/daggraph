import test from 'ava';
import assert from 'assert';
const DModule = require('./../../../src/dagger/models/DModule');

// Test data
const javaFileModulePath = process.cwd() + "/test/data/java_dagger_default/app/src/main/java/iammert/com/dagger_android_injection/di/AppModule.java";
const kotlinFileModulePath = process.cwd() + "/test/data/kotlin_dagger_default/app/src/main/java/org/loop/example/AndroidModule.kt";

/* start ################################### Java ################################### */

test("GIVEN java module WHEN init THEN correct dependencies found", t => {

    // Given
    const expectedDependencies = ["Resources", "String", "String"];
    const daggerModule = new DModule("name");

    // When
    daggerModule.init(javaFileModulePath);

    // Then
    t.is(daggerModule.dependencies.length, expectedDependencies.length);
    daggerModule.dependencies.forEach(dep => assert(expectedDependencies.includes(dep.name)));
});

test("GIVEN java module WHEN init THEN named attribute saved", t => {
    
    // Given
    const daggerModule = new DModule("name");

    // When
    daggerModule.init(javaFileModulePath);

    // Then
    t.is(daggerModule.dependencies[1].named, "String1 test");
    t.is(daggerModule.dependencies[2].named, "String2");
});

test("GIVEN java module WHEN init THEN correct dependencies of dependency found", t => {
    
    // Given
    const daggerModule = new DModule("name");

    // When
    daggerModule.init(javaFileModulePath);

    // Then
    t.is(daggerModule.dependencies[0].dependencies.length, 1);
    t.is(daggerModule.dependencies[0].dependencies[0].name, "Context");
});

/* end ################################### Java ################################### */

/* start ################################### Kotlin ################################### */

test("GIVEN kotlin module WHEN init THEN correct dependencies found", t => {
    
    // Given
    const expectedDependencies = ["Context", "LocationManager", "String", "String"];
    const daggerModule = new DModule("name");

    // When
    daggerModule.init(kotlinFileModulePath);

    // Then
    t.is(daggerModule.dependencies.length, expectedDependencies.length);
    daggerModule.dependencies.forEach(dep => assert(expectedDependencies.includes(dep.name)));
});

test("GIVEN java module WHEN init THEN named attribute saved", t => {
    
    // Given
    const daggerModule = new DModule("name");

    // When
    daggerModule.init(kotlinFileModulePath);

    // Then
    t.is(daggerModule.dependencies[2].named, "something");
    t.is(daggerModule.dependencies[3].named, "something Else");
});
    
test("GIVEN kotlin module WHEN init THEN correct dependencies of dependency found", t => {
    
    // Given
    const daggerModule = new DModule("name");

    // When
    daggerModule.init(kotlinFileModulePath);

    // Then
    t.is(daggerModule.dependencies[0].dependencies.length, 1);
    t.is(daggerModule.dependencies[0].dependencies[0].name, "Context");
});

/* end ################################### Kotlin ################################### */