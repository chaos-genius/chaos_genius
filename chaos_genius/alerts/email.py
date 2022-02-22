import smtplib
import traceback
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from chaos_genius.alerts.alert_channel_creds import get_creds

# TODO: Need little refactoring


EMAIL_HOST = None
EMAIL_HOST_PORT = None
EMAIL_HOST_USER = None
EMAIL_HOST_PASSWORD = None
EMAIL_SENDER = None
DEBUG = False

TEMPLATE_DIR = "chaos_genius/alerts/templates"
EMAIL_TEMPLATE_MAPPING = {"STATIC_ALERT": "static_alert.html"}


def init_smtp_server():
    """Initiate the SMTP server

    Raises:
        Exception: Raise if env variable not found
        Exception: Raise if server connection failed

    Returns:
        obj: SMTP server object
    """
    if not (EMAIL_HOST and EMAIL_HOST_PASSWORD and EMAIL_HOST_USER):
        raise Exception("SMTP ENV Variable not found...")

    retry_count = 0

    def connect_smtp(retry_count):
        server = None
        try:
            retry_count += 1
            server = smtplib.SMTP(EMAIL_HOST, EMAIL_HOST_PORT)
            server.ehlo()
            server.starttls()
            # stmplib docs recommend calling ehlo() before & after starttls()
            server.ehlo()
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        except Exception as err_msg:
            print("Error: ", err_msg)
            print("Retrying again to connect...")
            if retry_count < 4:
                server = connect_smtp(retry_count)
        return server

    server = connect_smtp(retry_count)
    if not server:
        raise Exception("SMTP Connection Failed...")
    return server


def send_email(recipient_emails, message, count=0):
    """send the email to the provided recipients

    Args:
        recipient_emails (list): List of emails
        message (MIMEMultipart): email MIMEMultipart object
        count (int, optional): Retry count for the emails. Defaults to 0.
    """
    count += 1
    try:
        if DEBUG:
            # TODO: Remove this
            toaddr = ["no-reply@chaosgenius.io"]
        else:
            toaddr = recipient_emails

        server = init_smtp_server()
        server.sendmail(EMAIL_SENDER, toaddr, message.as_string())
        server.quit()
        print("Email sent to " + ", ".join(toaddr))
    except smtplib.SMTPServerDisconnected:
        print(f"Retry ({count}) for the email")
        if count < 3:
            send_email(recipient_emails, message, count)
        else:
            print("Email Sending Failed after max retries")
    except Exception:
        print(traceback.format_exc())


def initialize_env_variables():
    global EMAIL_HOST
    global EMAIL_HOST_PORT
    global EMAIL_HOST_USER
    global EMAIL_HOST_PASSWORD
    global EMAIL_SENDER
    global DEBUG
    creds = get_creds("email")
    (
        EMAIL_HOST,
        EMAIL_HOST_PORT,
        EMAIL_HOST_USER,
        EMAIL_HOST_PASSWORD,
        EMAIL_SENDER,
    ) = creds


def send_static_alert_email(
    recipient_emails, subject, messsage_body, alert_info, files=[]
):
    """Send the static event alert email with the CSV attachment

    Args:
        recipient_emails (list): List of emails
        subject (str): Subject of the email
        messsage_body (str): Main configurable body text
        alert_info (dict): alert information
        files (list, optional): List of the files with the file name and file data as base64. Defaults to [].

    Returns:
        bool: status of the email
    """
    status = False
    initialize_env_variables()

    try:
        message = MIMEMultipart()
        message["From"] = EMAIL_SENDER
        message["To"] = ",".join(recipient_emails)
        message["Subject"] = subject

        msgAlternative = MIMEMultipart("alternative")
        # msgText = MIMEText(parsed_template, 'html')
        msgText = MIMEText(
            messsage_body, "html"
        )  # TODO: To be changed according to use
        msgAlternative.attach(msgText)
        message.attach(msgAlternative)

        for file_detail in files:
            fname = file_detail["fname"]
            fdata = file_detail["fdata"]
            attachment = MIMEApplication(fdata, fname)
            attachment["Content-Disposition"] = 'attachment; filename="{}"'.format(
                fname
            )
            message.attach(attachment)

        send_email(recipient_emails, message)
        status = True
    except Exception as err_msg:
        print(err_msg)

    return status
