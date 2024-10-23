# <p style="text-align:center"> **sapl-nodejs**</p>

<p align="center">
    <br />
    <a href="https://github.com/heutelbeck/sapl-policy-engine">
        <img src="https://sapl.io/assets/favicon.png" alt="Logo" width="150" >
    </a>
    <span style="display: inline-block; width: 50px;"></span>
    <a href="https://nodejs.org">
        <picture>
            <img src="./img/nodejsStackedDark.svg" width="200">
        </picture>
    </a>
</p>
<a href="https://sonarcloud.io/project/overview?id=heutelbeck_sapl-nodejs" target="_blank"><img src="https://sonarcloud.io/api/project_badges/measure?project=heutelbeck_sapl-nodejs&metric=alert_status" alt="NPM Version" /></a>

<br>

This project provides a client that enables the integration of SAPL in NodeJs.

## **Installation preparations**

Install an appropriate [NodeJs](https://nodejs.org/en) version on your device.

## **Installation**

```PS
# install SAPL for NodeJs

npm i @sapl/sapl-nodejs
```

## **Usage**

### **Prerequisite for using SAPL in NodeJs**

A prerequisite for using SAPL in NodeJs is one of the SAPL servers listed:

- [Server LT](https://github.com/heutelbeck/sapl-policy-engine/tree/master/sapl-server-lt)
- [Server CE](https://github.com/heutelbeck/sapl-server)
- [Server EE](https://github.com/heutelbeck/sapl-server-ee)

### **Decorators**

The SAPL client provides 5 decorators that can be used in the coding.

- [PreEnforce](./src/decorators/PreEnforce.ts)
- [PostEnforce](./src/decorators/PostEnforce.ts.ts)
- [EnforceTillDenied](./src/decorators/EnforceTillDenied.ts)
- [EnforceDropWhileDenied](./src/decorators/EnforceDropWhileDenied.ts)
- [EnforceRecoverableIfDenied](./src/decorators/EnforceRecoverableIfDenied.ts)

There are also framework-specific versions of these generally valid decorators (e.g. [NestJs](./src/decorators/nestjs/)), as the response handling is different. For a more detailed explanation of the decorators, please refer to the [SAPL documentation](https://sapl.io/documentation).

### **Use of decorators**

The decorators supplied are method decorators. In order for the decorators to work properly, the **PDP** must be instantiated in the form of a **remote PDP**.

```TypeScript
public pdp: RemotePdp;

this.pdp = RemotePdp.create().host('https://localhost').port(8443);
```

After the global deployment of the PDP, it can be used for specific credentials or users.

```TypeScript
// simple example of a login routine
if (user) {
    const userAuthorizationData = require("../db/user_auth.json");
    const userAuth = userAuthorizationData.users.find(
        (u) => u.username === user.username
      );

    serviceHandler
      .getRemotePdp()
      .bearerToken(userAuth.sapl_token) // token for SAPL server authorization
      .setUsername(user.username); // username for name of the subject

}
```

The **PDP** must also be provided with the user's authorizations. The **Authorization Manager** must be set for this.

```TypeScript
this.pdp.setAuthorizationManager('http://localhost:3000/users/1/roles');
```

The result of the service should be an array with the authorizations.

```PS
HTTP/1.1 200 OK
X-Powered-By: Express
Vary: Origin
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 33
ETag: W/"21-5BRwB+FgCzXfa3iTJJj0hquEbIo"
Set-Cookie: connect.sid=s%3ALUXSqk0u2pubkx_uvKX-Keqsqax_hjJ9.%2BgPAazqp0k6BsBDgNX8QCTw15stFRaHL4jAeJrnQ1%2B8; Path=/; HttpOnly
Date: Fri, 28 Jun 2024 12:50:08 GMT
Connection: close

[
  "admin",
  "god",
  "editor",
  "viewer"
]
```

### **Using the PDP outside the decorators**

The PDP can also be used outside the decorators. This can be referred to as "manual" use.

```TypeScript
// decide example
this.pdp
    .decide(AuthorizationSubscription.create('user1', 'read', 'resource1'))
    .then((response) => {
        //do something
        console.log(response);
    });
```

Various API paths can be addressed via the corresponding methods:

- **decide**
- **decideOnce**
- **multiDecide**

### **Constraint Handling**

For a more detailed explanation of how constraints work, please refer to the [SAPL documentation](https://sapl.io/documentation).

The central element here is the **ConstraintEnforcementService** class. It searches the project for JavaScript objects that are located in the constraints folder and that have implemented the **ConsumerConstraintHandlerProvider** interface. It is therefore necessary for the obligation and advice handlers to be located in this folder.

For the scanning process to be successful, the project must be linked to the library.

```ps
cd ./node_modules/sapl-nodejs

npm link [target]
```
