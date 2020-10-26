import { log } from "../lib";
import { getConfig } from "./api/lib/config";
import nodemailer from "nodemailer";
import mailgunConstructor from "mailgun-js";

const mailgun =
  getConfig("MAILGUN_API_KEY") &&
  getConfig("MAILGUN_DOMAIN") &&
  mailgunConstructor({
    apiKey: getConfig("MAILGUN_API_KEY"),
    domain: getConfig("MAILGUN_DOMAIN")
  });

const nodeMailerConfig = {
  host: "localhost",
  port: 25,
  secure: false,
  ignoreTLS: true
};

const sender =
  getConfig("MAILGUN_API_KEY") && getConfig("MAILGUN_DOMAIN")
    ? {
        sendMail: ({ from, to, subject, replyTo, text, html }) =>
          mailgun.messages().send(
            {
              from,
              "h:Reply-To": replyTo,
              to,
              subject,
              ...(html ? { html } : { text })
            },
            err => {
              if (err) log.debug(err.message);
            }
          )
      }
    : nodemailer.createTransport(nodeMailerConfig);

export const sendEmail = async ({ to, subject, text, html, replyTo }) => {
  log.info(`Sending e-mail to ${to} with subject ${subject}.`);

  if (process.env.NODE_ENV === "development") {
    log.debug(`Would send e-mail with subject ${subject} and text ${text}.`);
    return null;
  }

  const params = {
    from: getConfig("EMAIL_FROM"),
    to,
    subject,
    text,
    html
  };

  if (replyTo) {
    params["replyTo"] = replyTo;
  }
  return sender.sendMail(params);
};
