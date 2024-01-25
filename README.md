# RingCentral Conference Demo

- Ref: https://developers.ringcentral.com/guide/voice/conference#request
- Ref: https://medium.com/@tylerlong/host-a-ringcentral-conference-by-invoking-api-cc92bd7e6179

## Setup

Rename `.env.sample` to `.env` and specify credentials.

Please note that, the user credentials are the conference host's credentials.

```
yarn install
yarn test
```

## Test

Call the conference host's phone number. If there is no conference ongoing, a conference will be created automatically.

Anybody who call the conference hosts' phone number will join the conference automatically.
