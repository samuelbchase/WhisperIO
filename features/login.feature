Feature: Login/Logout
  In order to maintain my privacy
  As a WhisperIO user
  I want to be able log into and out of my account

  Scenario: Logging into your account
    Given A logged-out user
    When They want to log in
    Then The system logs them in

  Scenario: Logging out of your account
    Given A User that is logged in
    When They want to log out
    Then The system logs them out