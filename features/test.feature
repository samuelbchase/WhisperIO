Feature: Basic Testing
  In order to be a chat application
  As a user
  I want to send and receive messages

   Scenario: emit a message
     Given a chat message
     When I send the message
     Then a friend should receive the message
