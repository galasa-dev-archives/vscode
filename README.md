# Galasa for Visual Studio Code

*This extension is directly linked to the [Java Extension Pack](https://code.visualstudio.com/docs/languages/java) to be able to compile your Java-workspace and to build Galasa-tests using Maven for Java. These will be installed simultaneously with the Galasa extension.*

## Prerequisites

-  [Java JDK 8](https://www.oracle.com/java/technologies/javase-jdk8-downloads.html) is mandatory, any later versions will **not** work
- [Maven](https://maven.apache.org/download.cgi) needs to be installed, any version compatible with JDK 8

## What is Galasa?

[Galasa](https://galasa.dev/) is an open source deep integration test framework for teams looking to give more power to their testers. What makes Galasa a deep integration test framework is its ability to support tests that cross system boundaries and reach into remote layers inaccessible to other testing tools. 

Galasa has been architected to ensure that the routine tasks of writing and executing tests are straightforward. The more complex parts of tests (such as provisioning) are abstracted into other components that can be written by experts and easily distributed to the team.

## Overview of the Galasa extension features

### Generating a testing-environment for running Simbank

**Simbank** is an application written to simulate a Z-environment. It has been created to show of the hybrid and scalable capabilities of the Galasa Framework. 


![TODO]()

Simbank has been built inside the extension the showcase a couple of Galasa capabilities and to be able to start off with writing your own Galasa tests.

You are able to connect with the Simbank-environment using a 3270-emulator and are able to interact with the simbank-environment by running the provisioned Galasa tests.

#### Running Simbank and the very first Galasa tests

1. Click the *rocket-icon* to launch an instance of Simbank running locally on your machine using the Java 8 JDK.

![asdas]()

2. Initialise your Galasa environment *This should have been done during the first launch of the Galasa extension, but can become malformed during runtime of the extension.*

![asdas]()

3. Initialise your workspace with the Simbank manager and the accompanied Galasa tests

![asdas]()

4. First build the SimbankManager using Maven then the SimbankTests

![asdas]()

5. Set up your cps.properties with the correct properties to be able to run one of the provisioned tests. *The cps.properties is used for personalising specific elements for running Galasa Tests.*

![asdas](marketplace/)

6. Run the Simbank tests and now you are able to view the results

### Launching a Galasa Test on your own device

### Launching a Galasa Test on your remote environment

### Viewing all generated test files

### Showing a status overview of your past tests



## License

EPL 2.0