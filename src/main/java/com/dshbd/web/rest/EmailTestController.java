package com.dshbd.web.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tech.jhipster.config.JHipsterProperties;

@RestController
@RequestMapping("/api/test")
public class EmailTestController {

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public EmailTestController(JavaMailSender mailSender, JHipsterProperties jHipsterProperties) {
        this.mailSender = mailSender;
        this.fromEmail = jHipsterProperties.getMail().getFrom();
    }

    @PostMapping("/email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> testEmail(@RequestParam String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Test Email from MyDashboard");
        message.setText("This is a test email from your MyDashboard application.");

        mailSender.send(message);
        return ResponseEntity.ok().build();
    }
}
