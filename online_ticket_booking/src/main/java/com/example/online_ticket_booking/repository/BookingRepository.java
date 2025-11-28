package com.example.online_ticket_booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online_ticket_booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByEventId(Long eventId);
}