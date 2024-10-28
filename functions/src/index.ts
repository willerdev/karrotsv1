import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendNotification = functions.https.onCall(
  async (request: functions.https.CallableRequest<any>) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId, title, body, click_action } = request.data;

    try {
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      const fcmToken = userDoc.data()?.fcmToken;

      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title,
            body,
          },
          webpush: {
            notification: {
              icon: '/logo192.png',
              click_action
            }
          }
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new functions.https.HttpsError('internal', 'Error sending notification');
    }
  }
);
