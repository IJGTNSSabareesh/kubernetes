# Base image
FROM openjdk:17-jdk-alpine

# Working directory
WORKDIR /app

# Copy the built jar file
COPY target/online_ticket_booking-0.0.1-SNAPSHOT.jar app.jar

# Expose backend port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java","-jar","app.jar"]
