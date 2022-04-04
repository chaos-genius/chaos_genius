"""Utilities for sending emails."""
import logging
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, List, Sequence

from chaos_genius.alerts.alert_channel_creds import get_email_creds

DEBUG = False

TEMPLATE_DIR = "chaos_genius/alerts/templates"
EMAIL_TEMPLATE_MAPPING = {"STATIC_ALERT": "static_alert.html"}


logger = logging.getLogger(__name__)


def init_smtp_server(host: str, port: int, user: str, password: str):
    """Initiate the SMTP server.

    Raises:
        Exception: Raise if env variable not found
        Exception: Raise if server connection failed

    Returns:
        obj: SMTP server object
    """
    retry_count = 0

    def connect_smtp(retry_count: int) -> smtplib.SMTP:
        try:
            retry_count += 1
            server = smtplib.SMTP(host, port)
            server.ehlo()
            server.starttls()
            # stmplib docs recommend calling ehlo() before & after starttls()
            server.ehlo()
            server.login(user, password)
        except smtplib.SMTPException as e:
            logger.error("Error in initializing SMTP connection", exc_info=e)
            if retry_count < 4:
                logger.warn("Retrying SMTP connection")
                server = connect_smtp(retry_count)
            else:
                raise
        return server

    return connect_smtp(retry_count)


def send_email(
    recipient_emails: List[str],
    message: MIMEMultipart,
    host: str,
    port: int,
    user: str,
    password: str,
    sender: str,
    count=0,
):
    """Send the email to the provided recipients.

    Args:
        recipient_emails: List of emails
        message: email MIMEMultipart object
        host: hostname of SMTP server
        port: port number of SMTP server
        user: username to authenticate to SMTP server
        password: password to authenticate to SMTP server
        sender: email sender
        count: Retry count for the emails. Defaults to 0
    """
    count += 1
    try:
        if DEBUG:
            # TODO: Remove this
            toaddr = ["no-reply@chaosgenius.io"]
        else:
            toaddr = recipient_emails

        server = init_smtp_server(host, port, user, password)
        server.sendmail(sender, toaddr, message.as_string())
        server.quit()
        logger.info(f"Email sent to {', '.join(toaddr)}")
    except smtplib.SMTPServerDisconnected:
        logger.info(f"Retry ({count}) for the email")
        if count < 3:
            send_email(
                recipient_emails, message, host, port, user, password, sender, count
            )
        else:
            logger.error("Email Sending Failed after max retries")
            raise


def send_static_alert_email(
    recipient_emails: List[str],
    subject: str,
    messsage_body: str,
    files: Sequence[Dict] = [],
) -> None:
    """Send an alert email with the CSV attachment.

    Args:
        recipient_emails (list): List of emails
        subject (str): Subject of the email
        messsage_body (str): Main configurable body text
        files (list, optional): List of the files with the file name and file data as
            base64. Defaults to [].
    """
    host, port, user, password, sender = get_email_creds()

    message = MIMEMultipart()
    message["From"] = sender
    message["To"] = ",".join(recipient_emails)
    message["Subject"] = subject

    msg_alternative = MIMEMultipart("alternative")
    # msgText = MIMEText(parsed_template, 'html')
    msg_text = MIMEText(messsage_body, "html")  # TODO: To be changed according to use
    msg_alternative.attach(msg_text)
    message.attach(msg_alternative)

    for file_detail in files:
        fname = file_detail["fname"]
        fdata = file_detail["fdata"]
        attachment = MIMEApplication(fdata, fname)
        attachment["Content-Disposition"] = 'attachment; filename="{}"'.format(fname)
        message.attach(attachment)

    send_email(recipient_emails, message, host, port, user, password, sender)
