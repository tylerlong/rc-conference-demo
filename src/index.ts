import RingCentral from '@rc-ex/core';
import type CallSessionObject from '@rc-ex/core/lib/definitions/CallSessionObject';
import type ExtensionTelephonySessionsEvent from '@rc-ex/core/lib/definitions/ExtensionTelephonySessionsEvent';
import PubNubExtension from '@rc-ex/ws';
import waitFor from 'wait-for-async';
import Softphone from 'ringcentral-softphone';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

let conferenceCreated = false;
let conferenceReady = false;
let conferenceSessionId = '';
const processedTelephonySessionIds = new Set();

const main = async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });

  const softphone = new Softphone({
    username: process.env.SIP_INFO_USERNAME,
    password: process.env.SIP_INFO_PASSWORD,
    authorizationId: process.env.SIP_INFO_AUTHORIZATION_ID,
  });

  const pubnubExtension = new PubNubExtension();
  await rc.installExtension(pubnubExtension);
  await pubnubExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/telephony/sessions'],
    async (event: ExtensionTelephonySessionsEvent) => {
      console.log(JSON.stringify(event, null, 2));
      const telephonySessionId = event.body!.telephonySessionId!;
      if (processedTelephonySessionIds.has(telephonySessionId)) {
        return;
      }
      const parties = event.body!.parties!;
      for (const party of parties) {
        if (
          party.direction === 'Inbound' &&
          party.status?.code === 'Answered' &&
          party.to?.phoneNumber !== 'conference'
        ) {
          if (!conferenceCreated) {
            conferenceCreated = true;
            const r = await rc.post('/restapi/v1.0/account/~/telephony/conference', {});
            const conferenceSession = (r.data as any).session as CallSessionObject;
            console.log(JSON.stringify(conferenceSession, null, 2));
            conferenceSessionId = conferenceSession.id!;
            // make a phone call to the conference voiceCallToken
            softphone.call(conferenceSession.voiceCallToken as unknown as number);
          }
          await waitFor({
            interval: 1000,
            condition: () => conferenceReady,
          });
          const callParty = await rc
            .restapi()
            .account()
            .telephony()
            .sessions(conferenceSessionId)
            .parties()
            .bringIn()
            .post({
              sessionId: telephonySessionId,
              partyId: party.id,
            });
          processedTelephonySessionIds.add(telephonySessionId);
          console.log(JSON.stringify(callParty, null, 2));
        } else if (
          party.direction === 'Outbound' &&
          party.status?.code === 'Answered' &&
          party.to?.phoneNumber === 'conference'
        ) {
          conferenceReady = true;
        }
      }
    },
  );

  await waitFor({ interval: 999999999 }); // don't exit
  await rc.revoke();
};

main();
