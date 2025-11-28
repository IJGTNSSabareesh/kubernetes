package com.example.online_ticket_booking.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.online_ticket_booking.entity.Event;
import com.example.online_ticket_booking.repository.EventRepository;

@RestController
@RequestMapping("/organizer")
@CrossOrigin(origins = "http://localhost:5173") 
public class OrganizerController {

    private final EventRepository eventRepo;

    @Autowired
    public OrganizerController(EventRepository eventRepo) {
        this.eventRepo = eventRepo;
    }

    @GetMapping("/events")
    public Map<String, Object> myEvents() {
        return Map.of("events", eventRepo.findAll());
    }

    @PostMapping("/events")
    public Event create(@RequestBody Event event) {
        return eventRepo.save(event);
    }
}