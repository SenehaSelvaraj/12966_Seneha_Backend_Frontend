package com.userservice.service;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
 
@Service
public class EmailService {
 
    @Autowired
    private JavaMailSender mailSender;
 
    @Value("${app.mail.from}")
    private String fromEmail;
 
    public void sendTemporaryPasswordEmail(String toEmail, String username, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Your Lost & Found Account — Temporary Password");
        message.setText(
            "Hello " + username + ",\n\n" +
            "An admin has created an account for you on the Lost & Found system.\n\n" +
            "Your login details:\n" +
            "  Username : " + username + "\n" +
            "  Password : " + tempPassword + "\n\n" +
            "Please log in and change your password immediately.\n" +
            "You will be prompted to set a new password on your first login.\n\n" +
            "If you did not expect this email, please contact your administrator.\n\n" +
            "— Lost & Found Team"
        );
        mailSender.send(message);
    }
}
 