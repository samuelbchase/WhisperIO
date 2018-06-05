Feature: Creating an Account
  In order to maintain information between sessions
  As a WhisperIO user
  I want to be able to create an account.

  Scenario: Create an Account
    Given A user without an account
    When They want to use the program
    Then Creates an account for them