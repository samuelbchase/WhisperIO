Feature: Adding Friends
  In order to easily contact other users
  As a WhisperIO user
  I want WhisperIO to show a list of "friends" that I commonly contact

  Scenario: Adding Friends: Success
    Given A User testuser1
    When I want to add a friend
    Then That friend is added to my friends list

  Scenario: Adding Friends: Failure
    Given A User testuser1
    When I want to add a friend that I already have as a friend
    Then That friend is not added to my friends list

  Scenario: Adding Friends: Nonexistent User
    Given A User testuser1
    When I want to add a friend that does not exist
    Then That friend is not added to my friends list, and the program tells me the user doesn't exist
