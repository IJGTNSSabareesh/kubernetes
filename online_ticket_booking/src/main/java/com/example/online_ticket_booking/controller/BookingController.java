package com.example.online_ticket_booking.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.online_ticket_booking.entity.Booking;
import com.example.online_ticket_booking.repository.BookingRepository;

@RestController
@RequestMapping("/bookings")
@CrossOrigin(origins = "http://localhost:5173") 
public class BookingController {

    private final BookingRepository bookingRepo;

    @Autowired
    public BookingController(BookingRepository bookingRepo) {
        this.bookingRepo = bookingRepo;
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Booking booking) {
        booking.setPaymentStatus("SUCCESS");
        Booking saved = bookingRepo.save(booking);
        return Map.of("bookingId", saved.getId(), "paymentStatus", saved.getPaymentStatus());
    }
}