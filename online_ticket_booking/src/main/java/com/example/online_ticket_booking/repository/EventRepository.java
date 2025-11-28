package com.example.online_ticket_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online_ticket_booking.entity.Event;

public interface EventRepository extends JpaRepository<Event, Long> {}
