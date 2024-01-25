# RingCentral Conference Demo

- Ref: https://developers.ringcentral.com/guide/voice/conference#request
- Ref: https://medium.com/@tylerlong/host-a-ringcentral-conference-by-invoking-api-cc92bd7e6179


## Setup

```
yarn install
```

Rename `.env.sample` to `.env` and specify credentials.

Please note that, the user credentials are the conference host's credentials.

You do NOT need to specify customer's credentials in the `.env` file.

For the following 3 variables, please check https://github.com/ringcentral/ringcentral-softphone-ts or https://github.com/ringcentral/ringcentral.softphone.net

```
SIP_INFO_USERNAME=
SIP_INFO_PASSWORD=
SIP_INFO_AUTHORIZATION_ID=
```


## Test

```
yarn test
```

Call the conference host's phone number. If there is no conference ongoing, a conference will be created automatically.

Anybody who call the conference hosts' phone number will join the conference automatically.
