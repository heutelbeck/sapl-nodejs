﻿# <p style="text-align:center"> **sapl-nodejs**</p>

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

The central element here is the **ConstraintEnforcementService** class. This class is used to register the implemented constraint handler.

```TypeScript
this.pdp
    .getConstraintEnforcementService()
    .addOnNextConstraintHandler(new LogConstraintHandlerProvider())
    .addOnErrorConstraintHandler(new EmailConstraintHandlerProvider())
    .addMappingConstraintHandler(new CustomReplaceHandlerProvider());
```

Depending on the point at which you want to hook in, the corresponding interface must be used. Here are a few example implementations.

<details>

<summary>ConsumerConstraintHandlerProvider</summary>

```TypeScript
import { ConsumerConstraintHandlerProvider } from '@sapl/sapl-nodejs';

export class LogConstraintHandlerProvider
  implements ConsumerConstraintHandlerProvider
{
    isResponsible(constraint: any): boolean {
        if (constraint['type'] === 'logAccess') {
            return true;
    } else {
        return false;
    }
  }

  getHandler(constraint: object) {
      return () => {
          this.log(constraint['message']);
    };
  }

  log(message: string) {
      console.log(message);
  }
}
```

</details>
<details>
<summary>ErrorHandlerProvider</summary>

```TypeScript
import { ErrorHandlerProvider } from '@sapl/sapl-nodejs';

export class EmailConstraintHandlerProvider implements ErrorHandlerProvider {
  isResponsible(constraint: any): boolean {
    if (constraint['type'] === 'sendMail') {
      return true;
    } else {
      return false;
    }
  }

  getHandler(constraint: object) {
    return () => {
      this.sendEmail(
        constraint['recipient'],
        constraint['subject'],
        constraint['message'],
      );
    };
  }

  sendEmail(recipient: string, subject: string, message: string) {
    console.log(
      'Sending email to ' +
        recipient +
        ' with subject ' +
        subject +
        ' and message ' +
        message,
    );
  }
}
```

</details>
<details>
<summary>MappingConstraintHandlerProvider</summary>

```TypeScript
import { HasPriority } from '@sapl/sapl-nodejs';
import { MappingConstraintHandlerProvider } from '@sapl/sapl-nodejs';

export class CustomReplaceHandlerProvider
  implements MappingConstraintHandlerProvider
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getHandler(constraint: object) {
    const customReplaceConfig = constraint;
    return (content) => {
      return this.customReplaceHandler(content, customReplaceConfig);
    };
  }
  isResponsible(constraint: object): boolean {
    if (constraint['type'] === 'customReplace') {
      return true;
    } else {
      return false;
    }
  }
  getPriority(): number {
    return 0;
  }
  compareTo(other: HasPriority): number {
    return other.getPriority() < this.getPriority()
      ? -1
      : other.getPriority() === this.getPriority()
        ? 0
        : 1;
  }

  customReplaceHandler(content: any, constraint: object) {
    content.data.diagnosis = constraint['replacement'];
    return content;
  }
}
```

</details>
