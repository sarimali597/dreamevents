import { Notification } from '../models/Notification.js';
import { emitToUser } from '../sockets/io.js';
import { sendEmail } from '../utils/email.js';



export const createNotification = async (input) => {
  const notification = await Notification.create({
  userId: input.userId,
  type: input.type,
  title: input.title,
  body: input.body,
  link: input.link,
  metadata: input.metadata ?? {},
  });

  emitToUser(input.userId, 'notification:new', notification);

  if (input.sendEmail) {
  const sent = await sendEmail(input.sendEmail.to, input.sendEmail.subject, input.sendEmail.html);
  if (sent) {
  await Notification.findByIdAndUpdate(notification._id, {
  isEmailSent: true,
  emailSentAt: new Date(),
  });
  }
  }

  return notification;
};
