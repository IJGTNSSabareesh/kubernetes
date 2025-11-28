package com.example.online_ticket_booking.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.online_ticket_booking.entity.User;
import com.example.online_ticket_booking.repository.UserRepository;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173") 
public class AdminController {

    private final UserRepository userRepo;

    @Autowired // <-- Add @Autowired to the constructor
    public AdminController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/users")
    public Map<String, Object> users() {
        List<User> userList = userRepo.findAll();
        return Map.of("users", userList);
    }
}