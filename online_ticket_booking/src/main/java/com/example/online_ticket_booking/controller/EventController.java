package com.example.online_ticket_booking.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.online_ticket_booking.entity.Booking;
import com.example.online_ticket_booking.entity.Event;
import com.example.online_ticket_booking.entity.Seat;
import com.example.online_ticket_booking.repository.BookingRepository;
import com.example.online_ticket_booking.repository.EventRepository;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {
    
    @Autowired
    private EventRepository eventRepo;

    @Autowired
    private BookingRepository bookingRepo;
    
    // New method to get all events
    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepo.findAll();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOne(@PathVariable("id") Long id) {
        Event event = eventRepo.findById(id).orElseThrow();

        List<Booking> booked = bookingRepo.findByEventId(id);

        // Correctly get booked seats from the list of bookings
        List<String> bookedSeatNumbers = booked.stream()
                .flatMap(b -> b.getSeats().stream())
                .map(Seat::getSeatNumber)
                .collect(Collectors.toList());

        List<Map<String, Object>> seats = IntStream.rangeClosed(1, event.getTotalSeats())
                .mapToObj(i -> {
                    Map<String, Object> seatMap = new HashMap<>();
                    String seatNumber = "S" + i;
                    seatMap.put("number", seatNumber);
                    seatMap.put("isBooked", bookedSeatNumbers.contains(seatNumber));
                    return seatMap;
                })
                .collect(Collectors.toList());

        return Map.of("event", event, "seats", seats);
    }
}