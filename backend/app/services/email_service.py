import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from dotenv import load_dotenv
from app.config import settings, BASE_DIR

logger = logging.getLogger("gvc_notifications")

def get_notification_recipient() -> str:
    env_file = BASE_DIR / ".env"
    if env_file.is_file():
        load_dotenv(env_file, override=True)
    return os.getenv("ADMIN_NOTIFICATION_EMAIL") or getattr(settings, "ADMIN_NOTIFICATION_EMAIL", None) or "contact@gracevictorychurch.org"

def send_notification_email(subject: str, html_content: str, text_content: str, recipient: str = None) -> bool:
    """
    Sends an email notification via SMTP (e.g. Gmail App Password).
    Returns True if sent successfully, False otherwise.
    """
    env_file = BASE_DIR / ".env"
    if env_file.is_file():
        load_dotenv(env_file, override=True)
    to_email = recipient or get_notification_recipient()
    smtp_host = (os.getenv("SMTP_HOST") or getattr(settings, "SMTP_HOST", "smtp.gmail.com")).strip()
    smtp_port = int(os.getenv("SMTP_PORT") or getattr(settings, "SMTP_PORT", 587))
    smtp_user = (os.getenv("SMTP_USER") or getattr(settings, "SMTP_USER", "")).strip()
    smtp_pass = (os.getenv("SMTP_PASSWORD") or getattr(settings, "SMTP_PASSWORD", "")).replace(" ", "").strip()
    
    # For Gmail, sender must match authenticated user to prevent rejection
    if smtp_user and ("@gmail.com" in smtp_user.lower() or smtp_host == "smtp.gmail.com"):
        from_email = smtp_user
    else:
        from_email = getattr(settings, "SMTP_FROM_EMAIL", os.getenv("SMTP_FROM_EMAIL", smtp_user or "notifications@gracevictorychurch.org"))

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Grace Victory Church <{from_email}>"
    msg["To"] = to_email
    msg["Reply-To"] = from_email

    msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    # Log dispatch
    print(f"\n=======================================================")
    print(f"[GVC NOTIFICATION DISPATCHED] To: {to_email}")
    print(f"Subject: {subject}")
    print(f"=======================================================")
    print(text_content)
    print(f"=======================================================\n")

    if not smtp_user or not smtp_pass:
        print(f"⚠️ [SMTP UNCONFIGURED] SMTP_USER and SMTP_PASSWORD missing in backend/.env. Cannot deliver email to {to_email}.")
        logger.warning(f"SMTP not configured (SMTP_USER/SMTP_PASSWORD missing). Notification cannot be delivered to {to_email}.")
        return False

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())
        print(f"✅ [SMTP SUCCESS] Successfully delivered email to {to_email} via {smtp_host}!")
        logger.info(f"Successfully delivered notification email to {to_email}")
        return True
    except Exception as e:
        print(f"❌ [SMTP ERROR] Failed to send email via SMTP to {to_email}: {e}")
        logger.error(f"Failed to send SMTP email to {to_email}: {e}")
        return False


def _build_html_template(badge_title: str, badge_color: str, title: str, details_rows: list, message_text: str) -> str:
    rows_html = "".join([
        f"""
        <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #475569; width: 140px; font-size: 13px; border-bottom: 1px solid #f1f5f9;">{label}</td>
            <td style="padding: 8px 12px; color: #0f172a; font-size: 13px; border-bottom: 1px solid #f1f5f9;">{val}</td>
        </tr>
        """ for label, val in details_rows
    ])

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background-color: #0b192c; padding: 26px 30px; text-align: left;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; font-weight: bold; margin-bottom: 4px;">
                                                Grace Victory Church • Notification Alert
                                            </div>
                                            <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; font-family: Georgia, serif;">
                                                GVC Pastoral & Admin Office
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 30px;">
                                
                                <!-- Category Badge -->
                                <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; background-color: {badge_color}; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
                                    {badge_title}
                                </div>

                                <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #0f172a; font-family: Georgia, serif;">
                                    {title}
                                </h2>

                                <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                                    A new submission was just received on the church website. Full details are presented below:
                                </p>

                                <!-- Details Table -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                                    {rows_html}
                                </table>

                                <!-- Message Box -->
                                <div style="margin-bottom: 20px;">
                                    <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">
                                        Submitted Message / Request Body:
                                    </div>
                                    <div style="background-color: #fefce8; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; color: #1e293b; font-size: 14px; line-height: 1.6; font-style: italic;">
                                        "{message_text}"
                                    </div>
                                </div>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f1f5f9; padding: 18px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                                    This email alert was automatically sent to <strong>{get_notification_recipient()}</strong> by Grace Victory Church Website.<br>
                                    Grace Victory Church, Vattamalai, Tamil Nadu, India • Established 1998
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def notify_prayer_request(prayer_data: dict, recipient: str = None) -> bool:
    name = prayer_data.get("name") or "Anonymous Intercessor"
    category = prayer_data.get("category", "General Prayer Need")
    request_text = prayer_data.get("request", "")
    is_public = "Public (Shared on Prayer Wall)" if prayer_data.get("is_public") else "Confidential (Pastoral Team Only)"
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    subject = f"[GVC NOTIFICATION] 🙏 New Prayer Request from {name} ({category})"

    details = [
        ("Petitioner Name", f"<strong>{name}</strong>"),
        ("Prayer Category", f"<strong>{category}</strong>"),
        ("Privacy Level", is_public),
        ("Date & Time", now_str),
    ]

    html = _build_html_template(
        badge_title="🙏 New Prayer Request",
        badge_color="#dc2626",
        title=f"New Prayer Request from {name}",
        details_rows=details,
        message_text=request_text
    )

    text = f"""
=====================================================
[GVC NOTIFICATION] NEW PRAYER REQUEST
=====================================================
From: {name}
Category: {category}
Privacy: {is_public}
Received: {now_str}

PRAYER PETITION:
"{request_text}"
=====================================================
"""
    return send_notification_email(subject, html, text, recipient)


def notify_testimony(testimony_data: dict, recipient: str = None) -> bool:
    name = testimony_data.get("name") or "Church Member"
    testimony_type = testimony_data.get("type", "Miraculous Healing")
    location = testimony_data.get("location", "Vattamalai")
    story = testimony_data.get("story", "")
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    subject = f"[GVC NOTIFICATION] 🌟 New Testimony Submitted by {name}"

    details = [
        ("Testifier Name", f"<strong>{name}</strong>"),
        ("Miracle Type", f"<strong>{testimony_type}</strong>"),
        ("City / Location", location),
        ("Date & Time", now_str),
    ]

    html = _build_html_template(
        badge_title="🌟 New Miracle Testimony",
        badge_color="#d97706",
        title=f"New Testimony Shared by {name}",
        details_rows=details,
        message_text=story
    )

    text = f"""
=====================================================
[GVC NOTIFICATION] NEW TESTIMONY OF GOD'S WORK
=====================================================
From: {name}
Miracle Type: {testimony_type}
Location: {location}
Received: {now_str}

TESTIMONY STORY:
"{story}"
=====================================================
"""
    return send_notification_email(subject, html, text, recipient)


def notify_contact_message(contact_data: dict, recipient: str = None) -> bool:
    name = contact_data.get("name") or "Website Visitor"
    email = contact_data.get("email") or "Not provided"
    phone = contact_data.get("phone") or "Not provided"
    subject_category = contact_data.get("subject", "General Inquiry")
    message = contact_data.get("message", "")
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    subject = f"[GVC NOTIFICATION] ✉️ New Serve Message: {subject_category} - from {name}"

    details = [
        ("Visitor Name", f"<strong>{name}</strong>"),
        ("Email Address", f'<a href="mailto:{email}">{email}</a>'),
        ("Phone / WhatsApp", f'<strong>{phone}</strong>'),
        ("Subject Topic", f"<strong>{subject_category}</strong>"),
        ("Date & Time", now_str),
    ]

    html = _build_html_template(
        badge_title="✉️ How Can We Serve You?",
        badge_color="#2563eb",
        title=f"New Message Received from {name}",
        details_rows=details,
        message_text=message
    )

    text = f"""
=====================================================
[GVC NOTIFICATION] NEW "HOW CAN WE SERVE YOU?" MESSAGE
=====================================================
From: {name}
Email: {email}
Phone: {phone}
Subject: {subject_category}
Received: {now_str}

MESSAGE BODY:
"{message}"
=====================================================
"""
    return send_notification_email(subject, html, text, recipient)


def send_password_reset_otp_email(recipient: str, otp: str, user_id: str = "admin") -> bool:
    """Send a secure 6-digit OTP verification email for admin password reset."""
    now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")
    subject = f"[GVC SECURITY] 🔐 Admin Password Reset OTP: {otp}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GVC Admin Password Reset OTP</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 15px;">
            <tr>
                <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                        <!-- Header Banner -->
                        <tr>
                            <td style="background-color: #0b192c; padding: 26px 30px; text-align: left;">
                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; font-weight: bold; margin-bottom: 4px;">
                                    Grace Victory Church • Security Alert
                                </div>
                                <div style="font-size: 20px; font-weight: 800; color: #ffffff; font-family: Georgia, serif;">
                                    Admin Password Reset Code
                                </div>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 30px;">
                                <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                                    Hello Pastor / Church Administrator,
                                </p>
                                <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                                    A request was received to reset the password for your Church Admin Portal account (<strong>{user_id}</strong>). Use the verification code below to authorize this password change:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                                    <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #92400e; margin-bottom: 8px;">
                                        Your 6-Digit One-Time Password (OTP)
                                    </div>
                                    <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #78350f; font-family: monospace;">
                                        {otp}
                                    </div>
                                    <div style="font-size: 12px; color: #b45309; margin-top: 8px;">
                                        ⏱️ Valid for 10 minutes only
                                    </div>
                                </div>

                                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 20px 0 0 0;">
                                    🛡️ <strong>Security Notice:</strong> If you did not request this password reset, no action is needed. Your current password remains safe and unchanged. Do not share this OTP with anyone.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafc; padding: 16px 30px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                                Grace Victory Church, Vattamalai, Tamil Nadu, India • Generated at {now_str}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    text = f"""
=====================================================
[GVC SECURITY] ADMIN PASSWORD RESET VERIFICATION CODE
=====================================================
Hello Pastor / Church Administrator,

A request was received to reset the password for your Church Admin Portal account ({user_id}).

YOUR 6-DIGIT VERIFICATION CODE (OTP):
>>>  {otp}  <<<

Valid for 10 minutes only.

If you did not request this password reset, please ignore this email.
Requested at: {now_str}
=====================================================
"""
    return send_notification_email(subject, html, text, recipient)
